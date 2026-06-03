// backend/config/db.js
const { Sequelize } = require("sequelize");
const config = require("./env");

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: config.db.dialect,
  logging: config.isProd || config.isTest ? false : (msg) => console.debug(msg),
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
});

// Throws on failure so callers can decide to abort startup (fail fast).
const connectDB = async () => {
  await sequelize.authenticate();
  console.log("Database connected");
};

module.exports = { sequelize, connectDB };
