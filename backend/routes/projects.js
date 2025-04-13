// backend/routes/projects.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createProject, getProjects } = require('../controllers/projectController');

router
  .route('/')
  .post(protect, authorize('admin', 'project_manager'), createProject)
  .get(protect, getProjects);

module.exports = router;
