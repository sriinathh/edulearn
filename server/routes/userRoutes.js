const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

const hardcodedUser = {
  email: "admin@example.com",
  password: "admin123",
  username: "Admin"
};

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === hardcodedUser.email && password === hardcodedUser.password) {
    const token = jwt.sign(
      { userId: "hardcoded-id", username: hardcodedUser.username, email: hardcodedUser.email },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful (hardcoded user)",
      token,
      userId: "hardcoded-id",
      username: hardcodedUser.username,
      email: hardcodedUser.email,
      profilePic: "https://via.placeholder.com/100",
      createdAt: new Date()
    });
  }

  return res.status(400).json({ message: "Invalid email or password" });
});

router.post("/register", (req, res) => {
  res.status(403).json({ message: "Register route disabled in hardcoded login mode." });
});

router.get("/profile", (req, res) => {
  res.status(403).json({ message: "Profile route disabled in hardcoded login mode." });
});

router.post("/update-profile", (req, res) => {
  res.status(403).json({ message: "Update profile route disabled in hardcoded login mode." });
});

module.exports = router;
