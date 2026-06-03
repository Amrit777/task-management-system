"use strict";
const bcrypt = require("bcryptjs");

/**
 * Bootstraps an initial admin from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 * Idempotent: does nothing if the env vars are unset or the user already exists.
 * Without this there is no way to obtain an admin account (registration is
 * hardcoded to the "developer" role).
 */
module.exports = {
  async up(queryInterface) {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "";
    if (!email || !password) {
      // eslint-disable-next-line no-console
      console.log("admin seeder skipped: ADMIN_EMAIL/ADMIN_PASSWORD not set");
      return;
    }

    const [existing] = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" WHERE email = :email',
      { replacements: { email }, type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    if (existing) {
      console.log(`admin seeder skipped: ${email} already exists`);
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const now = new Date();
    await queryInterface.bulkInsert("Users", [
      { name: "Administrator", email, password: hash, role: "admin", createdAt: now, updatedAt: now },
    ]);
    console.log(`admin user created: ${email}`);
  },

  async down(queryInterface) {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    if (email) await queryInterface.bulkDelete("Users", { email });
  },
};
