import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        plan: {
            id: { type: String, required: true },
            name: { type: String, required: true },
            price: { type: Number, required: true, min: 0 }
        },
        eventDate: {
            type: String,
            required: true
        },
        eventType: {
            type: String,
            required: true,
            trim: true
        },
        contactName: {
            type: String,
            required: true,
            trim: true
        },
        phone: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        coordinates: {
            type: new mongoose.Schema({
                latitude: { type: Number, min: -90, max: 90, required: true },
                longitude: { type: Number, min: -180, max: 180, required: true }
            }, { _id: false }),
            default: undefined
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 1500,
            default: ""
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "pending"
        },
        adminReminderSentAt: {
            type: Date,
            default: null
        },
        adminReminderLockUntil: {
            type: Date,
            default: null
        }
    },
    { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
