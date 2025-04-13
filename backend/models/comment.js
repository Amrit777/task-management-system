// backend/models/comment.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Comment = sequelize.define('Comment', {
  text: { type: DataTypes.TEXT, allowNull: false },
});

module.exports = Comment;
