import Booking from "../models/Booking.js";
import { isSmtpConfigured } from "./contactVerificationService.js";
import { sendEventDayReminderEmailToAdmin } from "./bookingEmailService.js";
import { sendAdminPushNotification } from "./pushNotificationService.js";

const reminderTimeZone = "Asia/Kolkata";
const reminderHour = 9;
const lockDurationMs = 5 * 60 * 1000;

const getLocalDateTime = (date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: reminderTimeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hourCycle: "h23"
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return { date: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour) };
};

let cycleRunning = false;

const sendDueReminders = async () => {
    if (cycleRunning) return;
    cycleRunning = true;
    try {
        const now = new Date();
        const { date, hour } = getLocalDateTime(now);
        if (hour < reminderHour) return;

        const dueBookings = await Booking.find({
            eventDate: date,
            status: { $in: ["pending", "confirmed"] },
            adminReminderSentAt: null,
            $or: [
                { adminReminderLockUntil: null },
                { adminReminderLockUntil: { $lt: now } }
            ]
        }).limit(100).lean();

        for (const booking of dueBookings) {
            const claimed = await Booking.findOneAndUpdate(
                {
                    _id: booking._id,
                    status: { $in: ["pending", "confirmed"] },
                    adminReminderSentAt: null,
                    $or: [
                        { adminReminderLockUntil: null },
                        { adminReminderLockUntil: { $lt: now } }
                    ]
                },
                { $set: { adminReminderLockUntil: new Date(Date.now() + lockDurationMs) } },
                { new: true }
            );
            if (!claimed) continue;

            try {
                await sendEventDayReminderEmailToAdmin(booking);
                await Booking.updateOne(
                    { _id: booking._id, adminReminderSentAt: null },
                    { $set: { adminReminderSentAt: new Date(), adminReminderLockUntil: null } }
                );
            } catch (error) {
                console.error("Event-day booking reminder email failed.", {
                    bookingId: String(booking._id),
                    message: error.message
                });
                continue;
            }

            try {
                await sendAdminPushNotification({
                    title: "Today's event reminder",
                    body: `${booking.plan.name} for ${booking.contactName} is scheduled today.`,
                    url: "/admin?tab=bookings",
                    tag: `booking-reminder-${booking._id}`
                });
            } catch (error) {
                console.error("Event-day booking reminder push failed.", {
                    bookingId: String(booking._id),
                    message: error.message
                });
            }
        }
    } catch (error) {
        console.error("Booking reminder scheduler cycle failed.", error);
    } finally {
        cycleRunning = false;
    }
};

export const startBookingReminderScheduler = () => {
    if (!isSmtpConfigured() || !(process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL)) {
        console.error("Event-day booking reminders are disabled: SMTP and admin notification email must be configured.");
        return;
    }

    void sendDueReminders();
    const timer = setInterval(() => void sendDueReminders(), 60 * 1000);
    timer.unref();
};
