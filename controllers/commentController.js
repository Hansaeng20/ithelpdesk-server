const mongoose = require("mongoose");

const TicketComment = require("../models/TicketComment");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

const canAccessTicket = (ticket, user) =>
    user.role === "IT Support" ||
    ticket.requester?.toString() === user.id.toString();

// GET ALL COMMENTS
const getComments = async (req, res, next) => {
    try {
        const comments = await TicketComment.find()
            .populate("ticket", "ticketNumber title")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            comments
        });
    } catch (error) {
        next(error);
    }
};

// GET ONE COMMENT
const getComment = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment ID"
            });
        }

        const comment = await TicketComment.findById(id).populate(
            "ticket",
            "ticketNumber title requester"
        );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        if (!comment.ticket || !canAccessTicket(comment.ticket, req.user)) {
            return res.status(403).json({ success: false, message: "You cannot access this comment." });
        }

        res.status(200).json({
            success: true,
            comment
        });
    } catch (error) {
        next(error);
    }
};

// GET COMMENTS FOR A TICKET
const getTicketComments = async (req, res, next) => {
    try {
        const { ticketId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(ticketId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID"
            });
        }

        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (!canAccessTicket(ticket, req.user)) {
            return res.status(403).json({ success: false, message: "You cannot access this ticket." });
        }

        const comments = await TicketComment.find({
            ticket: ticketId
        }).sort({ createdAt: 1 });

        res.status(200).json({
            success: true,
            count: comments.length,
            ticket: {
                _id: ticket._id,
                ticketNumber: ticket.ticketNumber,
                title: ticket.title
            },
            comments
        });
    } catch (error) {
        next(error);
    }
};

// CREATE COMMENT
const createComment = async (req, res, next) => {
    try {
        const { ticket, message } = req.body;

        if (!mongoose.Types.ObjectId.isValid(ticket)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID"
            });
        }

        const ticketExists = await Ticket.findById(ticket);

        if (!ticketExists) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (!canAccessTicket(ticketExists, req.user)) {
            return res.status(403).json({ success: false, message: "You cannot comment on this ticket." });
        }

        const author = await User.findById(req.user.id);
        if (!author) {
            return res.status(401).json({ success: false, message: "User account not found." });
        }

        const comment = await TicketComment.create({
            ticket,
            authorName: author.name,
            message,
            authorType: author.role === "IT Support" ? "Support" : "Requester"
        });

        const populatedComment = await TicketComment.findById(
            comment._id
        ).populate("ticket", "ticketNumber title");

        res.status(201).json({
            success: true,
            message: "Comment created successfully",
            comment: populatedComment
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: Object.values(error.errors).map(
                    (validationError) => validationError.message
                )
            });
        }

        next(error);
    }
};

// UPDATE COMMENT
const updateComment = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment ID"
            });
        }

        const allowedFields = ["message"];

        const updateData = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        const comment = await TicketComment.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate("ticket", "ticketNumber title");

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            comment
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: Object.values(error.errors).map(
                    (validationError) => validationError.message
                )
            });
        }

        next(error);
    }
};

// DELETE COMMENT
const deleteComment = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid comment ID"
            });
        }

        const comment = await TicketComment.findByIdAndDelete(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getComments,
    getComment,
    getTicketComments,
    createComment,
    updateComment,
    deleteComment
};
