// backend/models/task.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Task = sequelize.define("Task", {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  attachments: { type: DataTypes.JSON, allowNull: true }, // store an array of file URLs
  startDate: { type: DataTypes.DATE },
  estimatedTime: { type: DataTypes.FLOAT }, // in hours
  estimatedEndDate: { type: DataTypes.DATE },
  actualEndDate: { type: DataTypes.DATE },
  status: {
    type: DataTypes.ENUM("To Do", "In Progress", "Completed"),
    defaultValue: "To Do",
  },
  priority: {
    type: DataTypes.ENUM("Low", "Medium", "High"),
    defaultValue: "Medium",
  },
  dueDate: { type: DataTypes.DATE },
  // Foreign keys for user relationships are set up in associations
});

module.exports = Task;
