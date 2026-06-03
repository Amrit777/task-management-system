// backend/config/env.js
// Centralized, validated environment configuration.
// Fails fast on missing/weak critical config so the process never boots
// into an insecure or half-configured state.
require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

const required = ["JWT_SECRET", "DB_NAME", "DB_USER", "DB_HOST"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  // eslint-disable-next-line no-console
  console.error(
    `FATAL: Missing required environment variables: ${missing.join(", ")}`
  );
  process.exit(1);
}

const weakSecret =
  process.env.JWT_SECRET === "your_jwt_secret" ||
  process.env.JWT_SECRET.length < 32;

if (weakSecret) {
  if (isProd) {
    // eslint-disable-next-line no-console
    console.error(
      "FATAL: JWT_SECRET is the default placeholder or shorter than 32 chars. " +
        "Refusing to start in production. Generate one with: " +
        "node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\""
    );
    process.exit(1);
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      "WARNING: JWT_SECRET is weak/default. This is acceptable only in local development."
    );
  }
}

const parseList = (value, fallback) =>
  (value || fallback)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

module.exports = {
  isProd,
  isTest,
  port: parseInt(process.env.PORT, 10) || 5000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigins: parseList(
    process.env.CORS_ORIGINS,
    "http://localhost:3005,http://localhost:5173,http://localhost:8080"
  ),
  // Controls automatic schema sync. Real deployments should use migrations.
  // "alter" = dev convenience, "safe" = create-missing only, "off" = do nothing.
  dbSync: process.env.DB_SYNC || (isProd ? "off" : "alter"),
  db: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: process.env.DB_DIALECT || "postgres",
  },
};
