import mongoose from "mongoose";

const bookingVerificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        emailAddress: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        phoneOtpSentAt: { type: Date, default: null },
        needsEmail: { type: Boolean, required: true },
        needsPhone: { type: Boolean, required: true },
        emailCodeHash: { type: String, default: "" },
        attempts: { type: Number, default: 0 },
        sendCount: { type: Number, default: 0 },
        lastSentAt: { type: Date, required: true },
        expiresAt: { type: Date, required: true },
        consumedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

bookingVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BookingVerification = mongoose.model("BookingVerification", bookingVerificationSchema);

export default BookingVerification;
