import webPush from "web-push";
import AdminPushSubscription from "../models/AdminPushSubscription.js";
import UserPushSubscription from "../models/UserPushSubscription.js";

export const isPushConfigured = () => Boolean(
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_SUBJECT
);

const sendToSubscriptions = async (Model, filter, notification) => {
    const subscriptions = await Model.find(filter).lean();
    if (!subscriptions.length) return { configured: isPushConfigured(), delivered: 0 };

    if (!isPushConfigured()) {
        console.error("Push notification not sent: VAPID settings are incomplete.");
        return { configured: false, delivered: 0 };
    }

    webPush.setVapidDetails(
        process.env.VAPID_SUBJECT,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify(notification);
    const results = await Promise.allSettled(subscriptions.map(async (subscription) => {
        try {
            await webPush.sendNotification({
                endpoint: subscription.endpoint,
                expirationTime: subscription.expirationTime,
                keys: subscription.keys
            }, payload);
            return subscription._id;
        } catch (error) {
            if ([404, 410].includes(error.statusCode)) {
                await Model.deleteOne({ _id: subscription._id });
                return null;
            }
            throw error;
        }
    }));

    let delivered = 0;
    results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
            delivered += 1;
        } else if (result.status === "rejected") {
            console.error("Push notification delivery failed.", {
                subscriptionId: String(subscriptions[index]._id),
                statusCode: result.reason.statusCode,
                message: result.reason.message
            });
        }
    });

    return { configured: true, delivered };
};

export const sendAdminPushNotification = (notification) =>
    sendToSubscriptions(AdminPushSubscription, {}, notification);

export const sendUserPushNotification = (userId, notification) =>
    sendToSubscriptions(UserPushSubscription, { user: userId }, notification);

export const sendBookingNotificationToAdmins = (booking) => sendAdminPushNotification({
    title: "New booking request",
    body: `${booking.contactName} requested ${booking.plan.name} for ${booking.eventDate}.`,
    url: "/admin?tab=bookings",
    tag: `booking-${booking._id}`
});
