// backend/routes/projects.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  handleValidation,
  createProjectRules,
  idParamRule,
} = require("../middleware/validators");
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");
const { checkTitle } = require("../controllers/taskController");

router
  .route("/")
  .post(protect, createProjectRules, handleValidation, createProject)
  .get(protect, getProjects);

router
  .route("/:id")
  .get(protect, idParamRule, handleValidation, getProjectById)
  .put(protect, idParamRule, handleValidation, updateProject)
  .delete(protect, idParamRule, handleValidation, deleteProject);

router.get("/:projectId/tasks/title-check", protect, checkTitle);

module.exports = router;
