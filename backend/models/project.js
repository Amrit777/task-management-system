// backend/models/project.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Project = sequelize.define('Project', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  isPrivate: { type: DataTypes.BOOLEAN, defaultValue: true },
});

module.exports = Project;
