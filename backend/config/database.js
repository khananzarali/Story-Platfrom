const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const { createClient } = require("redis");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

// --- REDIS CACHE SETUP & RESILIENCE ---
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
let isRedisConnected = false;

const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.warn("⚠️ Redis reconnect attempts exceeded. Running without caching.");
        return false;
      }
      return Math.min(retries * 100, 1000);
    },
  },
});

redisClient.on("error", (err) => {
  if (isRedisConnected) {
    console.warn("⚠️ Redis Client Error:", err.message);
  }
});

redisClient.on("connect", () => {
  console.log("⚡ Connected to Redis Cache at", redisUrl);
  isRedisConnected = true;
});

redisClient.on("end", () => {
  isRedisConnected = false;
});

// Attempt non-blocking connection
redisClient.connect().catch((err) => {
  console.warn("⚠️ Initial Redis connection failed. Running without Redis cache:", err.message);
  isRedisConnected = false;
});

// Cache Helper Functions
const getFromCache = async (key) => {
  if (!isRedisConnected) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error reading key "${key}" from Redis:`, err.message);
    return null;
  }
};

const saveToCache = async (key, value, ttlSeconds = 3600) => {
  if (!isRedisConnected) return false;
  try {
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return true;
  } catch (err) {
    console.error(`Error writing key "${key}" to Redis:`, err.message);
    return false;
  }
};

const invalidateCache = async (pattern = "writings*") => {
  if (!isRedisConnected) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🧹 Invalidated ${keys.length} Redis cache key(s) matching "${pattern}"`);
    }
  } catch (err) {
    console.error("Error invalidating Redis cache:", err.message);
  }
};

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DATABASE_PORT,
});

// Helper for JWT generation
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, user_name: user.user_name, role: user.role },
    process.env.JWT_SECRET || "fallback_secret_key",
    { expiresIn: "12h" }
  );
};

// --- AUTHENTICATION ENDPOINTS ---

