// backend/utils/access.js
// Centralized authorization helpers. Authentication answers "who are you";
// these answer "what may you touch". Without a real tenancy model, access is
// scoped by project membership/ownership, task ownership/assignment, and role.
const { Op } = require("sequelize");
const { Project, Task } = require("../models");

const isAdmin = (user) => user && user.role === "admin";

// IDs of every project the user owns or is a member of.
const getAccessibleProjectIds = async (user) => {
  if (isAdmin(user)) {
    const all = await Project.findAll({ attributes: ["id"] });
    return all.map((p) => p.id);
  }
  const owned = await Project.findAll({ where: { ownerId: user.id }, attributes: ["id"] });
  const member = await user.getProjects({ attributes: ["id"] });
  const ids = new Set([...owned.map((p) => p.id), ...member.map((p) => p.id)]);
  return [...ids];
};

// Can the user see/use this project at all?
const canViewProject = async (user, project) => {
  if (!project) return false;
  if (isAdmin(user)) return true;
  if (project.ownerId === user.id) return true;
  const members = await project.getUsers({ attributes: ["id"], where: { id: user.id } });
  return members.length > 0;
};

// Mutating membership / deleting a project is owner/admin only.
const canManageProject = (user, project) => {
  if (!project) return false;
  return isAdmin(user) || project.ownerId === user.id;
};

// Task access: admin, creator, assignee, or a member of the task's project.
const canAccessTask = async (user, task) => {
  if (!task) return false;
  if (isAdmin(user)) return true;
  if (task.createdBy === user.id || task.assignedTo === user.id) return true;
  if (task.projectId) {
    const project = await Project.findByPk(task.projectId);
    return canViewProject(user, project);
  }
  return false;
};

// Build a Sequelize `where` that limits tasks to ones the user may see.
const taskScopeWhere = async (user) => {
  if (isAdmin(user)) return {};
  const projectIds = await getAccessibleProjectIds(user);
  return {
    [Op.or]: [
      { createdBy: user.id },
      { assignedTo: user.id },
      ...(projectIds.length ? [{ projectId: { [Op.in]: projectIds } }] : []),
    ],
  };
};

module.exports = {
  isAdmin,
  getAccessibleProjectIds,
  canViewProject,
  canManageProject,
  canAccessTask,
  taskScopeWhere,
};
