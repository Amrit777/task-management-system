// backend/app.js
const express = require('express');
const cors = require('cors');
const apiLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorMiddleware');
const { connectDB } = require('./config/db');
const { sequelize } = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to DB and sync models (use migrations in production)
connectDB();
sequelize.sync();  // Replace with migrations for production

app.use(cors());
app.use(express.json());
app.use(apiLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));
// Optionally, add file upload endpoints here

// Global Error Handler
app.use(errorHandler);

module.exports = app;
