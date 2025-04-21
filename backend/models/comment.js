module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    text: { type: DataTypes.TEXT, allowNull: false },
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, { foreignKey: "userId" });
    Comment.belongsTo(models.Task, { foreignKey: "taskId" });
  };

  return Comment;
};