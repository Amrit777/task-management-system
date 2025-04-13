// backend/controllers/projectController.js
const { Project, User } = require('../models');

exports.createProject = async (req, res, next) => {
  try {
    const { title, description, isPrivate, memberIds } = req.body;
    const project = await Project.create({ title, description, isPrivate });
    // Associate project members if provided
    if (memberIds && memberIds.length) {
      const members = await User.findAll({ where: { id: memberIds } });
      await project.setUsers(members);
    }
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      include: [{ model: User, through: { attributes: [] }, attributes: ['id', 'name', 'email'] }],
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};
