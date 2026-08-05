const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: "./config/.env" });

const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DATABASE_PORT,
});

async function setupDatabase() {
  try {
    const defaultHash = bcrypt.hashSync("pass", 10);

    await pool.query(`
      DROP TABLE IF EXISTS likes CASCADE;
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS stories CASCADE;
      DROP TABLE IF EXISTS users CASCADE;

      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL
      );

      CREATE TABLE stories (
        id SERIAL PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'Literary Fiction',
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user_name VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE likes (
        id SERIAL PRIMARY KEY,
        story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(story_id, user_id)
      );
    `);

    // Insert demo users with hashed passwords
    await pool.query(
      `
      INSERT INTO users (id, user_name, password, role) VALUES
      (1, 'user1', $1, 'user'),
      (2, 'author1', $1, 'author'),
      (3, 'admin1', $1, 'admin'),
      (5, 'author2', $1, 'author')
      `,
      [defaultHash]
    );

    // Reset sequence for users
    await pool.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`);

    // Insert demo stories
    await pool.query(`
      INSERT INTO stories (id, title, content, category, author_id) VALUES
      (1, 'The Silent Library of Barcelona', 'In the damp basement of the old Gothic quarter, thousands of forgotten volumes waited for a reader who would never return. Every night, the sound of turning pages echoed through the empty corridors.', 'Literary Fiction', 2),
      (2, 'Chronicles of the Clockwork Sea', 'The brass sails caught the solar winds above Europa. Captain Thorne adjusted his chronometer and looked out across the shimmering methane swells, searching for the lost outpost of New Alexandria.', 'Sci-Fi', 2),
      (3, 'Murder at the Midnight Masquerade', 'When the clock struck twelve at the Venetian palace, Lady Beatrice was found on the marble terrace, her domino mask still in place and a single crimson rose beside her glove.', 'Mystery', 5);
    `);

    // Reset sequence for stories
    await pool.query(`SELECT setval('stories_id_seq', (SELECT MAX(id) FROM stories))`);

    // Insert demo comments
    await pool.query(`
      INSERT INTO comments (story_id, user_id, user_name, text) VALUES
      (1, 1, 'user1', 'The atmospheric description of the Barcelona Gothic quarter is absolutely breathtaking!'),
      (1, 3, 'admin1', 'A classic literary piece. Very well paced.'),
      (2, 1, 'user1', 'I love world-building with solar sails and methane oceans. Can not wait for chapter two!'),
      (3, 2, 'author1', 'Brilliant twist at the end with Lady Beatrice.');
    `);

    // Insert demo likes
    await pool.query(`
      INSERT INTO likes (story_id, user_id) VALUES
      (1, 1),
      (1, 2),
      (1, 3),
      (2, 1),
      (2, 5),
      (3, 2),
      (3, 3);
    `);

    console.log("Database initialized successfully with hashed passwords, stories, comments, and likes!");
  } catch (error) {
    console.error("Database setup failed:", error);
  } finally {
    pool.end();
  }
}

setupDatabase();
