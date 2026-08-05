import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DailyBookRecommendation from "./DailyBookRecommendation";

function Home() {
  const role = localStorage.getItem("role") || "user";
  const [username, setUsername] = useState("Literary Friend");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload && payload.user_name) {
          setUsername(payload.user_name);
        }
      } catch (err) {
        console.error("Token decode error:", err);
      }
    }
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Cozy Sanctuary Hero Banner */}
      <div
        className="cozy-card"
        style={{
          padding: "54px 44px",
          marginBottom: "40px",
          background: "var(--bg-ivory)",
          borderTop: "4px solid var(--accent-terracotta)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "28px",
        }}
      >
        <div style={{ maxWidth: "650px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
            <span className="badge badge-gold">
              🌿 Cozy Literary Sanctuary • {role.toUpperCase()}
            </span>
          </div>

          <h1
            className="serif"
            style={{
              fontSize: "3.2rem",
              lineHeight: "1.12",
              color: "var(--text-ink)",
              marginBottom: "14px",
            }}
          >
            Finding Magic in <span className="glow-text">Ordinary Words</span>
          </h1>

          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "1.12rem",
              lineHeight: "1.7",
              marginBottom: "6px",
            }}
          >
            Welcome to your reading room, <strong>{username}</strong>. Explore daily curated stories, sip a warm tea, and discover timeless fiction crafted with care.
          </p>
        </div>

        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
          <Link to="/writings" className="btn-primary">
            {role === "author" ? "✒️ Manage My Studio" : "📖 Browse Collection"}
          </Link>
          <Link to="/about" className="btn-outline">
            About the Author
          </Link>
        </div>
      </div>

      {/* Featured Cozy Book of the Day */}
      <section style={{ marginBottom: "48px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "8px" }}>
          <h2 className="serif" style={{ fontSize: "2rem", color: "var(--text-ink)" }}>
            ☕ Today's Cozy Literary Pick
          </h2>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Powered by Google Books API • One recommendation daily
          </span>
        </div>
        <DailyBookRecommendation />
      </section>

      {/* Cozy Role Privileges & Sanctuary Philosophy */}
      <section style={{ marginTop: "44px" }}>
        <h2 className="serif" style={{ fontSize: "1.8rem", color: "var(--text-ink)", marginBottom: "24px" }}>
          Your Studio Sanctuary Access
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "24px" }}>
          <div className="cozy-card" style={{ padding: "32px" }}>
            <div style={{ fontSize: "2rem", marginBottom: "14px" }}>☕</div>
            <h3 className="serif" style={{ fontSize: "1.45rem", color: "var(--text-ink)", marginBottom: "10px" }}>
              Reader's Sanctuary
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", lineHeight: "1.7" }}>
              Browse the community fiction collection, leave thoughtful reader reflections, and enjoy daily book recommendations curated for slow reading.
            </p>
          </div>

          <div
            className="cozy-card"
            style={{
              padding: "32px",
              borderColor: role === "author" || role === "admin" ? "var(--accent-terracotta)" : "var(--border-cozy)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "14px" }}>✒️</div>
            <h3 className="serif" style={{ fontSize: "1.45rem", color: "var(--text-ink)", marginBottom: "10px" }}>
              Author's Writing Desk
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", lineHeight: "1.7" }}>
              Your private writing desk to publish, edit, and curate your personal fiction stories while maintaining strict author ownership and copyright.
            </p>
          </div>

          <div
            className="cozy-card"
            style={{
              padding: "32px",
              borderColor: role === "admin" ? "var(--accent-sage)" : "var(--border-cozy)",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "14px" }}>🌿</div>
            <h3 className="serif" style={{ fontSize: "1.45rem", color: "var(--text-ink)", marginBottom: "10px" }}>
              Curator's Archive
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", lineHeight: "1.7" }}>
              Full administrative visibility across the entire literary archive for curation, community moderation, and preserving timeless quality.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;