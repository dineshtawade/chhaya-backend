import nodemailer from "nodemailer";

const MSG91_TIMEOUT_MS = 10000;

const configurationError = (message) => {
    const error = new Error(message);
    error.statusCode = 503;
    return error;
};

const readMsg91Response = async (response) => {
    try {
        return await response.json();
    } catch (error) {
        if (!response.ok) throw new Error(`MSG91 request failed with status ${response.status}.`);
        throw error;
    }
};

export const isMsg91Configured = () => Boolean(
    process.env.MSG91_AUTH_KEY &&
    process.env.MSG91_TEMPLATE_ID
);

export const isSmtpConfigured = () => Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM
);

export const sendEmailMessage = async ({ to, subject, text, html }) => {
    if (!isSmtpConfigured()) {
        throw configurationError("SMTP host, credentials, and sender address are required.");
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    return transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
        html
    });
};

export const sendMsg91Otp = async (phoneNumber) => {
    if (!isMsg91Configured()) {
        throw configurationError("MSG91 auth key and OTP template ID are required.");
    }

    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", process.env.MSG91_TEMPLATE_ID);
    url.searchParams.set("mobile", `91${phoneNumber}`);
    url.searchParams.set("otp_length", "6");
    url.searchParams.set("otp_expiry", "10");
    url.searchParams.set("realTimeResponse", "1");

    const response = await fetch(url, {
        method: "POST",
        headers: {
            authkey: process.env.MSG91_AUTH_KEY,
            "content-type": "application/json"
        },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(MSG91_TIMEOUT_MS)
    });
    const result = await readMsg91Response(response);
    if (!response.ok || result.type !== "success") {
        throw new Error("MSG91 could not send the phone verification code. Check the auth key and approved OTP template.");
    }
};

export const resendMsg91Otp = async (phoneNumber) => {
    if (!isMsg91Configured()) {
        throw configurationError("MSG91 auth key and OTP template ID are required.");
    }

    const url = new URL("https://control.msg91.com/api/v5/otp/retry");
    url.searchParams.set("authkey", process.env.MSG91_AUTH_KEY);
    url.searchParams.set("mobile", `91${phoneNumber}`);
    url.searchParams.set("retrytype", "text");

    const response = await fetch(url, {
        signal: AbortSignal.timeout(MSG91_TIMEOUT_MS)
    });
    const result = await readMsg91Response(response);
    if (!response.ok || result.type !== "success") {
        throw new Error("MSG91 could not resend the phone verification code. Check the auth key and retry limits.");
    }
};

export const verifyMsg91Otp = async (phoneNumber, code) => {
    if (!isMsg91Configured()) {
        throw configurationError("MSG91 auth key and OTP template ID are required.");
    }

    const url = new URL("https://control.msg91.com/api/v5/otp/verify");
    url.searchParams.set("mobile", `91${phoneNumber}`);
    url.searchParams.set("otp", code);

    const response = await fetch(url, {
        headers: { authkey: process.env.MSG91_AUTH_KEY },
        signal: AbortSignal.timeout(MSG91_TIMEOUT_MS)
    });
    const result = await readMsg91Response(response);
    if (response.status === 401) {
        throw configurationError("MSG91 rejected the auth key. Check MSG91_AUTH_KEY.");
    }
    if (!response.ok) throw new Error("MSG91 could not verify the phone code right now.");
    return response.ok && result.type === "success";
};

export const sendEmailOtp = async (email, code) => {
    return sendEmailMessage({
        to: email,
        subject: "Your Chhaya Picture verification code",
        text: `Your verification code is ${code}. It expires in 10 minutes. Do not share this code with anyone.`,
        html: `<p>Your Chhaya Picture verification code is:</p><p style="font-size:24px;font-weight:700;letter-spacing:5px">${code}</p><p>It expires in 10 minutes. Do not share this code with anyone.</p>`
    });
};
