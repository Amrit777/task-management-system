// backend/middleware/rateLimiter.js
const rateLimit = require("express-rate-limit");

// General API limiter.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

// Strict limiter for auth endpoints to slow brute-force / credential stuffing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only failed attempts count toward the limit
  message: { message: "Too many authentication attempts, please try again later." },
});

module.exports = { apiLimiter, authLimiter };
