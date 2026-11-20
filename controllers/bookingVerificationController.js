import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import BookingVerification from "../models/BookingVerification.js";
import User from "../models/User.js";
import { normalizeIndianPhone } from "../utils/phone.js";
import {
    isSmtpConfigured,
    sendEmailOtp
} from "../services/contactVerificationService.js";

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_DELAY_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const MAX_SENDS_PER_CHALLENGE = 3;

const hashCode = (code) => createHmac("sha256", process.env.JWT_SECRET).update(code).digest("hex");

const codeMatches = (code, codeHash) => {
    if (typeof code !== "string" || !/^\d{6}$/.test(code) || !codeHash) return false;
    const candidate = Buffer.from(hashCode(code));
    const saved = Buffer.from(codeHash);
    return candidate.length === saved.length && timingSafeEqual(candidate, saved);
};

const maskEmail = (email) => {
    const [name, domain] = email.split("@");
    return `${name.slice(0, 1)}***@${domain}`;
};

const recordFailedAttempt = async (challenge) => {
    const updated = await BookingVerification.findOneAndUpdate(
        { _id: challenge._id, consumedAt: null },
        { $inc: { attempts: 1 } },
        { new: true }
    );
    return updated?.attempts || MAX_ATTEMPTS;
};

const invalidCodeResponse = (res, attempts) => res.status(attempts >= MAX_ATTEMPTS ? 429 : 400).json({
    success: false,
    message: attempts >= MAX_ATTEMPTS
        ? "Too many incorrect codes. Request new codes after the resend wait."
        : "One or more verification codes are incorrect."
});

export const startBookingVerification = async (req, res) => {
    if (req.user.role !== "user") {
        return res.status(403).json({ success: false, message: "Only client accounts can verify a booking." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "Account not found." });

    const needsEmail = !user.emailVerifiedAt;
    if (!needsEmail) {
        return res.json({ success: true, verified: true });
    }

    const now = new Date();
    const existing = await BookingVerification.findOne({ user: user._id });
    const hasActiveChallenge = Boolean(existing && existing.expiresAt > now);
    const elapsed = existing ? now.getTime() - existing.lastSentAt.getTime() : RESEND_DELAY_MS;
    if (existing && elapsed < RESEND_DELAY_MS) {
        return res.status(429).json({
            success: false,
            message: "Verification codes were just sent. Please wait before requesting new ones.",
            retryAfterSeconds: Math.ceil((RESEND_DELAY_MS - elapsed) / 1000)
        });
    }
    if (hasActiveChallenge && existing.sendCount >= MAX_SENDS_PER_CHALLENGE) {
        return res.status(429).json({
            success: false,
            message: "Too many verification code requests. Wait for the current codes to expire.",
            retryAfterSeconds: Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000)
        });
    }

    if (!isSmtpConfigured()) {
        return res.status(503).json({ success: false, message: "SMTP is not configured. Add the SMTP settings to the backend environment." });
    }

    const emailCode = String(randomInt(100000, 1000000));
    const challenge = await BookingVerification.findOneAndUpdate(
        { user: user._id },
        {
            $set: {
                emailAddress: user.email,
                phoneNumber: normalizeIndianPhone(user.phone) || user.phone || "",
                phoneOtpSentAt: null,
                needsEmail: true,
                needsPhone: false,
                emailCodeHash: hashCode(emailCode),
                attempts: 0,
                sendCount: existing && existing.expiresAt > now ? Number(existing.sendCount || 0) + 1 : 1,
                lastSentAt: now,
                expiresAt: new Date(now.getTime() + CODE_TTL_MS),
                consumedAt: null
            }
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    try {
        await sendEmailOtp(user.email, emailCode);
    } catch (error) {
        console.error("Booking email verification code could not be sent.", error.message);
        return res.status(502).json({
            success: false,
            message: "The email verification code could not be delivered. Check the SMTP settings, then try again."
        });
    }

    return res.status(202).json({
        success: true,
        verified: false,
        needsEmail: true,
        email: maskEmail(user.email),
        expiresInSeconds: Math.floor(CODE_TTL_MS / 1000)
    });
};

export const confirmBookingVerification = async (req, res) => {
    const challenge = await BookingVerification.findOne({
        user: req.user.id,
        expiresAt: { $gt: new Date() },
        consumedAt: null
    });
    if (!challenge) {
        return res.status(400).json({ success: false, message: "The verification code expired. Request a new code to continue." });
    }
    if (challenge.attempts >= MAX_ATTEMPTS) {
        return res.status(429).json({ success: false, message: "Too many incorrect codes. Request new codes after the resend wait." });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.email !== challenge.emailAddress) {
        await BookingVerification.deleteOne({ _id: challenge._id });
        return res.status(409).json({ success: false, message: "Your account email changed. Request a new verification code." });
    }

    const { emailCode } = req.body || {};
    if (challenge.needsEmail && !codeMatches(emailCode, challenge.emailCodeHash)) {
        return invalidCodeResponse(res, await recordFailedAttempt(challenge));
    }

    const claimed = await BookingVerification.findOneAndUpdate(
        {
            _id: challenge._id,
            consumedAt: null,
            attempts: { $lt: MAX_ATTEMPTS },
            expiresAt: { $gt: new Date() }
        },
        { $set: { consumedAt: new Date() } },
        { new: true }
    );
    if (!claimed) {
        return res.status(409).json({ success: false, message: "This verification request is no longer active. Request new codes." });
    }

    const verifiedAt = new Date();
    await User.updateOne({ _id: user._id }, { $set: { emailVerifiedAt: verifiedAt } });
    await BookingVerification.deleteOne({ _id: challenge._id });

    return res.json({ success: true, message: "Email verified." });
};
