import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { normalizeIndianPhone } from "../utils/phone.js";

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );
};

// Register new user
export const register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if ([name, email, phone, password].some((value) => typeof value !== "string" || !value.trim())) {
            return res.status(400).json({
                success: false,
                message: "Name, email, phone number and password are required"
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPhone = normalizeIndianPhone(phone);

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid email address"
            });
        }

        if (!normalizedPhone) {
            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit phone number"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email or phone number is already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: normalizedName,
            email: normalizedEmail,
            phone: normalizedPhone,
            password: hashedPassword,
            role: "user"
        });

        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email or phone number is already registered"
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const identifier = typeof req.body.identifier === "string"
            ? req.body.identifier.trim()
            : typeof req.body.email === "string" ? req.body.email.trim() : "";
        const { password } = req.body;

        if (!identifier || typeof password !== "string" || !password) {
            return res.status(400).json({
                success: false,
                message: "Email or phone number and password are required"
            });
        }

        const identityQuery = identifier.includes("@")
            ? { email: identifier.toLowerCase() }
            : { phone: normalizeIndianPhone(identifier) };
        const user = identityQuery.phone === null
            ? null
            : await User.findOne(identityQuery).select("+password");

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get logged-in user
export const getMe = async (req, res) => {
    return res.json({
        success: true,
        user: req.user
    });
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" })
            .select("-password")
            .sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};