const mongoose = require("mongoose");
const Ticket = require("../models/Ticket");
const Department = require("../models/Department");

const SLA_HOURS = {
    Critical: 4,
    High: 8,
    Medium: 24,
    Low: 72
};

const ALLOWED_STATUS_TRANSITIONS = {
    Open: ["Assigned", "Cancelled"],
    Assigned: ["In Progress", "Cancelled"],
    "In Progress": ["Resolved", "Cancelled"],
    Resolved: ["Closed"],
    Closed: [],
    Cancelled: []
};

// GET ALL TICKETS
const getTickets = async (req, res, next) => {
    try {
        const tickets = await Ticket.find()
            .populate("department", "name code")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        next(error);
    }
};

// GET ONE TICKET
const getTicket = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID"
            });
        }

        const ticket = await Ticket.findById(id).populate(
            "department",
            "name code"
        );

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        res.status(200).json({
            success: true,
            ticket
        });
    } catch (error) {
        next(error);
    }
};

// CREATE TICKET
const createTicket = async (req, res, next) => {
    try {
        const {
            title,
            description,
            requesterName,
            requesterEmail,
            department,
            category,
            priority
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(department)) {
            return res.status(400).json({
                success: false,
                message: "Invalid department ID"
            });
        }

        const departmentExists = await Department.findById(department);

        if (!departmentExists) {
            return res.status(400).json({
                success: false,
                message: "Department not found"
            });
        }

        const selectedPriority = priority || "Medium";
        const slaHours = SLA_HOURS[selectedPriority];

        if (!slaHours) {
            return res.status(400).json({
                success: false,
                message: "Invalid priority"
            });
        }

        const dueAt = new Date(
            Date.now() + slaHours * 60 * 60 * 1000
        );

        const lastTicket = await Ticket.findOne()
            .sort({ ticketNumber: -1 })
            .select("ticketNumber");

        let nextNumber = 1;

        if (lastTicket) {
            const lastNumber = parseInt(
                lastTicket.ticketNumber.replace("IT-", ""),
                10
            );

            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        const ticketNumber = `IT-${String(nextNumber).padStart(6, "0")}`;

        const ticket = await Ticket.create({
            ticketNumber,
            title,
            description,
            requesterName,
            requesterEmail,
            department,
            category,
            priority: selectedPriority,
            slaHours,
            dueAt
        });

        const populatedTicket = await Ticket.findById(ticket._id).populate(
            "department",
            "name code"
        );

        res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            ticket: populatedTicket
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

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Ticket number already exists"
            });
        }

        next(error);
    }
};

// UPDATE TICKET
const updateTicket = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID"
            });
        }

        if (req.body.status !== undefined) {
            return res.status(400).json({
                success: false,
                message: "Use the status endpoint to change ticket status"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "requesterName",
            "requesterEmail",
            "department",
            "category",
            "priority",
            "assignedTo"
        ];

        const updateData = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        if (updateData.department) {
            if (!mongoose.Types.ObjectId.isValid(updateData.department)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID"
                });
            }

            const departmentExists = await Department.findById(
                updateData.department
            );

            if (!departmentExists) {
                return res.status(400).json({
                    success: false,
                    message: "Department not found"
                });
            }
        }

        if (updateData.priority) {
            const slaHours = SLA_HOURS[updateData.priority];

            if (!slaHours) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid priority"
                });
            }

            updateData.slaHours = slaHours;
            updateData.dueAt = new Date(
                Date.now() + slaHours * 60 * 60 * 1000
            );
        }

        const ticket = await Ticket.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate("department", "name code");

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Ticket updated successfully",
            ticket
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

