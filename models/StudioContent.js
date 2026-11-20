import mongoose from "mongoose";

const studioContentSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: "main",
            unique: true
        },
        hero: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        },
        portfolio: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        gallery: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        reels: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        media: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        testimonials: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        faqs: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        plans: {
            type: [mongoose.Schema.Types.Mixed],
            default: []
        },
        studio: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        offer: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        footerPages: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    { timestamps: true }
);

const StudioContent = mongoose.model("StudioContent", studioContentSchema);

export default StudioContent;
