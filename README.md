# ✒️ Ink & Quill — Literary Studio & Publishing Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

**Ink & Quill** is a production-ready, full-stack literary publishing platform built with **React (Vite)**, **Node.js (Express)**, and **PostgreSQL**. It features role-based access control (RBAC), cryptographic JWT authentication, `bcryptjs` password hashing, real-time community discussions, and daily literary discovery powered by the **Google Books API**.

---

## 🌟 Key Engineering & Architectural Features

### 1. 🛡️ Cryptographic Security & RBAC
- **Password Hashing**: User passwords are never stored in plain text. All credentials are salted and hashed using `bcryptjs` (cost factor 10).
- **Stateless Authentication**: Signed JSON Web Tokens (`HMAC SHA-256`) authenticate requests without server-side session lookup.
- **Three-Tier Role-Based Access Control (RBAC)**: Enforced at both the database query layer and React router guard layer.

| Feature / Action | 👤 Reader (`user`) | ✒️ Author (`author`) | 🛡️ Admin (`admin`) |
| :--- | :---: | :---: | :---: |
| Browse & Search Community Stories | ✅ | ✅ (Own stories) | ✅ (All stories) |
| Read Daily Curated Book Recommendation | ✅ | ✅ | ✅ |
| Like / Upvote Stories & Leave Comments | ✅ | ✅ | ✅ |
| Publish New Stories (`POST /api/writings`) | ❌ | ✅ | ✅ |
| Edit Existing Stories (`PUT /api/writings/:id`) | ❌ | ✅ (Own only) | ✅ (Any story) |
| Delete Stories (`DELETE /api/writings/:id`) | ❌ | ✅ (Own only) | ✅ (Any story) |

---

### 2. 📖 Relational Data & Interactive Community
- **Full CRUD for Writings**: Authors and Admins can publish, edit, and delete stories via sleek glassmorphic modals.
- **Relational SQL Schema**: Includes PostgreSQL foreign keys with `ON DELETE CASCADE` across `users`, `stories`, `comments`, and `likes` tables.
- **Interactive Story Reader & Comments**: Readers can click **"📖 Read & Discuss"** on any story card to open a distraction-free modal reader with live like counters and real-time comment threads.

---

### 3. 🔍 Server-Side Filtering & Live Search
- Supports debounced real-time title/content searches and genre category filtering (`Literary Fiction`, `Sci-Fi`, `Mystery`, `Poetry`, `Fantasy`).
- Optimized SQL query execution featuring correlated subqueries for aggregated like and comment counts.

---

### 4. 📚 Google Books API "Book of the Day"
- Integrated with Google Books' public REST API (`/volumes`).
- Uses a **deterministic daily seed algorithm** (`dayOfYear % totalItems`), ensuring that every user visiting on a given calendar day sees the exact same featured literary masterpiece.

---

## 🏗️ Architecture Diagram

```
       [ Client / Browser ]
        React 18 • Vite • CSS Glassmorphism
                 │
                 │  HTTP REST / JSON
                 │  Authorization: Bearer <JWT>
                 ▼
       [ Express.js API Gateway ]
        JWT Middleware • Bcrypt Auth • RBAC Guards
                 │
                 │  node-postgres (pg pool)
                 ▼
       [ PostgreSQL Database ]
        Tables: users | stories | comments | likes
```

---

## 🚀 Quick Start & Local Development

### Option A: Using Docker Compose (Recommended)
Launch the entire stack (PostgreSQL, Node Backend, and React Frontend) in 10 seconds:
```bash
docker compose up --build
```
Access the studio at **`http://localhost:5173`**.

---

### Option B: Manual Local Setup
1. **Initialize Database Schema & Demo Seed**:
   ```bash
   cd backend
   npm install
   node setup_db.js
   ```
2. **Start Node.js Backend Server** (`port 5000`):
   ```bash
   node config/database.js
   ```
3. **Start React Frontend Server** (`port 5173`):
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 🔑 Quick Test Demo Accounts

You can test any role instantly using the **1-Click Quick Demo Accounts** on the login page, or manually sign in with:

| Account Type | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Reader** | `user1` | `pass` | Browse stories, add comments, toggle likes |
| **Author** | `author1` | `pass` | Create stories, edit/delete own writings |
| **Admin** | `admin1` | `pass` | Full oversight, edit/delete any story |

*You can also create a new account using the **"Create an Account"** button on `/login`!*

---

## 🧪 CI/CD & Testing
This project includes automated continuous integration workflows in `.github/workflows/test.yml` to validate dependency resolution and production bundle builds on every commit.
