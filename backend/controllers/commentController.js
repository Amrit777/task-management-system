// backend/controllers/commentController.js
const { Comment, User, Task } = require("../models");
const { canAccessTask, isAdmin } = require("../utils/access");
const { notifyUser } = require("../utils/notify");

exports.addComment = async (req, res, next) => {
  try {
    const { text, taskId } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: "Comment text is required" });
    if (!taskId) return res.status(400).json({ message: "taskId is required" });

    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!(await canAccessTask(req.user, task))) {
      return res.status(403).json({ message: "Not authorized for this task" });
    }

    const comment = await Comment.create({ text: text.trim(), taskId, userId: req.user.id });
    const result = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ["id", "name", "email"] }],
    });

    // Notify the task's creator and assignee (except the commenter).
    const recipients = new Set([task.createdBy, task.assignedTo]);
    recipients.delete(req.user.id);
    for (const userId of recipients) {
      notifyUser(userId, {
        type: "comment",
        title: "New comment",
        message: `${req.user.name} commented on "${task.title}"`,
        taskId: task.id,
      });
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!(await canAccessTask(req.user, task))) {
      return res.status(403).json({ message: "Not authorized for this task" });
    }

    const comments = await Comment.findAll({
      where: { taskId: req.params.taskId },
      include: [{ model: User, attributes: ["id", "name", "email"] }],
      order: [["createdAt", "ASC"]],
    });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    // Comment author or an admin may delete.
    if (comment.userId !== req.user.id && !isAdmin(req.user)) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }
    await comment.destroy();
    res.json({ message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
};
