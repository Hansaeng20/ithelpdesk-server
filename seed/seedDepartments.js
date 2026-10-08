const mongoose = require("mongoose");
require("dotenv").config();

const Department = require("../models/Department");

const departments = [
    {
        name: "Finance",
        code: "FIN",
        description:
            "Handles financial and accounting operations.",
    },
    {
        name: "Human Resources",
        code: "HR",
        description:
            "Handles employee and human resource concerns.",
    },
    {
        name: "Operations",
        code: "OPS",
        description:
            "Handles day-to-day business and operational activities.",
    },
    {
        name: "Marketing",
        code: "MKT",
        description:
            "Handles marketing, communications, and promotional activities.",
    },
];

const seedDepartments = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected.");

        await Department.deleteMany({});

        const createdDepartments =
            await Department.insertMany(departments);

        console.log(
            `Created ${createdDepartments.length} departments.`
        );

        createdDepartments.forEach((department) => {
            console.log(
                `${department.code} - ${department.name}`
            );
        });

        await mongoose.connection.close();

        console.log("MongoDB connection closed.");
    } catch (error) {
        console.error("Department seeding failed:");
        console.error(error);

        await mongoose.connection.close();

        process.exit(1);
    }
};

seedDepartments();