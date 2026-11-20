import mongoose from "mongoose";

const userPushSubscriptionSchema = new mongoose.Schema(
    {
        user: {
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

const UserPushSubscription = mongoose.model("UserPushSubscription", userPushSubscriptionSchema);

export default UserPushSubscription;
