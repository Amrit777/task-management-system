// backend/app.js
const express = require("express");
const cors = require("cors");
const apiLimiter = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorMiddleware");
const { connectDB } = require("./config/db");
const { sequelize } = require("./config/db");
require("dotenv").config();

const app = express();

// Connect to DB and sync models (use migrations in production)
connectDB();
sequelize.sync();  // Replace with migrations for production
// sequelize.sync({ force: true }).then(async () => {
//   console.log(
//     "Database synced with force: true (tables dropped and recreated)"
//   );

//   const { User, Project, Task } = require("./models"); // Adjust the path if needed
//   const bcrypt = require("bcryptjs");

//   const adminEmail = "admin@tms.com";
//   const adminPassword = "admin123";

//   let admin = await User.findOne({ where: { email: adminEmail } });

//   if (!admin) {
//     const hashedPassword = await bcrypt.hash(adminPassword, 10);
//     admin = await User.create({
//       name: "Admin User",
//       email: adminEmail,
//       password: hashedPassword,
//       role: "admin",
//     });
//     console.log("✅ Default admin created");
//   } else {
//     console.log("✅ Admin already exists");
//   }

//   const project = await Project.create({
//     title: "Sample Project",
//     description: "This is a demo project created by the system.",
//     isPrivate: false,
//   });

//   console.log("✅ Sample project created");

//   await Task.bulkCreate([
//     {
//       title: "Set up backend",
//       description: "Initial backend setup and auth flow",
//       startDate: new Date(),
//       estimatedTime: 10,
//       estimatedEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//       actualEndDate: null,
//       status: "To Do",
//       priority: "High",
//       dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
//       projectId: project.id,
//       assignedTo: admin.id,
//       createdBy: admin.id,
//     },
//     {
//       title: "Design UI mockups",
//       description: "Design UI components and layout",
//       startDate: new Date(),
//       estimatedTime: 8,
//       estimatedEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
//       actualEndDate: null,
//       status: "In Progress",
//       priority: "Medium",
//       dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//       projectId: project.id,
//       assignedTo: admin.id,
//       createdBy: admin.id,
//     },
//   ]);

//   console.log("✅ Dummy tasks created");
// });

app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/uploads", express.static("uploads"));

// Optionally, add file upload endpoints here

// Global Error Handler
app.use(errorHandler);

module.exports = app;
