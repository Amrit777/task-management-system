// backend/config/config.js — configuration for sequelize-cli (migrations/seeders).
// Reads process.env directly so CLI commands don't depend on app secrets.
require("dotenv").config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: process.env.DB_DIALECT || "postgres",
  logging: false,
};

module.exports = {
  development: base,
  test: base,
  production: base,
};
