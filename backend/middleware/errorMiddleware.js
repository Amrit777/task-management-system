// backend/middleware/errorMiddleware.js
const config = require("../config/env");

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Map well-known error types to sane status codes.
  let status = err.statusCode || err.status || 500;
  if (err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError") {
    status = 400;
  }
  if (/not allowed by CORS/i.test(err.message || "")) {
    status = 403;
  }
  if (err.name === "MulterError" || /File type not allowed/i.test(err.message || "")) {
    status = 400;
  }

  // Always log server-side for observability.
  // eslint-disable-next-line no-console
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  // Never leak internals (stack traces, SQL) to clients in production.
  const clientMessage =
    status >= 500 && config.isProd ? "Internal server error" : err.message || "Server Error";

  const body = { message: clientMessage };
  if (!config.isProd && err.stack) body.stack = err.stack;
  res.status(status).json(body);
};

module.exports = errorHandler;
