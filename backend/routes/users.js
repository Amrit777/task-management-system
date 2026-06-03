// routes/users.js
const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ["id", "name", "email", "role"] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
