const express = require("express");

const {
    getComments,
    getComment,
    getTicketComments,
    createComment,
    updateComment,
    deleteComment
} = require("../controllers/commentController");

const router = express.Router();

router.get("/", getComments);

router.post("/", createComment);

router.get("/ticket/:ticketId", getTicketComments);

router.get("/:id", getComment);

router.put("/:id", updateComment);

router.delete("/:id", deleteComment);

module.exports = router;