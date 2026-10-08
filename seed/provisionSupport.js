const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const provisionSupport = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected.");

        const email = process.env.SUPPORT_EMAIL;
        const password = process.env.SUPPORT_PASSWORD;

        if (!email || !password) {
            throw new Error(
                "SUPPORT_EMAIL and SUPPORT_PASSWORD must be configured in .env"
            );
        }

        const existingUser = await User.findOne({
            email,
        });

        if (existingUser) {
            console.log("IT Support account already exists.");
            console.log(`Email: ${email}`);

            await mongoose.connection.close();
            return;
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const supportUser = await User.create({
            name: "IT Support",
            email,
            password: hashedPassword,
            role: "IT Support",
        });

        console.log("");
        console.log("IT Support account created successfully.");
        console.log("------------------------------------------");
        console.log(`Name:     ${supportUser.name}`);
        console.log(`Email:    ${supportUser.email}`);
        console.log(`Password: ${password}`);
        console.log(`Role:     ${supportUser.role}`);
        console.log("Department: None");
        console.log("------------------------------------------");

        await mongoose.connection.close();

        console.log("MongoDB connection closed.");
    } catch (error) {
        console.error("Support provisioning failed:");
        console.error(error);

        await mongoose.connection.close();

        process.exit(1);
    }
};

provisionSupport();