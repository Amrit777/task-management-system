// backend/middleware/validators.js
const { body, param, validationResult } = require("express-validator");

// Collects express-validator results and returns 400 on failure.
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }
  next();
};

const registerRules = [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("A valid email is required"),
  // Cap at 72: bcrypt silently truncates beyond 72 bytes.
  body("password").isLength({ min: 8, max: 72 }).withMessage("Password must be 8-72 characters"),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("A valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const createTaskRules = [
  body("title").trim().isLength({ min: 1, max: 255 }).withMessage("Title is required"),
  body("priority").optional().isIn(["Low", "Medium", "High"]).withMessage("Invalid priority"),
  body("projectId").optional({ nullable: true }).isInt().withMessage("projectId must be an integer"),
  body("assignedTo").optional({ nullable: true }).isInt().withMessage("assignedTo must be an integer"),
];

const updateTaskRules = [
  param("id").isInt().withMessage("Invalid task id"),
  body("title").optional().trim().isLength({ min: 1, max: 255 }),
  body("priority").optional().isIn(["Low", "Medium", "High"]),
];

const createProjectRules = [
  body("title").trim().isLength({ min: 1, max: 255 }).withMessage("Title is required"),
  body("isPrivate").optional().isBoolean(),
  body("memberIds").optional().isArray().withMessage("memberIds must be an array"),
];

const addCommentRules = [
  body("text").trim().isLength({ min: 1, max: 5000 }).withMessage("Comment text is required"),
  body("taskId").isInt().withMessage("taskId must be an integer"),
];

const idParamRule = [param("id").isInt().withMessage("Invalid id")];

module.exports = {
  handleValidation,
  registerRules,
  loginRules,
  createTaskRules,
  updateTaskRules,
  createProjectRules,
  addCommentRules,
  idParamRule,
};
