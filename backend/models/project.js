module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    isPrivate: { type: DataTypes.BOOLEAN, defaultValue: true },
  });

  Project.associate = (models) => {
    Project.hasMany(models.Task, { foreignKey: "projectId" });
    Project.belongsToMany(models.User, { through: "ProjectMembers" });
  };

  return Project;
};