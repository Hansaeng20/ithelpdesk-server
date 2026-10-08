const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
    {
        ticketNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 120
        },

        description: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 2000
        },

        requesterName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        requesterEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        requester: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Hardware",
                "Software",
                "Network",
                "Account Access",
                "Printer",
                "Email",
                "Other"
            ]
        },

        priority: {
            type: String,
            required: true,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium"
        },

        status: {
            type: String,
            required: true,
            enum: [
                "Open",
                "In Progress",
                "Resolved",
                "Cancelled"
            ],
            default: "Open"
        },

        slaHours: {
            type: Number,
            required: true,
            min: 1,
            max: 168,
            default: 24
        },

        dueAt: {
            type: Date,
            required: true
        },

        resolvedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Ticket", ticketSchema);