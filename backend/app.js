// backend/app.js — express app wiring only (no side effects on import).
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const config = require("./config/env");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorMiddleware");
const { protect } = require("./middleware/authMiddleware");

const app = express();

// Behind a reverse proxy / load balancer (Docker, nginx, cloud LB), trust the
// first proxy hop so rate limiting and IP logging use the real client IP.
app.set("trust proxy", 1);

app.use(helmet());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / non-browser clients (no Origin header).
      if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Liveness/readiness probe — no auth, no DB dependency for liveness.
app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// Strict limiter on auth endpoints (brute-force / credential stuffing defense).
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// General API rate limit.
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/users", require("./routes/users"));

// Uploaded files require authentication (no longer world-readable).
app.use("/uploads", protect, express.static("uploads"));

// 404 for unmatched API routes.
app.use((req, res) => res.status(404).json({ message: "Not found" }));

// Global error handler (must be last).
app.use(errorHandler);

module.exports = app;
