import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

function Layout() {
  const role = localStorage.getItem("role") || "user";
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  const getNavLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      padding: "8px 16px",
      borderRadius: "9999px",
      fontWeight: isActive ? "600" : "500",
      color: isActive ? "var(--accent-terracotta)" : "var(--text-secondary)",
      background: isActive ? "var(--accent-terracotta-light)" : "transparent",
      border: isActive ? "1px solid rgba(200, 109, 81, 0.35)" : "1px solid transparent",
      textDecoration: "none",
      transition: "all 0.25s ease",
      fontFamily: "var(--font-sans)",
      fontSize: "0.95rem",
    };
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Cozy Parchment Navigation Bar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255, 253, 249, 0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border-cozy)",
          padding: "16px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(43, 46, 44, 0.04)",
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/home"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "var(--accent-terracotta-light)",
              border: "1px solid rgba(200, 109, 81, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.35rem",
            }}
          >
            ☕
          </div>
          <div>
            <span
              className="serif"
              style={{
                fontSize: "1.5rem",
                fontWeight: "700",
                color: "var(--text-ink)",
                display: "block",
                lineHeight: "1.1",
              }}
            >
              Ink & Quill
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--accent-terracotta)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: "600",
              }}
            >
              Literary Studio & Archive
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {role === "user" && (
            <>
              <Link to="/home" style={getNavLinkStyle("/home")}>
                Home
              </Link>
              <Link to="/writings" style={getNavLinkStyle("/writings")}>
                The Collection
              </Link>
              <Link to="/about" style={getNavLinkStyle("/about")}>
                About the Author
              </Link>
            </>
          )}
          {role === "author" && (
            <>
              <Link to="/home" style={getNavLinkStyle("/home")}>
                Sanctuary
              </Link>
              <Link to="/writings" style={getNavLinkStyle("/writings")}>
                My Writings
              </Link>
              <Link to="/about" style={getNavLinkStyle("/about")}>
                About
              </Link>
            </>
          )}
          {role === "admin" && (
            <>
              <Link to="/home" style={getNavLinkStyle("/home")}>
                Overview
              </Link>
              <Link to="/writings" style={getNavLinkStyle("/writings")}>
                All Writings
              </Link>
              <Link to="/about" style={getNavLinkStyle("/about")}>
                Studio Manifesto
              </Link>
            </>
          )}
        </nav>

        {/* User Role Badge & Sign Out */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <span className="badge badge-gold">
            {role.toUpperCase()}
          </span>

          <button
            onClick={handleLogout}
            className="btn-outline"
            style={{
              padding: "7px 16px",
              fontSize: "0.85rem",
              borderRadius: "9999px",
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Page Content */}
      <main
        style={{
          flex: 1,
          maxWidth: "1160px",
          width: "100%",
          margin: "0 auto",
          padding: "48px 24px",
        }}
      >
        <Outlet />
      </main>

      {/* Cozy Parchment Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border-cozy)",
          padding: "32px 48px",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "0.88rem",
          background: "var(--bg-ivory)",
        }}
      >
        <div style={{ marginBottom: "8px", fontSize: "1.2rem" }}>🌿 ☕ 📖</div>
        <p style={{ fontWeight: "500" }}>
          © {new Date().getFullYear()} Ink & Quill Literary Studio • Inspired by Christy Anne Jones
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
          A cozy sanctuary for stories, illustrations, and daily literary discovery.
        </p>
      </footer>
    </div>
  );
}

export default Layout;
