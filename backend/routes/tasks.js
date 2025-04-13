// backend/routes/tasks.js
const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload"); // Multer middleware
const { protect } = require("../middleware/authMiddleware");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

// Protect these routes with your authentication middleware
router.post(
  "/",
  protect,
  upload.array("attachments"), // expect field name "attachments", allowing multiple files
  createTask
);
router.get("/", protect, getTasks);
router.get("/:id", protect, getTaskById);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);

module.exports = router;
