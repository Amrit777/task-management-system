// routes/users.js
const express = require("express");
const router = express.Router();
const { User } = require("../models");

router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ["id", "name"] });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

module.exports = router;
