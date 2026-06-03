// backend/routes/comments.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { handleValidation, addCommentRules, idParamRule } = require("../middleware/validators");
const { addComment, getComments, deleteComment } = require("../controllers/commentController");

router.post("/", protect, addCommentRules, handleValidation, addComment);
router.get("/:taskId", protect, getComments);
router.delete("/:id", protect, idParamRule, handleValidation, deleteComment);

module.exports = router;
