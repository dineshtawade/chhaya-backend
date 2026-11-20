import express from "express";
import {
    createBooking,
    getAllBookings,
    getMyBookings,
    updateBookingStatus
} from "../controllers/bookingController.js";
import {
    confirmBookingVerification,
    startBookingVerification
} from "../controllers/bookingVerificationController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/verification", protect, startBookingVerification);
router.post("/verification/confirm", protect, confirmBookingVerification);
router.post("/", protect, createBooking);
router.get("/mine", protect, getMyBookings);
router.get("/", protect, adminOnly, getAllBookings);
router.patch("/:id/status", protect, adminOnly, updateBookingStatus);

export default router;
