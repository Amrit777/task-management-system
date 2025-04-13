const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const db = {};

// Dynamically import all models in this directory
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    const modelDefiner = require(path.join(__dirname, file));
    const model = modelDefiner(sequelize, DataTypes);
    db[model.name] = model;
  });

// Run associate() if it exists
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Additional manual associations (if needed)
const { User, Project, Task, Comment, Attachment, TaskHistory } = db;

// Custom associations if not in models
Task.belongsTo(User, { as: "assignedToUser", foreignKey: "assignedTo" });
Task.belongsTo(User, { as: "createdByUser", foreignKey: "createdBy" });

Task.hasMany(TaskHistory, { foreignKey: "taskId", onDelete: "CASCADE" });
TaskHistory.belongsTo(Task, { foreignKey: "taskId" });
TaskHistory.belongsTo(User, { as: "changedByUser", foreignKey: "changedBy" });

User.hasMany(Task, { foreignKey: "assignedTo" });
Task.belongsTo(User, { foreignKey: "assignedTo" });

User.hasMany(Comment, { foreignKey: "userId" });
Comment.belongsTo(User, { foreignKey: "userId" });

Project.hasMany(Task, { foreignKey: "projectId" });
Task.belongsTo(Project, { foreignKey: "projectId" });

Project.belongsToMany(User, { through: "ProjectMembers" });
User.belongsToMany(Project, { through: "ProjectMembers" });

Task.hasMany(Comment, { foreignKey: "taskId" });
Comment.belongsTo(Task, { foreignKey: "taskId" });

Task.hasMany(Attachment, { foreignKey: "taskId" });
Attachment.belongsTo(Task, { foreignKey: "taskId" });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
