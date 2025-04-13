// backend/models/taskHistory.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TaskHistory = sequelize.define('TaskHistory', {
  changeLog: { type: DataTypes.TEXT, allowNull: false },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

// Associations will be defined in your models/index.js
module.exports = TaskHistory;
