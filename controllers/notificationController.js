import AdminPushSubscription from "../models/AdminPushSubscription.js";
import UserPushSubscription from "../models/UserPushSubscription.js";
import { isPushConfigured } from "../services/pushNotificationService.js";

const isValidSubscription = (subscription) =>
    typeof subscription?.endpoint === "string" &&
    subscription.endpoint.startsWith("https://") &&
    typeof subscription.keys?.p256dh === "string" &&
    typeof subscription.keys?.auth === "string";

const saveSubscription = async (Model, ownerField, ownerId, subscription) => {
    await Model.findOneAndUpdate(
        { endpoint: subscription.endpoint },
        {
            [ownerField]: ownerId,
            endpoint: subscription.endpoint,
            expirationTime: subscription.expirationTime || null,
            keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            }
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
};

export const getPushPublicKey = (_req, res) => {
    if (!isPushConfigured()) {
        return res.status(503).json({
            success: false,
            message: "Push notifications are not configured on this server."
        });
    }

    return res.json({ success: true, publicKey: process.env.VAPID_PUBLIC_KEY });
};

export const subscribeAdminToPush = async (req, res) => {
    const subscription = req.body;
    if (!isPushConfigured()) {
        return res.status(503).json({
            success: false,
            message: "Push notifications are not configured on this server."
        });
    }
    if (!isValidSubscription(subscription)) {
        return res.status(400).json({
            success: false,
            message: "A valid browser push subscription is required."
        });
    }

    await saveSubscription(AdminPushSubscription, "admin", req.user.id, subscription);

    return res.status(201).json({ success: true, message: "Booking notifications enabled." });
};

export const subscribeUserToPush = async (req, res) => {
    const subscription = req.body;
    if (req.user.role !== "user") {
        return res.status(403).json({ success: false, message: "Client access only." });
    }
    if (!isPushConfigured()) {
        return res.status(503).json({
            success: false,
            message: "Push notifications are not configured on this server."
        });
    }
    if (!isValidSubscription(subscription)) {
        return res.status(400).json({
            success: false,
            message: "A valid browser push subscription is required."
        });
    }

    await saveSubscription(UserPushSubscription, "user", req.user.id, subscription);
    return res.status(201).json({ success: true, message: "Booking updates enabled." });
};

export const unsubscribeAdminFromPush = async (req, res) => {
    const endpoint = req.body?.endpoint;
    if (typeof endpoint !== "string" || !endpoint) {
        return res.status(400).json({ success: false, message: "A push subscription endpoint is required." });
    }

    await AdminPushSubscription.deleteOne({ admin: req.user.id, endpoint });
    return res.json({ success: true });
};

export const unsubscribeUserFromPush = async (req, res) => {
    const endpoint = req.body?.endpoint;
    if (req.user.role !== "user") {
        return res.status(403).json({ success: false, message: "Client access only." });
    }
    if (typeof endpoint !== "string" || !endpoint) {
        return res.status(400).json({ success: false, message: "A push subscription endpoint is required." });
    }

    await UserPushSubscription.deleteOne({ user: req.user.id, endpoint });
    return res.json({ success: true });
};
