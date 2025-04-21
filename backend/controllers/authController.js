const jwt = require("jsonwebtoken");
const { User } = require("../models");
require("dotenv").config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Inside the registerUser method in authController.js
exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });

    // Check if token is generated correctly
    const token = generateToken(user.id);
    console.log("Generated Token:", token); // Log to ensure token is generated

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
    });
  } catch (error) {
    console.error("Registration Error:", error); // Log server-side error
    next(error);
  }
};

// Inside the loginUser method in authController.js
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    console.log("User found: ", user); // Debugging log

    const isMatch = await user.comparePassword(password);
    console.log("Password match: ", isMatch); // Debugging log

    if (isMatch) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid password", password: password });
    }
  } catch (error) {
    next(error);
  }
};
