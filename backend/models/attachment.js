// backend/models/attachment.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Attachment = sequelize.define('Attachment', {
  filename: { type: DataTypes.STRING, allowNull: false },
  fileUrl: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Attachment;
