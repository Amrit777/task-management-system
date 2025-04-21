// backend/routes/projects.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  createProject,
  getProjects,
} = require("../controllers/projectController");
const { checkTitle } = require("../controllers/taskController");

// Create a project (admins & PMs) / List projects (any authenticated user)
router
  .route("/")
  .post(protect, authorize("admin", "project_manager"), createProject)
  .get(protect, getProjects);

// Title‑check for tasks in a project
// GET /api/projects/:projectId/tasks/title-check?title=...
router.get("/:projectId/tasks/title-check", protect, checkTitle);

module.exports = router;
