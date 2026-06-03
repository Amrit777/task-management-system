// backend/routes/tasks.js
const express = require("express");
const router = express.Router();
const upload = require("../utils/fileUpload");
const { protect } = require("../middleware/authMiddleware");
const {
  handleValidation,
  createTaskRules,
  updateTaskRules,
  idParamRule,
} = require("../middleware/validators");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getStats,
} = require("../controllers/taskController");

router.get("/stats", protect, getStats);
router.post("/", protect, upload.array("attachments"), createTaskRules, handleValidation, createTask);
router.get("/", protect, getTasks);
router.get("/:id", protect, idParamRule, handleValidation, getTaskById);
router.put("/:id", protect, updateTaskRules, handleValidation, updateTask);
router.delete("/:id", protect, idParamRule, handleValidation, deleteTask);

module.exports = router;
