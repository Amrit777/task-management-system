"use strict";

/**
 * Initial schema. Reproduces the model definitions as an explicit, reviewable
 * migration so production never relies on sequelize.sync().
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, STRING, TEXT, BOOLEAN, FLOAT, DATE, ENUM } = Sequelize;
    const now = { type: DATE, allowNull: false };
    const userRef = { type: INTEGER, references: { model: "Users", key: "id" }, onUpdate: "CASCADE" };

    await queryInterface.createTable("Users", {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: STRING, allowNull: false },
      email: { type: STRING, allowNull: false, unique: true },
      password: { type: STRING, allowNull: false },
      role: { type: ENUM("admin", "project_manager", "developer", "client"), defaultValue: "client" },
      createdAt: now,
      updatedAt: now,
    });

    await queryInterface.createTable("Projects", {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: STRING, allowNull: false },
      description: { type: TEXT },
      isPrivate: { type: BOOLEAN, defaultValue: true },
      ownerId: { ...userRef, onDelete: "SET NULL" },
      createdAt: now,
      updatedAt: now,
    });

    await queryInterface.createTable("Tasks", {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: STRING, allowNull: false },
      description: { type: TEXT },
      startDate: { type: DATE },
      estimatedTime: { type: FLOAT },
      estimatedEndDate: { type: DATE },
      actualEndDate: { type: DATE },
      status: { type: ENUM("todo", "in-progress", "completed"), allowNull: false, defaultValue: "todo" },
      priority: { type: ENUM("Low", "Medium", "High"), defaultValue: "Medium" },
      dueDate: { type: DATE },
      projectId: { type: INTEGER, references: { model: "Projects", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
      assignedTo: { ...userRef, onDelete: "SET NULL" },
      createdBy: { ...userRef, onDelete: "SET NULL" },
      createdAt: now,
      updatedAt: now,
    });

    await queryInterface.createTable("Comments", {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      text: { type: TEXT, allowNull: false },
      userId: { ...userRef, onDelete: "SET NULL" },
      taskId: { type: INTEGER, references: { model: "Tasks", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      createdAt: now,
      updatedAt: now,
    });

    await queryInterface.createTable("TaskHistories", {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      changeLog: { type: TEXT, allowNull: false },
      timestamp: { type: DATE, defaultValue: Sequelize.fn("NOW") },
      taskId: { type: INTEGER, references: { model: "Tasks", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      changedBy: { ...userRef, onDelete: "SET NULL" },
      createdAt: now,
      updatedAt: now,
    });

    await queryInterface.createTable("Attachments", {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      filePath: { type: TEXT, allowNull: false },
      fileName: { type: STRING, allowNull: false },
      taskId: { type: INTEGER, references: { model: "Tasks", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      createdAt: now,
      updatedAt: now,
    });

    await queryInterface.createTable("ProjectMembers", {
      ProjectId: { type: INTEGER, primaryKey: true, references: { model: "Projects", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      UserId: { type: INTEGER, primaryKey: true, references: { model: "Users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
      createdAt: now,
      updatedAt: now,
    });

    await queryInterface.addIndex("Tasks", ["projectId"], { name: "tasks_project_id" });
    await queryInterface.addIndex("Tasks", ["assignedTo"], { name: "tasks_assigned_to" });
    await queryInterface.addIndex("Tasks", ["createdBy"], { name: "tasks_created_by" });
    await queryInterface.addIndex("Tasks", ["status"], { name: "tasks_status" });
    await queryInterface.addIndex("Tasks", ["dueDate"], { name: "tasks_due_date" });
    await queryInterface.addIndex("Comments", ["taskId"], { name: "comments_task_id" });
    await queryInterface.addIndex("Comments", ["userId"], { name: "comments_user_id" });
    await queryInterface.addIndex("TaskHistories", ["taskId"], { name: "task_histories_task_id" });
    await queryInterface.addIndex("TaskHistories", ["changedBy"], { name: "task_histories_changed_by" });
    await queryInterface.addIndex("Attachments", ["taskId"], { name: "attachments_task_id" });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ProjectMembers");
    await queryInterface.dropTable("Attachments");
    await queryInterface.dropTable("TaskHistories");
    await queryInterface.dropTable("Comments");
    await queryInterface.dropTable("Tasks");
    await queryInterface.dropTable("Projects");
    await queryInterface.dropTable("Users");
    // Drop ENUM types created alongside the tables.
    for (const t of ["enum_Users_role", "enum_Tasks_status", "enum_Tasks_priority"]) {
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${t}";`);
    }
  },
};
