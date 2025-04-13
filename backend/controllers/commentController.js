// backend/controllers/commentController.js
const { Comment } = require('../models');

exports.addComment = async (req, res, next) => {
  try {
    const { text, taskId } = req.body;
    const comment = await Comment.create({
      text,
      taskId,
      userId: req.user.id,
    });
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.findAll({ where: { taskId: req.params.taskId } });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};
