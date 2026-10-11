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
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", authorize("IT Support"), getComments);

router.post("/", createComment);

router.get("/ticket/:ticketId", getTicketComments);

router.get("/:id", getComment);

router.put("/:id", authorize("IT Support"), updateComment);

router.delete("/:id", authorize("IT Support"), deleteComment);

module.exports = router;
