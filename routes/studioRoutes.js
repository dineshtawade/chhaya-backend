import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getStudioContent, updateStudioContent } from "../controllers/studioController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const uploadDirectory = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
    storage: multer.diskStorage({
        destination: uploadDirectory,
        filename: (_req, file, callback) => {
            const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
            callback(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`);
        }
    }),
    limits: { fileSize: 10 * 1024 * 1024, files: 20 },
    fileFilter: (_req, file, callback) => {
        callback(null, ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.mimetype));
    }
});

const reelUpload = multer({
    storage: multer.diskStorage({
        destination: uploadDirectory,
        filename: (_req, file, callback) => {
            const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "-");
            callback(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`);
        }
    }),
    limits: { fileSize: 100 * 1024 * 1024, files: 10 },
    fileFilter: (_req, file, callback) => {
        callback(null, ["video/mp4", "video/webm", "video/quicktime"].includes(file.mimetype));
    }
});

router.get("/", getStudioContent);
router.put("/", protect, adminOnly, updateStudioContent);
router.post("/upload", protect, adminOnly, upload.array("images", 20), (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const files = (req.files || []).map((file) => ({
        id: `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: file.originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        category: "Studio gallery",
        imageUrl: `${baseUrl}/uploads/${file.filename}`
    }));

    res.status(201).json({ success: true, files });
});
router.post("/upload-reels", protect, adminOnly, reelUpload.array("reels", 10), (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const files = (req.files || []).map((file) => ({
        id: `reel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: file.originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        category: "Studio reel",
        posterUrl: "",
        videoUrl: `${baseUrl}/uploads/${file.filename}`
    }));

    res.status(201).json({ success: true, files });
});

export default router;
