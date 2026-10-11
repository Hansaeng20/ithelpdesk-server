const express = require("express");

const {
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket,
    updateTicketStatus,
    searchTickets,
    getOverdueTickets,
    getTicketStats,
    getTicketAnalytics,
} = require("../controllers/ticketController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Ticket viewing
router.get("/", protect, getTickets);

router.get("/search", protect, searchTickets);

router.get("/overdue", protect, getOverdueTickets);

// Analytics are IT Support only
router.get(
    "/stats",
    protect,
    authorize("IT Support"),
    getTicketStats
);

router.get(
    "/analytics",
    protect,
    authorize("IT Support"),
    getTicketAnalytics
);

router.post(
    "/",
    protect,
    authorize("Employee"),
    createTicket
);

router.get("/:id", protect, getTicket);


router.put("/:id", protect, updateTicket);

router.delete("/:id", protect, deleteTicket);

router.patch(
    "/:id/status",
    protect,
    authorize("IT Support"),
    updateTicketStatus
);

module.exports = router;