import { sendEmailMessage } from "./contactVerificationService.js";

const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatPrice = (price) => `INR ${Number(price).toLocaleString("en-IN")}`;
const getAdminEmail = () => process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;

const detailsText = (booking) => [
    `Package: ${booking.plan.name}`,
    `Event: ${booking.eventType}`,
    `Date: ${booking.eventDate}`,
    `Client: ${booking.contactName}`,
    `Phone: +91 ${booking.phone}`,
    `Location: ${booking.location}`,
    `Price: ${formatPrice(booking.plan.price)}`,
    booking.coordinates
        ? `Map: https://www.openstreetmap.org/?mlat=${booking.coordinates.latitude}&mlon=${booking.coordinates.longitude}#map=16/${booking.coordinates.latitude}/${booking.coordinates.longitude}`
        : ""
].filter(Boolean).join("\n");

const detailsHtml = (booking) => {
    const location = escapeHtml(booking.location);
    const mapLink = booking.coordinates
        ? `<p><a href="https://www.openstreetmap.org/?mlat=${booking.coordinates.latitude}&amp;mlon=${booking.coordinates.longitude}#map=16/${booking.coordinates.latitude}/${booking.coordinates.longitude}">Open event location map</a></p>`
        : "";
    return `<ul>
        <li><strong>Package:</strong> ${escapeHtml(booking.plan.name)}</li>
        <li><strong>Event:</strong> ${escapeHtml(booking.eventType)}</li>
        <li><strong>Date:</strong> ${escapeHtml(booking.eventDate)}</li>
        <li><strong>Client:</strong> ${escapeHtml(booking.contactName)}</li>
        <li><strong>Phone:</strong> +91 ${escapeHtml(booking.phone)}</li>
        <li><strong>Location:</strong> ${location}</li>
        <li><strong>Price:</strong> ${escapeHtml(formatPrice(booking.plan.price))}</li>
    </ul>${mapLink}`;
};

export const sendBookingRequestEmailToUser = (booking, user) => sendEmailMessage({
    to: user.email,
    subject: "We received your Chhaya Picture booking request",
    text: `Hi ${user.name},\n\nYour booking request has been received. The studio will review it and update you when its status changes.\n\n${detailsText(booking)}`,
    html: `<p>Hi ${escapeHtml(user.name)},</p><p>Your booking request has been received. The studio will review it and update you when its status changes.</p>${detailsHtml(booking)}`
});

export const sendBookingRequestEmailToAdmin = (booking, user) => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) throw new Error("Set ADMIN_NOTIFICATION_EMAIL or ADMIN_EMAIL to receive booking notifications.");
    return sendEmailMessage({
        to: adminEmail,
        subject: `New booking request: ${booking.plan.name} on ${booking.eventDate}`,
        text: `A new booking request was submitted by ${user.name} (${user.email}).\n\n${detailsText(booking)}`,
        html: `<p>A new booking request was submitted by ${escapeHtml(user.name)} (${escapeHtml(user.email)}).</p>${detailsHtml(booking)}`
    });
};

export const sendBookingStatusEmailToUser = (booking, user) => {
    const statusText = booking.status === "confirmed"
        ? "Your booking is confirmed."
        : `Your booking status is now: ${booking.status}.`;
    return sendEmailMessage({
        to: user.email,
        subject: booking.status === "confirmed"
            ? "Your Chhaya Picture booking is confirmed"
            : `Booking update: ${booking.status}`,
        text: `Hi ${user.name},\n\n${statusText}\n\n${detailsText(booking)}`,
        html: `<p>Hi ${escapeHtml(user.name)},</p><p>${escapeHtml(statusText)}</p>${detailsHtml(booking)}`
    });
};

export const sendEventDayReminderEmailToAdmin = (booking) => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) throw new Error("Set ADMIN_NOTIFICATION_EMAIL or ADMIN_EMAIL to receive booking reminders.");
    return sendEmailMessage({
        to: adminEmail,
        subject: `Today's event reminder: ${booking.plan.name}`,
        text: `This is a reminder for today's studio booking.\n\n${detailsText(booking)}`,
        html: `<p>This is a reminder for today's studio booking.</p>${detailsHtml(booking)}`
    });
};
