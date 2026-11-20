import Booking from "../models/Booking.js";
import mongoose from "mongoose";
import { DEFAULT_STUDIO_CONTENT } from "./studioController.js";
import StudioContent from "../models/StudioContent.js";
import {
    sendAdminPushNotification,
    sendBookingNotificationToAdmins,
    sendUserPushNotification
} from "../services/pushNotificationService.js";
import {
    sendBookingRequestEmailToAdmin,
    sendBookingRequestEmailToUser,
    sendBookingStatusEmailToUser
} from "../services/bookingEmailService.js";
import { normalizeIndianPhone } from "../utils/phone.js";

const bookingStatuses = ["pending", "confirmed", "completed", "cancelled"];

export const createBooking = async (req, res) => {
    const { planId, offerId, eventDate, eventType, contactName, phone, location, coordinates, notes } = req.body;

    const requiredFields = [eventType, contactName, phone, location];
    if (typeof planId !== "string" || !planId ||
        typeof eventDate !== "string" ||
        (offerId !== undefined && typeof offerId !== "string") ||
        requiredFields.some((value) => typeof value !== "string" || !value.trim())) {
        return res.status(400).json({ success: false, message: "Please complete all required booking details" });
    }

    if (req.user.role !== "user") {
        return res.status(403).json({ success: false, message: "Only client accounts can create a booking." });
    }

    const normalizedPhone = normalizeIndianPhone(phone);
    if (!normalizedPhone || normalizedPhone !== normalizeIndianPhone(req.user.phone)) {
        return res.status(400).json({ success: false, message: "Use the valid mobile number saved to your account." });
    }
    if (!req.user.emailVerifiedAt) {
        return res.status(403).json({ success: false, message: "Verify your account email before booking." });
    }
    if (contactName.trim().toLocaleLowerCase() !== req.user.name.trim().toLocaleLowerCase()) {
        return res.status(400).json({ success: false, message: "Booking name must match your account name." });
    }

    let validatedCoordinates;
    if (coordinates !== undefined && coordinates !== null) {
        const { latitude, longitude } = coordinates;
        if (
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 ||
            longitude < -180 || longitude > 180
        ) {
            return res.status(400).json({ success: false, message: "Choose a valid point on the map." });
        }
        validatedCoordinates = { latitude, longitude };
    }

    const parsedDate = new Date(`${eventDate}T00:00:00.000Z`);
    const today = new Date();
    const todayDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate) ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== eventDate ||
        eventDate < todayDate) {
        return res.status(400).json({ success: false, message: "Please choose a valid event date" });
    }

    if (notes !== undefined && typeof notes !== "string") {
        return res.status(400).json({ success: false, message: "Booking notes must be text" });
    }

    const content = await StudioContent.findOne({ key: "main" }).lean();
    const plans = content?.plans || DEFAULT_STUDIO_CONTENT.plans;
    const selectedPlan = plans.find((plan) => plan.id === planId);

    if (!selectedPlan || selectedPlan.active === false) {
        return res.status(404).json({ success: false, message: "This package is no longer available" });
    }

    let bookingPrice = Number(selectedPlan.price);
    if (offerId) {
        const offer = content?.offer || DEFAULT_STUDIO_CONTENT.offer;
        const offerPrice = Number(offer.offerPrice);
        const offerStartTime = typeof offer.startAt === "string" ? Date.parse(offer.startAt) : Number.NaN;
        const offerEndTime = typeof offer.endAt === "string" ? Date.parse(offer.endAt) : Number.NaN;
        const currentTime = Date.now();
        if (
            offer.active !== true ||
            offer.id !== offerId ||
            offer.planId !== planId ||
            !Number.isFinite(offerStartTime) ||
            !Number.isFinite(offerEndTime) ||
            currentTime < offerStartTime ||
            currentTime >= offerEndTime ||
            !Number.isFinite(offerPrice) ||
            offerPrice <= 0 ||
            offerPrice >= bookingPrice
        ) {
            return res.status(400).json({ success: false, message: "This offer is not currently available for the selected package." });
        }
        bookingPrice = offerPrice;
    }

    const booking = await Booking.create({
        user: req.user.id,
        plan: {
            id: selectedPlan.id,
            name: selectedPlan.name,
            price: bookingPrice
        },
        eventDate,
        eventType: eventType.trim(),
        contactName: contactName.trim(),
        phone: normalizedPhone,
        location: location.trim(),
        ...(validatedCoordinates ? { coordinates: validatedCoordinates } : {}),
        notes: notes?.trim() || ""
    });

    const notifications = [
        ["user-email", () => sendBookingRequestEmailToUser(booking, req.user)],
        ["admin-email", () => sendBookingRequestEmailToAdmin(booking, req.user)],
        ["admin-push", () => sendBookingNotificationToAdmins(booking)],
        ["user-push", () => sendUserPushNotification(req.user.id, {
            title: "Booking request received",
            body: `Your ${booking.plan.name} request for ${booking.eventDate} was received.`,
            url: "/user",
            tag: `booking-${booking._id}`
        })]
    ];
    const deliveryResults = await Promise.allSettled(
        notifications.map(([, delivery]) => Promise.resolve().then(delivery))
    );
    const notificationDelivery = {};
    deliveryResults.forEach((result, index) => {
        const [channel] = notifications[index];
        notificationDelivery[channel] = result.status === "fulfilled" &&
            (result.value?.delivered === undefined || result.value.delivered > 0);
        if (result.status === "rejected") {
            console.error(`Booking saved but ${channel} notification failed.`, {
                bookingId: String(booking._id),
                message: result.reason.message
            });
        }
    });

    return res.status(201).json({ success: true, booking, notificationDelivery });
};

export const getMyBookings = async (req, res) => {
    const bookings = await Booking.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, bookings });
};

export const getAllBookings = async (req, res) => {
    const bookings = await Booking.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .lean();
    return res.json({ success: true, bookings });
};

export const updateBookingStatus = async (req, res) => {
    const { status } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    if (!bookingStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Choose a valid booking status" });
    }

    const booking = await Booking.findById(req.params.id).populate("user", "name email");

    if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const statusChanged = booking.status !== status;
    booking.status = status;
    await booking.save();

    let notificationDelivery;
    if (statusChanged && booking.user) {
        const deliveries = await Promise.allSettled([
            sendBookingStatusEmailToUser(booking, booking.user),
            sendUserPushNotification(booking.user._id, {
                title: status === "confirmed" ? "Booking confirmed" : "Booking updated",
                body: `Your ${booking.plan.name} booking for ${booking.eventDate} is ${status}.`,
                url: "/user",
                tag: `booking-status-${booking._id}-${status}`
            })
        ]);
        notificationDelivery = {
            userEmail: deliveries[0].status === "fulfilled",
            userPush: deliveries[1].status === "fulfilled" && deliveries[1].value.delivered > 0
        };
        deliveries.forEach((result, index) => {
            if (result.status === "rejected") {
                const channel = index === 0 ? "user email" : "user push";
                console.error(`Booking status updated but ${channel} delivery failed.`, {
                    bookingId: String(booking._id),
                    message: result.reason.message
                });
            }
        });
    }

    return res.json({ success: true, booking, notificationDelivery });
};
