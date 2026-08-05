function About() {
  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto 48px" }}>
        <span className="badge badge-gold" style={{ marginBottom: "16px" }}>
          ☕ The Studio Manifesto
        </span>
        <h1
          className="serif"
          style={{
            fontSize: "3.2rem",
            lineHeight: "1.15",
            color: "var(--text-ink)",
            marginBottom: "16px",
          }}
        >
          Finding Magic in Ordinary Things
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.15rem", lineHeight: "1.75" }}>
          Inspired by the cozy storytelling of Christy Anne Jones, this literary sanctuary celebrates slow reading, intimate fiction, and a thoughtful community of writers and readers.
        </p>
      </div>

      {/* Featured Quote Card */}
      <div
        className="cozy-card"
        style={{
          padding: "44px",
          margin: "0 auto 48px",
          maxWidth: "840px",
          textAlign: "center",
          borderTop: "4px solid var(--accent-terracotta)",
          background: "var(--bg-ivory)",
        }}
      >
        <p
          className="serif"
          style={{
            fontSize: "1.75rem",
            fontStyle: "italic",
            color: "var(--text-ink)",
            lineHeight: "1.5",
            marginBottom: "16px",
          }}
        >
          “A book is a dream that you hold in your hand. In every story we share, we preserve a quiet fragment of human imagination.”
        </p>
        <span
          style={{
            fontSize: "0.85rem",
            color: "var(--accent-terracotta)",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          — A Cozy Literary Reflection
        </span>
      </div>

      {/* Three Pillars Section */}
      <div style={{ marginBottom: "44px" }}>
        <h2
          className="serif"
          style={{
            fontSize: "2.2rem",
            color: "var(--text-ink)",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          How Our Literary Studio Works
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div className="cozy-card" style={{ padding: "32px", background: "var(--bg-ivory)" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "var(--accent-terracotta-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "20px",
              }}
            >
              ☕
            </div>
            <h3 className="serif" style={{ fontSize: "1.45rem", color: "var(--text-ink)", marginBottom: "12px" }}>
              Daily Literary Discovery
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", lineHeight: "1.7" }}>
              Our platform connects directly with the Google Books API to feature one curated, deterministic best-selling or classic fiction recommendation every single day.
            </p>
          </div>

          <div className="cozy-card" style={{ padding: "32px", background: "var(--bg-ivory)" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "var(--accent-sage-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "20px",
              }}
            >
              ✒️
            </div>
            <h3 className="serif" style={{ fontSize: "1.45rem", color: "var(--text-ink)", marginBottom: "12px" }}>
              Role-Based Creative Attribution
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", lineHeight: "1.7" }}>
              Every author in our database retains strict ownership of their stories. Authors can publish, edit, and curate their own work in their private writing desk.
            </p>
          </div>

          <div className="cozy-card" style={{ padding: "32px", background: "var(--bg-ivory)" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "var(--accent-honey-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                marginBottom: "20px",
              }}
            >
              🌿
            </div>
            <h3 className="serif" style={{ fontSize: "1.45rem", color: "var(--text-ink)", marginBottom: "12px" }}>
              Stateless Security
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.98rem", lineHeight: "1.7" }}>
              Powered by JSON Web Tokens (JWT) and pure-JS bcryptjs password hashing, our backend verifies signatures and permissions on every request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
