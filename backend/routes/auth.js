// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { handleValidation, registerRules, loginRules } = require("../middleware/validators");

router.post("/register", registerRules, handleValidation, registerUser);
router.post("/login", loginRules, handleValidation, loginUser);
router.get("/me", protect, getMe);

module.exports = router;
