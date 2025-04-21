module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("Task", {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    startDate: { type: DataTypes.DATE },
    estimatedTime: { type: DataTypes.FLOAT },
    estimatedEndDate: { type: DataTypes.DATE },
    actualEndDate: { type: DataTypes.DATE },
    status: {
      type: DataTypes.ENUM("todo", "in-progress", "completed"),
      allowNull: false,
      defaultValue: "todo",
    },
    priority: {
      type: DataTypes.ENUM("Low", "Medium", "High"),
      defaultValue: "Medium",
    },
    dueDate: { type: DataTypes.DATE },
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      as: "assignedToUser",
      foreignKey: "assignedTo",
    });
    Task.belongsTo(models.User, {
      as: "createdByUser",
      foreignKey: "createdBy",
    });
    Task.belongsTo(models.Project, { foreignKey: "projectId" });
    Task.hasMany(models.Comment, { foreignKey: "taskId" });
    Task.hasMany(models.Attachment, { foreignKey: "taskId" });
    Task.hasMany(models.TaskHistory, {
      foreignKey: "taskId",
      onDelete: "CASCADE",
    });
  };

  return Task;
};
