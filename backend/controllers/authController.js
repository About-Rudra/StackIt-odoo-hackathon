const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

exports.registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashed]
    );

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error registering user", error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: "Error logging in", error: err.message });
  }
};
