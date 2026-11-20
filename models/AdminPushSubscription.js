import mongoose from "mongoose";

const adminPushSubscriptionSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        endpoint: {
            type: String,
            required: true,
            unique: true
        },
        expirationTime: {
            type: Number,
            default: null
        },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true }
        }
    },
    { timestamps: true }
);

const AdminPushSubscription = mongoose.model("AdminPushSubscription", adminPushSubscriptionSchema);

export default AdminPushSubscription;
