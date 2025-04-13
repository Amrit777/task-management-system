// backend/models/index.js
const { sequelize } = require('../config/db');

const User = require('./user');
const Project = require('./project');
const Task = require('./task');
const Comment = require('./comment');
const Attachment = require('./attachment');

// Associations

// User to Task
User.hasMany(Task, { foreignKey: 'assignedTo' });
Task.belongsTo(User, { foreignKey: 'assignedTo' });

// User to Comment
User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

// Project to Task and many-to-many with User (Project Members)
Project.hasMany(Task, { foreignKey: 'projectId' });
Task.belongsTo(Project, { foreignKey: 'projectId' });
Project.belongsToMany(User, { through: 'ProjectMembers' });
User.belongsToMany(Project, { through: 'ProjectMembers' });

// Task to Comment and Attachment
Task.hasMany(Comment, { foreignKey: 'taskId' });
Comment.belongsTo(Task, { foreignKey: 'taskId' });

Task.hasMany(Attachment, { foreignKey: 'taskId' });
Attachment.belongsTo(Task, { foreignKey: 'taskId' });

module.exports = {
  sequelize,
  User,
  Project,
  Task,
  Comment,
  Attachment,
};
