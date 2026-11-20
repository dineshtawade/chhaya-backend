import StudioContent from "../models/StudioContent.js";

export const DEFAULT_STUDIO_CONTENT = {
    studio: {
        name: "Chhaya Picture",
        location: "Jaipur, Rajasthan",
        address: "",
        mapUrl: "",
        email: "hello@lumastudio.in",
        phone: "+91 98765 43210",
        instagram: "",
        facebook: "",
        youtube: "",
        whatsapp: ""
    },
    offer: {
        id: "festive-offer",
        active: false,
        planId: "plan-wedding",
        offerPrice: 20000,
        startAt: "",
        endAt: "",
        badge: "FESTIVE OFFER",
        eyebrow: "A LITTLE SOMETHING EXTRA",
        title: "A little celebration goes a long way.",
        description: "Celebrate your story with a special price on one of our most-loved packages.",
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=85",
        buttonText: "Claim this offer"
    },
    footerPages: {
        contact: {
            eyebrow: "GET IN TOUCH",
            title: "Let's talk about your day.",
            description: "Tell us what you're planning. We'd love to hear your story and help you find the right photography experience."
        },
        terms: {
            title: "Terms & Conditions",
            intro: "These terms describe how photography enquiries and bookings with Chhaya Picture are handled. Please contact the studio if anything is unclear.",
            body: `## Enquiries and bookings
A booking request is an enquiry and does not reserve a date. A date is confirmed only after the studio confirms availability and any agreed booking steps in writing.

## Fees, payments and changes
Package inclusions, fees, payment dates, cancellation and rescheduling arrangements will be shared with you before a booking is confirmed. Any agreed changes should be confirmed with the studio in writing.

## Photography and delivery
The final photographs, format and estimated delivery timeline depend on the selected package and the details confirmed with the studio. The studio will communicate any material changes to that timeline.

## Use of photographs
Clients may use delivered photographs for personal, non-commercial purposes. The studio will ask for your permission before using identifiable client photographs in its portfolio or promotional materials.

## Contact
For questions about these terms, contact the studio using the details on the Contact Us page.`
        },
        privacy: {
            title: "Privacy Policy",
            intro: "This policy explains how Chhaya Picture uses information shared through this website and during a photography enquiry or booking.",
            body: `## Information we collect
We may collect your name, email address, phone number, event details, venue information, selected map coordinates and messages you provide when creating an account or making a booking request.

## How information is used
We use this information to respond to enquiries, manage bookings, provide photography services, send booking updates and protect the security of client accounts.

## Sharing and security
We do not sell personal information. Information may be processed by service providers needed to operate the website, send communications or deliver studio services. We use reasonable safeguards, but no online service can guarantee absolute security.

## Retention and your choices
Information is retained for as long as needed to manage studio services and meet applicable record-keeping requirements. You may contact the studio to request access, correction or deletion, subject to legal and operational requirements.

## Contact
For privacy questions or requests, contact the studio using the details on the Contact Us page.`
        }
    },
    hero: {
        eyebrow: "JAIPUR · WEDDING & LIFESTYLE PHOTOGRAPHY",
        title: "Your story,\nbeautifully told.",
        description: "Honest moments, artfully captured. Photographs that bring you right back to how it felt.",
        imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85",
        buttonText: "Explore our work",
        slides: [
            {
                id: "hero-1",
                eyebrow: "JAIPUR · WEDDING & LIFESTYLE PHOTOGRAPHY",
                title: "Your story,\nbeautifully told.",
                description: "Honest moments, artfully captured. Photographs that bring you right back to how it felt.",
                imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85",
                buttonText: "Explore our work"
            },
            {
                id: "hero-2",
                eyebrow: "REAL MOMENTS · ARTFULLY CAPTURED",
                title: "The little things,\nheld forever.",
                description: "From the quiet glances to the loud celebrations, we preserve the feeling of your day.",
                imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=2000&q=85",
                buttonText: "Discover our stories"
            }
        ]
    },
    portfolio: [
        { id: "portfolio-1", title: "A summer wedding", category: "Weddings", imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80" },
        { id: "portfolio-2", title: "Golden hour, together", category: "Engagements", imageUrl: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80" },
        { id: "portfolio-3", title: "The little in-between", category: "Candid", imageUrl: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1000&q=80" }
    ],
    gallery: [
        { id: "gallery-1", title: "Wedding celebration", category: "Weddings", imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=85" },
        { id: "gallery-2", title: "A quiet promise", category: "Weddings", imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=85" },
        { id: "gallery-3", title: "Golden together", category: "Couples", imageUrl: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=85" },
        { id: "gallery-4", title: "The candid moments", category: "Candid", imageUrl: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=85" },
        { id: "gallery-5", title: "Dressed for forever", category: "Portraits", imageUrl: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?auto=format&fit=crop&w=1200&q=85" },
        { id: "gallery-6", title: "Between the frames", category: "Lifestyle", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85" },
        { id: "gallery-7", title: "Love in every detail", category: "Details", imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=85" },
        { id: "gallery-8", title: "A moment to keep", category: "Portraits", imageUrl: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85" }
    ],
    reels: [],
    media: [
        { id: "media-1", title: "A day to remember", type: "Video", imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=80", videoUrl: "" },
        { id: "media-2", title: "The details matter", type: "Behind the scenes", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80", videoUrl: "" }
    ],
    testimonials: [
        { id: "testimonial-1", name: "Aanya & Rohan", event: "Wedding", quote: "They caught every little moment we didn't even know was happening. Looking through the photos feels like reliving the whole day." },
        { id: "testimonial-2", name: "Meera & Arjun", event: "Engagement", quote: "We felt completely at ease, and the photos look so much like us. We couldn't be happier." }
    ],
    faqs: [
        { id: "faq-1", question: "How do we book a date?", answer: "Choose a package and send us a booking request. We will get in touch to confirm availability and next steps." },
        { id: "faq-2", question: "When will we receive our photos?", answer: "Your edited gallery is typically ready within four to six weeks. We will share the exact timeline after your event." },
        { id: "faq-3", question: "Can we customise a package?", answer: "Absolutely. Tell us what you have in mind in your booking notes and we can create a package that fits your celebration." }
    ],
    plans: [
        { id: "plan-wedding", name: "Wedding Story", category: "Wedding", price: 45000, duration: "Full day · up to 10 hours", description: "The big moments, the tiny details, and everything in between.", features: ["2 photographers", "Edited high-resolution gallery", "Pre-wedding consultation"], featured: true, active: true },
        { id: "plan-engagement", name: "The Engagement", category: "Engagement", price: 18000, duration: "Up to 4 hours", description: "A relaxed session that feels like the two of you.", features: ["1 photographer", "60+ edited images", "Online gallery"], featured: false, active: true },
        { id: "plan-candid", name: "Candid Moments", category: "Candid", price: 25000, duration: "Up to 6 hours", description: "Natural, unposed photographs full of feeling.", features: ["1 photographer", "80+ edited images", "Online gallery"], featured: false, active: true }
    ]
};

const isRecord = (value) => value && typeof value === "object" && !Array.isArray(value);

export const getStudioContent = async (req, res) => {
    const saved = await StudioContent.findOne({ key: "main" }).lean();
    const { _id, key, __v, createdAt, updatedAt, ...content } = saved || {};
    const savedHero = content.hero || {};
    const mergedHero = { ...DEFAULT_STUDIO_CONTENT.hero, ...savedHero };
    if (!Array.isArray(savedHero.slides) || savedHero.slides.length === 0) {
        mergedHero.slides = [{
            id: "hero-1",
            eyebrow: mergedHero.eyebrow || "",
            title: mergedHero.title || "",
            description: mergedHero.description || "",
            imageUrl: mergedHero.imageUrl || "",
            buttonText: mergedHero.buttonText || "Explore our work"
        }];
    }

    return res.json({
        success: true,
        content: saved ? {
            ...DEFAULT_STUDIO_CONTENT,
            ...content,
            hero: mergedHero,
            studio: { ...DEFAULT_STUDIO_CONTENT.studio, ...content.studio },
            offer: { ...DEFAULT_STUDIO_CONTENT.offer, ...(isRecord(content.offer) ? content.offer : {}) },
            footerPages: {
                ...DEFAULT_STUDIO_CONTENT.footerPages,
                ...content.footerPages,
                contact: { ...DEFAULT_STUDIO_CONTENT.footerPages.contact, ...content.footerPages?.contact },
                terms: { ...DEFAULT_STUDIO_CONTENT.footerPages.terms, ...content.footerPages?.terms },
                privacy: { ...DEFAULT_STUDIO_CONTENT.footerPages.privacy, ...content.footerPages?.privacy }
            }
        } : DEFAULT_STUDIO_CONTENT
    });
};

export const updateStudioContent = async (req, res) => {
    const content = req.body?.content;
    const collectionKeys = ["portfolio", "gallery", "reels", "media", "testimonials", "faqs", "plans"];

    if (!isRecord(content) || !isRecord(content.hero) || !isRecord(content.studio) ||
        collectionKeys.some((key) => !Array.isArray(content[key]))) {
        return res.status(400).json({
            success: false,
            message: "Studio details, hero, and all content lists are required"
        });
    }

    if (content.plans.some((plan) => !plan.name?.trim() || !Number.isFinite(Number(plan.price)) || Number(plan.price) < 0)) {
        return res.status(400).json({
            success: false,
            message: "Every package needs a name and a valid non-negative price"
        });
    }

    const footerPages = isRecord(content.footerPages)
        ? {
            ...DEFAULT_STUDIO_CONTENT.footerPages,
            ...content.footerPages,
            contact: { ...DEFAULT_STUDIO_CONTENT.footerPages.contact, ...content.footerPages.contact },
            terms: { ...DEFAULT_STUDIO_CONTENT.footerPages.terms, ...content.footerPages.terms },
            privacy: { ...DEFAULT_STUDIO_CONTENT.footerPages.privacy, ...content.footerPages.privacy }
        }
        : DEFAULT_STUDIO_CONTENT.footerPages;
    const offer = isRecord(content.offer)
        ? { ...DEFAULT_STUDIO_CONTENT.offer, ...content.offer }
        : DEFAULT_STUDIO_CONTENT.offer;
    const offeredPlan = content.plans.find((plan) => plan.id === offer.planId && plan.active !== false);
    const offerStartTime = typeof offer.startAt === "string" ? Date.parse(offer.startAt) : Number.NaN;
    const offerEndTime = typeof offer.endAt === "string" ? Date.parse(offer.endAt) : Number.NaN;
    const validOfferSchedule = Number.isFinite(offerStartTime) &&
        Number.isFinite(offerEndTime) &&
        new Date(offerStartTime).toISOString() === offer.startAt &&
        new Date(offerEndTime).toISOString() === offer.endAt &&
        offerEndTime > offerStartTime &&
        offerEndTime > Date.now();
    if (typeof offer.active !== "boolean") {
        return res.status(400).json({ success: false, message: "Offer visibility must be enabled or disabled." });
    }
    if (offer.active && (
        typeof offer.id !== "string" ||
        !offer.id.trim() ||
        typeof offer.title !== "string" ||
        !offer.title.trim() ||
        typeof offer.imageUrl !== "string" ||
        !offer.imageUrl.trim() ||
        !offeredPlan ||
        !validOfferSchedule ||
        !Number.isFinite(Number(offer.offerPrice)) ||
        Number(offer.offerPrice) <= 0 ||
        Number(offer.offerPrice) >= Number(offeredPlan.price)
    )) {
        return res.status(400).json({
            success: false,
            message: "A live offer needs a title, image, active package, a discounted price, and valid future start/end date-times (IST)"
        });
    }

    const saved = await StudioContent.findOneAndUpdate(
        { key: "main" },
        { $set: { ...content, offer, footerPages, key: "main" } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    const { _id, key, __v, createdAt, updatedAt, ...savedContent } = saved;

    return res.json({ success: true, content: savedContent });
};
