const express = require("express");

const {
    getDepartments,
    getDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment
} = require("../controllers/departmentController");

const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getDepartments);
router.get("/:id", getDepartment);
router.post("/", protect, authorize("IT Support"), createDepartment);
router.put("/:id", protect, authorize("IT Support"), updateDepartment);
router.delete("/:id", protect, authorize("IT Support"), deleteDepartment);

module.exports = router;
