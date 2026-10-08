const mongoose = require("mongoose");

const ticketCommentSchema = new mongoose.Schema(
    {
        ticket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ticket",
            required: true
        },

        authorName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        message: {
            type: String,
            required: true,
            trim: true,
            minlength: 1,
            maxlength: 1000
        },

        authorType: {
            type: String,
            required: true,
            enum: ["Requester", "Support"],
            default: "Requester"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "TicketComment",
    ticketCommentSchema
);