// DELETE TICKET
const deleteTicket = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID"
            });
        }

        const ticket = await Ticket.findByIdAndDelete(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Ticket deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// CHANGE TICKET STATUS
const updateTicketStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket ID"
            });
        }

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        if (!ALLOWED_STATUS_TRANSITIONS[status]) {
            return res.status(400).json({
                success: false,
                message: "Invalid ticket status"
            });
        }

        const allowedNextStatuses =
            ALLOWED_STATUS_TRANSITIONS[ticket.status];

        if (!allowedNextStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Cannot change status from ${ticket.status} to ${status}`
            });
        }

        ticket.status = status;

        if (status === "Resolved") {
            ticket.resolvedAt = new Date();
        }

        await ticket.save();

        const updatedTicket = await Ticket.findById(ticket._id).populate(
            "department",
            "name code"
        );

        res.status(200).json({
            success: true,
            message: `Ticket status changed to ${status}`,
            ticket: updatedTicket
        });
    } catch (error) {
        next(error);
    }



};

// SEARCH AND FILTER TICKETS
const searchTickets = async (req, res, next) => {
    try {
        const {
            q,
            category,
            priority,
            status,
            department,
            assignedTo,
            sortBy = "createdAt",
            order = "desc"
        } = req.query;

        const filter = {};

        // Keyword search
        if (q) {
            const keywordRegex = new RegExp(q, "i");

            filter.$or = [
                { ticketNumber: keywordRegex },
                { title: keywordRegex },
                { description: keywordRegex },
                { requesterName: keywordRegex },
                { requesterEmail: keywordRegex },
                { assignedTo: keywordRegex }
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (priority) {
            filter.priority = priority;
        }

        if (status) {
            filter.status = status;
        }

        if (assignedTo) {
            filter.assignedTo = new RegExp(assignedTo, "i");
        }

        if (department) {
            if (!mongoose.Types.ObjectId.isValid(department)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid department ID"
                });
            }

            filter.department = department;
        }

        const allowedSortFields = [
            "createdAt",
            "updatedAt",
            "dueAt",
            "priority",
            "status",
            "ticketNumber"
        ];

        const selectedSortField = allowedSortFields.includes(sortBy)
            ? sortBy
            : "createdAt";

        const sortOrder = order === "asc" ? 1 : -1;

        const tickets = await Ticket.find(filter)
            .populate("department", "name code")
            .sort({ [selectedSortField]: sortOrder });

        res.status(200).json({
            success: true,
            count: tickets.length,
            filters: {
                q: q || "",
                category: category || "",
                priority: priority || "",
                status: status || "",
                department: department || "",
                assignedTo: assignedTo || "",
                sortBy: selectedSortField,
                order: order === "asc" ? "asc" : "desc"
            },
            tickets
        });
    } catch (error) {
        next(error);
    }
};

// GET OVERDUE TICKETS
const getOverdueTickets = async (req, res, next) => {
    try {
        const now = new Date();

        const tickets = await Ticket.find({
            dueAt: { $lt: now },
            status: {
                $nin: ["Resolved", "Closed", "Cancelled"]
            }
        })
            .populate("department", "name code")
            .sort({ dueAt: 1 });

        res.status(200).json({
            success: true,
            count: tickets.length,
            checkedAt: now,
            tickets
        });
    } catch (error) {
        next(error);
    }
};

// GET TICKET STATISTICS
const getTicketStats = async (req, res, next) => {
    try {
        const [
            total,
            open,
            assigned,
            inProgress,
            resolved,
            closed,
            cancelled,
            overdue
        ] = await Promise.all([
            Ticket.countDocuments(),
            Ticket.countDocuments({ status: "Open" }),
            Ticket.countDocuments({ status: "Assigned" }),
            Ticket.countDocuments({ status: "In Progress" }),
            Ticket.countDocuments({ status: "Resolved" }),
            Ticket.countDocuments({ status: "Closed" }),
            Ticket.countDocuments({ status: "Cancelled" }),
            Ticket.countDocuments({
                dueAt: { $lt: new Date() },
                status: {
                    $nin: ["Resolved", "Closed", "Cancelled"]
                }
            })
        ]);

        const byCategory = await Ticket.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const byPriority = await Ticket.aggregate([
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const byDepartment = await Ticket.aggregate([
            {
                $group: {
                    _id: "$department",
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "departments",
                    localField: "_id",
                    foreignField: "_id",
                    as: "department"
                }
            },
            {
                $unwind: "$department"
            },
            {
                $project: {
                    _id: 0,
                    department: "$department.name",
                    code: "$department.code",
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            summary: {
                total,
                open,
                assigned,
                inProgress,
                resolved,
                closed,
                cancelled,
                overdue
            },
            byCategory,
            byPriority,
            byDepartment
        });
    } catch (error) {
        next(error);
    }
};

// GET RESOLUTION ANALYTICS
const getTicketAnalytics = async (req, res, next) => {
    try {
        const resolvedTickets = await Ticket.find({
            resolvedAt: { $ne: null }
        }).select(
            "ticketNumber priority category status createdAt resolvedAt dueAt"
        );

        let totalResolutionHours = 0;
        let fastestResolution = null;
        let slowestResolution = null;
        let withinSla = 0;
        let breachedSla = 0;

        const resolutionData = resolvedTickets.map((ticket) => {
            const createdTime = new Date(ticket.createdAt).getTime();
            const resolvedTime = new Date(ticket.resolvedAt).getTime();

            const resolutionHours =
                (resolvedTime - createdTime) / (1000 * 60 * 60);

            totalResolutionHours += resolutionHours;

            if (
                fastestResolution === null ||
                resolutionHours < fastestResolution.hours
            ) {
                fastestResolution = {
                    ticketNumber: ticket.ticketNumber,
                    hours: Number(resolutionHours.toFixed(2))
                };
            }

            if (
                slowestResolution === null ||
                resolutionHours > slowestResolution.hours
            ) {
                slowestResolution = {
                    ticketNumber: ticket.ticketNumber,
                    hours: Number(resolutionHours.toFixed(2))
                };
            }

            if (ticket.resolvedAt <= ticket.dueAt) {
                withinSla++;
            } else {
                breachedSla++;
            }

            return {
                ticketNumber: ticket.ticketNumber,
                priority: ticket.priority,
                category: ticket.category,
                resolutionHours: Number(resolutionHours.toFixed(2)),
                slaMet: ticket.resolvedAt <= ticket.dueAt
            };
        });

        const averageResolutionHours =
            resolvedTickets.length > 0
                ? totalResolutionHours / resolvedTickets.length
                : 0;

        const slaComplianceRate =
            resolvedTickets.length > 0
                ? (withinSla / resolvedTickets.length) * 100
                : 0;

        res.status(200).json({
            success: true,
            analytics: {
                resolvedTickets: resolvedTickets.length,
                averageResolutionHours: Number(
                    averageResolutionHours.toFixed(2)
                ),
                fastestResolution,
                slowestResolution,
                withinSla,
                breachedSla,
                slaComplianceRate: Number(
                    slaComplianceRate.toFixed(2)
                )
            },
            resolutionData
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    updateTicketStatus,
    searchTickets,
    getOverdueTickets,
    getTicketStats,
    getTicketAnalytics
};