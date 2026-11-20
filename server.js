import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import studioRoutes from "./routes/studioRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { startBookingReminderScheduler } from "./services/bookingReminderService.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        const isLocalDevelopmentOrigin = process.env.NODE_ENV !== "production" &&
            /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");
        const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

        if (!origin || origin === allowedOrigin || isLocalDevelopmentOrigin) {
            return callback(null, true);
        }

        return callback(new Error("Origin is not allowed by CORS"));
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "MERN Backend API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/studio", studioRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found"
    });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    startBookingReminderScheduler();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
};

startServer();