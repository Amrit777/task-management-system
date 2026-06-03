// backend/controllers/projectController.js
const { Project, User, Task, sequelize } = require("../models");
const { canViewProject, canManageProject, getAccessibleProjectIds, isAdmin } = require("../utils/access");

const PROJECT_FIELDS = ["title", "description", "isPrivate"];
const pick = (obj, keys) =>
  keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

const memberInclude = {
  model: User,
  through: { attributes: [] },
  attributes: ["id", "name", "email"],
};

exports.createProject = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const data = pick(req.body, PROJECT_FIELDS);
    const { memberIds } = req.body;

    const project = await Project.create({ ...data, ownerId: req.user.id }, { transaction: t });

    // Owner is always a member; merge in any requested members.
    const ids = new Set([req.user.id, ...((Array.isArray(memberIds) && memberIds) || [])]);
    const members = await User.findAll({ where: { id: [...ids] }, transaction: t });
    await project.setUsers(members, { transaction: t });

    await t.commit();
    const result = await Project.findByPk(project.id, { include: [memberInclude] });
    res.status(201).json(result);
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

exports.getProjects = async (req, res, next) => {
  try {
    const accessibleIds = await getAccessibleProjectIds(req.user);
    const where = isAdmin(req.user) ? {} : { id: accessibleIds };

    const projects = await Project.findAll({
      where,
      include: [memberInclude, { model: Task, attributes: ["id", "status"] }],
    });

    const result = projects.map((p) => {
      const pj = p.toJSON();
      pj.totalTasks = pj.Tasks ? pj.Tasks.length : 0;
      pj.completedTasks = pj.Tasks ? pj.Tasks.filter((tk) => tk.status === "completed").length : 0;
      delete pj.Tasks;
      return pj;
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [memberInclude, { model: Task }],
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!(await canViewProject(req.user, project))) {
      return res.status(403).json({ message: "Not authorized for this project" });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!(await canManageProject(req.user, project))) {
      return res.status(403).json({ message: "Not authorized to modify this project" });
    }

    await project.update(pick(req.body, PROJECT_FIELDS));
    if (Array.isArray(req.body.memberIds)) {
      // Keep the owner as a member regardless of the requested list.
      const ids = new Set([project.ownerId, ...req.body.memberIds]);
      const members = await User.findAll({ where: { id: [...ids] } });
      await project.setUsers(members);
    }

    const result = await Project.findByPk(project.id, { include: [memberInclude] });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!(await canManageProject(req.user, project))) {
      return res.status(403).json({ message: "Not authorized to delete this project" });
    }
    await project.destroy();
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};
