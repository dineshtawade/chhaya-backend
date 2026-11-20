import express from "express";
import {
    getPushPublicKey,
    subscribeAdminToPush,
    unsubscribeAdminFromPush,
    subscribeUserToPush,
    unsubscribeUserFromPush
} from "../controllers/notificationController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/public-key", getPushPublicKey);
router.post("/subscribe", protect, adminOnly, subscribeAdminToPush);
router.delete("/subscribe", protect, adminOnly, unsubscribeAdminFromPush);
router.post("/subscribe/user", protect, subscribeUserToPush);
router.delete("/subscribe/user", protect, unsubscribeUserFromPush);

export default router;
