import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const email = process.env.ADMIN_EMAIL.toLowerCase();
        const password = process.env.ADMIN_PASSWORD;

        const existingAdmin = await User.findOne({ role: "admin" });

        if (existingAdmin) {
            if (existingAdmin.email === email) {
                console.log("Admin account already exists");
                return;
            }
            throw new Error("An admin account already exists. Only one admin is allowed.");
        }

        const existingAccount = await User.findOne({ email });
        if (existingAccount) {
            throw new Error("The configured admin email is already used by a user account.");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            name: process.env.ADMIN_NAME,
            email,
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin account created successfully");

    } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

seedAdmin();