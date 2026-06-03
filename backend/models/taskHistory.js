module.exports = (sequelize, DataTypes) => {
  const TaskHistory = sequelize.define('TaskHistory', {
    changeLog: { type: DataTypes.TEXT, allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    indexes: [{ fields: ["taskId"] }, { fields: ["changedBy"] }],
  });

  TaskHistory.associate = (models) => {
    TaskHistory.belongsTo(models.Task, { foreignKey: "taskId" });
    TaskHistory.belongsTo(models.User, { as: "changedByUser", foreignKey: "changedBy" });
  };

  return TaskHistory;
};
