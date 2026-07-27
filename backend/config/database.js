const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DATABASE_PORT,
});

app.post("/login", async (req, res) => {
  const { user_name, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE user_name = $1",
      [user_name]
    );

    const row = result.rows[0];

    if (!row) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    if (row.password !== password) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: row.id, user_name: row.user_name, role: row.role },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token: token,
      role: row.role,
      user_id: row.id
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access token missing" });

  jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// Route to fetch stories based on user role
app.get("/api/writings", authenticateToken, async (req, res) => {
  try {
    let result;
    if (req.user.role === "admin") {
      // Admin sees everything
      result = await pool.query("SELECT * FROM stories");
    } else if (req.user.role === "author") {
      // Author only sees their own writings
      result = await pool.query("SELECT * FROM stories WHERE author_id = $1", [req.user.id]);
    } else {
      // User sees all writings
      result = await pool.query("SELECT * FROM stories");
    }
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching writings" });
  }
});

app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "This is top secret data!",
    user: req.user,
    data: [1, 2, 3, 4, 5]
  });
});

app.listen(process.env.PORT, () => {
  console.log("Server running");
});