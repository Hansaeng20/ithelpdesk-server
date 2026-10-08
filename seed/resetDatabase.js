const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User");
const Department = require("../models/Department");
const Ticket = require("../models/Ticket");
const TicketComment = require("../models/TicketComment");

const resetDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected.");
        console.log("Starting database reset...");

        const commentsDeleted =
            await TicketComment.deleteMany({});

        const ticketsDeleted =
            await Ticket.deleteMany({});

        const departmentsDeleted =
            await Department.deleteMany({});

        const usersDeleted =
            await User.deleteMany({});

        console.log(
            `Ticket comments deleted: ${commentsDeleted.deletedCount}`
        );

        console.log(
            `Tickets deleted: ${ticketsDeleted.deletedCount}`
        );

        console.log(
            `Departments deleted: ${departmentsDeleted.deletedCount}`
        );

        console.log(
            `Users deleted: ${usersDeleted.deletedCount}`
        );

        console.log("");
        console.log("Database completely cleared.");
        console.log("No seed data was recreated.");

        await mongoose.connection.close();

        console.log("MongoDB connection closed.");
        process.exit(0);

    } catch (error) {
        console.error("Database reset failed:");
        console.error(error);

        await mongoose.connection.close();
        process.exit(1);
    }
};

resetDatabase();