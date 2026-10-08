const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Ticket = require("../models/Ticket");

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected.");

        console.log("Clearing existing users...");

        await User.deleteMany({});

        const password = await bcrypt.hash("password123", 10);

        const users = await User.insertMany([
            {
                name: "Franz Employee",
                email: "employee@test.com",
                password,
                role: "Employee",
            },
            {
                name: "Second Employee",
                email: "employee2@test.com",
                password,
                role: "Employee",
            },
            {
                name: "IT Support",
                email: "support@test.com",
                password,
                role: "IT Support",
            },
        ]);

        const employee1 = users.find(
            (user) => user.email === "employee@test.com"
        );

        const employee2 = users.find(
            (user) => user.email === "employee2@test.com"
        );

        console.log("Users created successfully.");

        /*
         * Assign existing sample tickets to employees.
         *
         * Employee 1:
         * IT-000001
         * IT-000003
         * IT-000005
         * IT-000007
         *
         * Employee 2:
         * IT-000002
         * IT-000004
         * IT-000006
         * IT-000008
         */

        await Ticket.updateMany(
            {
                ticketNumber: {
                    $in: [
                        "IT-000001",
                        "IT-000003",
                        "IT-000005",
                        "IT-000007",
                    ],
                },
            },
            {
                $set: {
                    requester: employee1._id,
                },
            }
        );

        await Ticket.updateMany(
            {
                ticketNumber: {
                    $in: [
                        "IT-000002",
                        "IT-000004",
                        "IT-000006",
                        "IT-000008",
                    ],
                },
            },
            {
                $set: {
                    requester: employee2._id,
                },
            }
        );

        console.log("Existing tickets assigned to employees.");

        console.log("");
        console.log("Test accounts:");
        console.log("--------------------------------");
        console.log("Employee 1:");
        console.log("Email: employee@test.com");
        console.log("Password: password123");
        console.log("");
        console.log("Employee 2:");
        console.log("Email: employee2@test.com");
        console.log("Password: password123");
        console.log("");
        console.log("IT Support:");
        console.log("Email: support@test.com");
        console.log("Password: password123");
        console.log("--------------------------------");

        await mongoose.connection.close();

        console.log("Database connection closed.");
    } catch (error) {
        console.error("User seed failed:");
        console.error(error.message);

        await mongoose.connection.close();

        process.exit(1);
    }
};

seedUsers();