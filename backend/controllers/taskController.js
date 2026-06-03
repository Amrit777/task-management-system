// backend/controllers/taskController.js
const { Task, TaskHistory, User, Project, Attachment, sequelize } = require("../models");
const { canAccessTask, canViewProject, taskScopeWhere, isAdmin } = require("../utils/access");
const { notifyUser } = require("../utils/notify");

// Whitelists prevent mass assignment (e.g. a client setting createdBy/id).
const CREATE_FIELDS = [
  "title", "description", "status", "priority", "dueDate", "assignedTo",
  "projectId", "startDate", "estimatedTime", "estimatedEndDate", "actualEndDate",
];
const UPDATE_FIELDS = [
  "title", "description", "status", "priority", "dueDate", "assignedTo",
  "startDate", "estimatedTime", "estimatedEndDate", "actualEndDate",
];

const pick = (obj, keys) =>
  keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

const normalizeStatus = (status) => {
  if (!status) return status;
  const map = { "To Do": "todo", "In Progress": "in-progress", Completed: "completed", Done: "completed" };
  return map[status] || status;
};

const taskIncludes = [
  { model: User, as: "assignedToUser", attributes: ["id", "name", "email"] },
  { model: User, as: "createdByUser", attributes: ["id", "name", "email"] },
];

exports.createTask = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const data = pick(req.body, CREATE_FIELDS);
    const createdBy = req.user.id;

    // If a project is targeted, the user must be able to view it.
    if (data.projectId) {
      const project = await Project.findByPk(data.projectId);
      if (!project) {
        await t.rollback();
        return res.status(404).json({ message: "Project not found" });
      }
      if (!(await canViewProject(req.user, project))) {
        await t.rollback();
        return res.status(403).json({ message: "Not authorized for this project" });
      }
    }

    const task = await Task.create(
      {
        ...data,
        assignedTo: data.assignedTo || createdBy,
        createdBy,
        status: normalizeStatus(data.status) || "todo",
        priority: data.priority || "Medium",
      },
      { transaction: t }
    );

    await TaskHistory.create(
      { taskId: task.id, changedBy: createdBy, changeLog: "Task created with status To Do" },
      { transaction: t }
    );

    // Persist uploaded attachments (previously discarded).
    if (Array.isArray(req.files) && req.files.length) {
      await Attachment.bulkCreate(
        req.files.map((f) => ({ taskId: task.id, fileName: f.originalname, filePath: f.filename })),
        { transaction: t }
      );
    }

    await t.commit();

    // Notify the assignee if the task was assigned to someone else.
    if (task.assignedTo && task.assignedTo !== createdBy) {
      notifyUser(task.assignedTo, {
        type: "task_assigned",
        title: "New task assigned",
        message: `${req.user.name} assigned you "${task.title}"`,
        taskId: task.id,
      });
    }

    res.status(201).json(task);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);

    const where = await taskScopeWhere(req.user);
    if (req.query.projectId) where.projectId = req.query.projectId;
    if (req.query.status) where.status = normalizeStatus(req.query.status);

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: taskIncludes,
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit,
      distinct: true,
    });

    res.json({ data: rows, page, limit, total: count, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: TaskHistory },
        { model: Attachment },
        { model: User, as: "assignedToUser", attributes: ["id", "name"] },
        { model: User, as: "createdByUser", attributes: ["id", "name"] },
      ],
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!(await canAccessTask(req.user, task))) {
      return res.status(403).json({ message: "Not authorized for this task" });
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const task = await Task.findByPk(req.params.id, { transaction: t });
    if (!task) {
      await t.rollback();
      return res.status(404).json({ message: "Task not found" });
    }
    if (!(await canAccessTask(req.user, task))) {
      await t.rollback();
      return res.status(403).json({ message: "Not authorized for this task" });
    }

    const updates = pick(req.body, UPDATE_FIELDS);
    if (updates.status) updates.status = normalizeStatus(updates.status);

    const oldValues = task.toJSON();
    await task.update(updates, { transaction: t });

    const changes = [];
    for (const key of Object.keys(updates)) {
      const oldVal = oldValues[key] instanceof Date ? oldValues[key].toISOString() : String(oldValues[key] ?? "");
      const newVal = String(updates[key] ?? "");
      if (oldVal !== newVal) changes.push(`${key}: ${oldVal} -> ${newVal}`);
    }
    if (changes.length) {
      await TaskHistory.create(
        { taskId: task.id, changedBy: req.user.id, changeLog: changes.join("; ") },
        { transaction: t }
      );
    }

    await t.commit();

    // Notify on (re)assignment to a different user.
    if (
      updates.assignedTo &&
      String(updates.assignedTo) !== String(oldValues.assignedTo) &&
      updates.assignedTo !== req.user.id
    ) {
      notifyUser(updates.assignedTo, {
        type: "task_assigned",
        title: "Task assigned to you",
        message: `${req.user.name} assigned you "${task.title}"`,
        taskId: task.id,
      });
    }

    const updatedTask = await Task.findByPk(task.id, { include: taskIncludes });
    res.json(updatedTask);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!(await canAccessTask(req.user, task))) {
      return res.status(403).json({ message: "Not authorized for this task" });
    }
    await task.destroy();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    // Scope stats to tasks the caller may see.
    const where = await taskScopeWhere(req.user);
    const countWhere = (extra) => Task.count({ where: { ...where, ...extra } });

    const [totalTasks, todoCount, inProgressCount, completedCount] = await Promise.all([
      countWhere({}),
      countWhere({ status: "todo" }),
      countWhere({ status: "in-progress" }),
      countWhere({ status: "completed" }),
    ]);

    const result = { totalTasks, todoCount, inProgressCount, completedCount };
    if (isAdmin(req.user)) {
      result.totalProjects = await Project.count();
      result.totalUsers = await User.count();
    }
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.checkTitle = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, excludeId } = req.query;
    if (!title) return res.status(400).json({ message: "Query parameter `title` is required" });

    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!(await canViewProject(req.user, project))) {
      return res.status(403).json({ message: "Not authorized for this project" });
    }

    const existing = await Task.findOne({ where: { projectId, title: title.trim() } });
    if (existing && excludeId && existing.id.toString() === excludeId) {
      return res.json({ available: true });
    }
    return res.json({ available: !existing });
  } catch (err) {
    next(err);
  }
};
