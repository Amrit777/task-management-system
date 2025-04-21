// backend/controllers/taskController.js
const { Task, TaskHistory, User } = require("../models");

exports.createTask = async (req, res, next) => {
  console.log("request.body", req.body);
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
      status: "todo",
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

// Normalize user-friendly status to DB-friendly
const normalizeStatus = (status) => {
  const map = {
    "To Do": "todo",
    "In Progress": "in-progress",
    Completed: "completed",
  };
  return map[status] || status;
};
exports.updateTask = async (req, res, next) => {
  console.log("req.body...", req);
  const { status } = req.body;
  console.log("status...", status);
  const normalizedStatus = normalizeStatus(status);
  try {
    console.log("normalizedStatus...", normalizedStatus);

    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const oldValues = task.toJSON();

    console.log("oldValues...", oldValues);

    // Normalize status if it's being updated
    if (req.body.status) {
      console.log("req.body.status1...", req.body.status);
      req.body.status = normalizeStatus(req.body.status);
      console.log("req.body.status2...", req.body.status);
    }

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

exports.checkTitle = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, excludeId } = req.query;

    if (!title) {
      return res
        .status(400)
        .json({ message: "Query parameter `title` is required" });
    }

    const existing = await Task.findOne({
      where: {
        projectId,
        title: title.trim(),
      },
    });

    // If found, but it's the same record we're editing, it's fine
    if (existing && excludeId && existing.id.toString() === excludeId) {
      return res.json({ available: true });
    }

    // Otherwise, available only if no existing record
    return res.json({ available: existing ? false : true });
  } catch (err) {
    next(err);
  }
};
