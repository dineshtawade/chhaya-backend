import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        phone: {
            type: String,
            required: function () {
                return this.role === "user";
            },
            unique: true,
            sparse: true,
            trim: true
        },
        emailVerifiedAt: {
            type: Date,
            default: null
        },
        phoneVerifiedAt: {
            type: Date,
            default: null
        },
        password: {
            type: String,
            required: true,
            select: false
        },
        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user"
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;