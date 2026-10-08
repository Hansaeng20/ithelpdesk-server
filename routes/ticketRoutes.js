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
    getTicketAnalytics
} = require("../controllers/ticketController");

const router = express.Router();

// Processing / analytics routes MUST come before /:id
router.get("/search", searchTickets);
router.get("/overdue", getOverdueTickets);
router.get("/stats", getTicketStats);
router.get("/analytics", getTicketAnalytics);

// Basic CRUD
router.get("/", getTickets);
router.post("/", createTicket);

router.patch("/:id/status", updateTicketStatus);

router.get("/:id", getTicket);
router.put("/:id", updateTicket);
router.delete("/:id", deleteTicket);

module.exports = router;