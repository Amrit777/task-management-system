// backend/controllers/taskController.js
const { Task, TaskHistory, User } = require("../models");

exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo,
      projectId,
      startDate,
      estimatedTime,
      estimatedEndDate,
      actualEndDate,
    } = req.body;

    // Get attachments file URLs from req.files (if provided)
    let attachments = [];
    if (req.files) {
      attachments = req.files.map((file) => `/uploads/${file.filename}`);
    }

    // createdBy is obtained from the logged-in user. Assume req.user is set by auth middleware.
    const createdBy = req.user.id;

    const task = await Task.create({
      title,
      description,
      attachments,
      startDate,
      estimatedTime,
      estimatedEndDate,
      actualEndDate,
      assignedTo: assignedTo || createdBy, // default to self if not provided
      createdBy,
      status: "To Do",
      priority,
      dueDate,
      assignedTo,
      projectId,
    });
    // Log history
    await TaskHistory.create({
      taskId: task.id,
      changedBy: createdBy,
      changeLog: "Task created with status To Do",
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.findAll({
      include: [
        {
          model: User,
          as: "assignedToUser",
          attributes: ["id", "name", "email"],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "name", "email"],
        },
      ],
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// Get single task
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: TaskHistory },
        { model: User, as: "assignedToUser", attributes: ["id", "name"] },
        { model: User, as: "createdByUser", attributes: ["id", "name"] },
      ],
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    next(error);
  }
};
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const oldValues = task.toJSON();

    await task.update(req.body);

    // Determine what changed (simple diff)
    let changes = [];
    for (let key in req.body) {
      if (oldValues[key] != req.body[key]) {
        changes.push(`${key}: ${oldValues[key]} -> ${req.body[key]}`);
      }
    }

    // Log each change if any changes exist
    if (changes.length > 0) {
      await TaskHistory.create({
        taskId: task.id,
        changedBy: req.user.id,
        changeLog: changes.join("; "),
      });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    await task.destroy();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
