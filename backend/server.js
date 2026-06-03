// backend/server.js — process entrypoint: init DB, start HTTP + sockets, handle shutdown.
const http = require("http");
const config = require("./config/env");
const app = require("./app");
const { connectDB, sequelize } = require("./config/db");
const socketInit = require("./sockets");

const start = async () => {
  // Fail fast: do not serve traffic without a database connection.
  try {
    await connectDB();
  } catch (err) {
    console.error("FATAL: Unable to connect to the database:", err.message);
    process.exit(1);
  }

  // Schema management. Production should rely on migrations (DB_SYNC=off).
  try {
    if (config.dbSync === "alter") {
      await sequelize.sync({ alter: true });
      console.log("Schema synced (alter)");
    } else if (config.dbSync === "safe") {
      await sequelize.sync();
      console.log("Schema synced (safe)");
    } else {
      console.log("Schema sync disabled (DB_SYNC=off) — using migrations");
    }
  } catch (err) {
    console.error("FATAL: Schema sync failed:", err.message);
    process.exit(1);
  }

  const server = http.createServer(app);
  socketInit(server);

  server.listen(config.port, () =>
    console.log(`Server running on port ${config.port}`)
  );

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      try {
        await sequelize.close();
      } catch (_) {
        /* ignore */
      }
      process.exit(0);
    });
    // Force-exit if connections don't drain in time.
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

start();