// Login Endpoint with Bcrypt verification
app.post("/login", async (req, res) => {
  const { user_name, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE user_name = $1",
      [user_name]
    );
    const row = result.rows[0];

    if (!row) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, row.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(row);

    res.json({
      message: "Login successful",
      token: token,
      role: row.role,
      user_id: row.id,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Signup Endpoint
app.post("/api/signup", async (req, res) => {
  const { user_name, password, role } = req.body;

  if (!user_name || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const assignedRole = role === "author" ? "author" : "user";

  try {
    const existing = await pool.query("SELECT id FROM users WHERE user_name = $1", [user_name]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Username is already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (user_name, password, role) VALUES ($1, $2, $3) RETURNING id, user_name, role",
      [user_name, hashedPassword, assignedRole]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    res.status(201).json({
      message: "Account created successfully",
      token: token,
      role: newUser.role,
      user_id: newUser.id,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// --- JWT MIDDLEWARE ---
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


// --- EXTERNAL API CACHING ENDPOINT (Google Books API) ---
// Caches external API data in Redis so only one API request is made and then it is saved
app.get("/api/recommendations/daily", async (req, res) => {
  const cacheKey = "google_books_recommendations_daily";

  try {
    // 1. Check Redis Cache first
    const cachedData = await getFromCache(cacheKey);
    if (cachedData) {
      console.log("⚡ [Redis Cache HIT] Returning cached Google Books API data");
      return res.json({ ...cachedData, cached: true });
    }

    // 2. If not cached, make ONE API request to Google Books API
    console.log("🌐 [Redis Cache MISS] Fetching from Google Books API...");
    const response = await axios.get(
      "https://www.googleapis.com/books/v1/volumes?q=subject:fiction+classic+bestsellers&maxResults=40"
    );

    const data = response.data || {};

    // 3. Save the response in Redis for 24 hours (86400 seconds) so only one API request is made
    await saveToCache(cacheKey, data, 86400);
    console.log("💾 Saved Google Books API response to Redis Cache (TTL: 24h)");

    return res.json({ ...data, cached: false });
  } catch (error) {
    console.error("Error fetching daily recommendation API:", error.message);
    res.status(500).json({ message: "Failed to fetch book recommendation data" });
  }
});

// --- WRITINGS / STORIES CRUD ENDPOINTS ---

// GET stories with search, category filter, and like count
app.get("/api/writings", authenticateToken, async (req, res) => {
  const { search, category } = req.query;

  try {
    const cacheKey = `writings:${req.user.role}:${req.user.role === "author" ? req.user.id : "all"}:${category || "All"}:${search || ""}`;
    const cachedWritings = await getFromCache(cacheKey);
    if (cachedWritings) {
      console.log(`⚡ [Redis Cache HIT] Returning cached writings for ${cacheKey}`);
      return res.json(cachedWritings);
    }

    let queryStr = `
      SELECT s.*, 
        (SELECT COUNT(*)::int FROM likes l WHERE l.story_id = s.id) AS likes_count,
        (SELECT COUNT(*)::int FROM comments c WHERE c.story_id = s.id) AS comments_count
      FROM stories s
      WHERE 1=1
    `;
    const params = [];

    // RBAC filtering: Authors see only their own writings
    if (req.user.role === "author") {
      params.push(req.user.id);
      queryStr += ` AND s.author_id = $${params.length}`;
    }

    if (category && category !== "All") {
      params.push(category);
      queryStr += ` AND s.category = $${params.length}`;
    }

    if (search && search.trim() !== "") {
      params.push(`%${search.trim()}%`);
      queryStr += ` AND (s.title ILIKE $${params.length} OR s.content ILIKE $${params.length})`;
    }

    queryStr += ` ORDER BY s.id DESC`;

    const result = await pool.query(queryStr, params);
    await saveToCache(cacheKey, result.rows, 3600);
    console.log(`💾 [Redis Cache MISS] Saved writings to Redis cache (${cacheKey})`);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch writings error:", error);
    res.status(500).json({ message: "Server error fetching writings" });
  }
});

// POST create new story (author or admin only)
app.post("/api/writings", authenticateToken, async (req, res) => {
  if (req.user.role !== "author" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only authors or admins can publish stories." });
  }

  const { title, content, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  const cat = category || "Literary Fiction";

  try {
    const result = await pool.query(
      "INSERT INTO stories (title, content, category, author_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [title, content, cat, req.user.id]
    );
    await invalidateCache("writings*");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create writing error:", error);
    res.status(500).json({ message: "Server error creating story" });
  }
});

// PUT update story (owner author or admin only)
app.put("/api/writings/:id", authenticateToken, async (req, res) => {
  const storyId = req.params.id;
  const { title, content, category } = req.body;

  try {
    const check = await pool.query("SELECT * FROM stories WHERE id = $1", [storyId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Story not found" });
    }

    const story = check.rows[0];
    if (story.author_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to edit this story." });
    }

    const updated = await pool.query(
      "UPDATE stories SET title = $1, content = $2, category = $3 WHERE id = $4 RETURNING *",
      [title || story.title, content || story.content, category || story.category, storyId]
    );

    await invalidateCache("writings*");
    res.json(updated.rows[0]);
  } catch (error) {
    console.error("Update writing error:", error);
    res.status(500).json({ message: "Server error updating story" });
  }
});

// DELETE story (owner author or admin only)
app.delete("/api/writings/:id", authenticateToken, async (req, res) => {
  const storyId = req.params.id;

  try {
    const check = await pool.query("SELECT * FROM stories WHERE id = $1", [storyId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ message: "Story not found" });
    }

    const story = check.rows[0];
    if (story.author_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to delete this story." });
    }

    await pool.query("DELETE FROM stories WHERE id = $1", [storyId]);
    await invalidateCache("writings*");
    res.json({ message: "Story deleted successfully" });
  } catch (error) {
    console.error("Delete writing error:", error);
    res.status(500).json({ message: "Server error deleting story" });
  }
});

// --- COMMENTS ENDPOINTS ---

// GET comments for a story
app.get("/api/writings/:id/comments", authenticateToken, async (req, res) => {
  const storyId = req.params.id;
  try {
    const cacheKey = `comments:${storyId}`;
    const cachedComments = await getFromCache(cacheKey);
    if (cachedComments) {
      console.log(`⚡ [Redis Cache HIT] Returning cached comments for story ${storyId}`);
      return res.json(cachedComments);
    }
    const result = await pool.query(
      "SELECT * FROM comments WHERE story_id = $1 ORDER BY created_at ASC",
      [storyId]
    );
    await saveToCache(cacheKey, result.rows, 3600);
    res.json(result.rows);
  } catch (error) {
    console.error("Fetch comments error:", error);
    res.status(500).json({ message: "Server error fetching comments" });
  }
});
// POST comment on a story
app.post("/api/writings/:id/comments", authenticateToken, async (req, res) => {
  const storyId = req.params.id;
  const { text } = req.body;
  if (!text || text.trim() === "") {
    return res.status(400).json({ message: "Comment text cannot be empty" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO comments (story_id, user_id, user_name, text) VALUES ($1, $2, $3, $4) RETURNING *",
      [storyId, req.user.id, req.user.user_name, text.trim()]
    );
    await invalidateCache(`comments:${storyId}`);
    await invalidateCache("writings*");
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Post comment error:", error);
    res.status(500).json({ message: "Server error posting comment" });
  }
});
// --- LIKES ENDPOINTS ---
// GET like status for current user on a story
app.get("/api/writings/:id/like-status", authenticateToken, async (req, res) => {
  const storyId = req.params.id;
  try {
    const check = await pool.query(
      "SELECT id FROM likes WHERE story_id = $1 AND user_id = $2",
      [storyId, req.user.id]
    );
    const countRes = await pool.query(
      "SELECT COUNT(*)::int AS total FROM likes WHERE story_id = $1",
      [storyId]
    );
    res.json({
      liked: check.rows.length > 0,
      count: countRes.rows[0].total,
    });
  } catch (error) {
    console.error("Like status error:", error);
    res.status(500).json({ message: "Server error checking like status" });
  }
});
// POST toggle like on a story
app.post("/api/writings/:id/like", authenticateToken, async (req, res) => {
  const storyId = req.params.id;
  try {
    const check = await pool.query(
      "SELECT id FROM likes WHERE story_id = $1 AND user_id = $2",
      [storyId, req.user.id]
    );
    let liked;
    if (check.rows.length > 0) {
      await pool.query("DELETE FROM likes WHERE id = $1", [check.rows[0].id]);
      liked = false;
    } else {
      await pool.query(
        "INSERT INTO likes (story_id, user_id) VALUES ($1, $2)",
        [storyId, req.user.id]
      );
      liked = true;
    }
    const countRes = await pool.query(
      "SELECT COUNT(*)::int AS total FROM likes WHERE story_id = $1",
      [storyId]
    );
    await invalidateCache("writings*");
    res.json({
      liked: liked,
      count: countRes.rows[0].total,
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: "Server error toggling like" });
  }
});
// Dummy protected route
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    message: "This is top secret data!",
    user: req.user,
    data: [1, 2, 3, 4, 5],
  });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
