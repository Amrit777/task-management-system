const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("admin", "project_manager", "developer", "client"),
      defaultValue: "client",
    },
  });

  // Hook to hash password before saving it to the database
  User.beforeSave(async (user, options) => {
    if (user.changed("password")) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Compare entered password with the stored hashed password
  User.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Associations (remain unchanged)
  User.associate = (models) => {
    User.hasMany(models.Task, { foreignKey: "assignedTo" });
    User.hasMany(models.Comment, { foreignKey: "userId" });
    User.belongsToMany(models.Project, { through: "ProjectMembers" });
  };

  return User;
};
