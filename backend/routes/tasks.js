// backend/routes/tasks.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');

router
  .route('/')
  .post(protect, authorize('admin', 'project_manager', 'developer'), createTask)
  .get(protect, getTasks);

router
  .route('/:id')
  .put(protect, authorize('admin', 'project_manager', 'developer'), updateTask)
  .delete(protect, authorize('admin', 'project_manager'), deleteTask);

module.exports = router;
