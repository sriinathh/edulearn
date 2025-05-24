const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const hardcodedUser = {
  email: "admin@example.com",
  password: "admin123",
  username: "Admin"
};

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  if (email === hardcodedUser.email && password === hardcodedUser.password) {
    const token = jwt.sign(
      { userId: "hardcoded-id", username: hardcodedUser.username, email: hardcodedUser.email },
      "defaultsecret",
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      userId: "hardcoded-id",
      username: hardcodedUser.username,
      email: hardcodedUser.email,
    });
  }

  return res.status(400).json({ message: "Invalid email or password" });
});

const PORT = 5069;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
