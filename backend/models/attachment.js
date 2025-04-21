module.exports = (sequelize, DataTypes) => {
  const Attachment = sequelize.define("Attachment", {
    filePath: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Attachment.associate = (models) => {
    Attachment.belongsTo(models.Task, {
      foreignKey: "taskId",
      onDelete: "CASCADE",
    });
  };

  return Attachment;
};
