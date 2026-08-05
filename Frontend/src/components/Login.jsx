import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e, customUsername, customPassword) => {
    if (e) e.preventDefault();
    const userToSubmit = customUsername || username;
    const passToSubmit = customPassword || password;

    if (!userToSubmit || !passToSubmit) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const endpoint = isSignup ? "http://localhost:5000/api/signup" : "http://localhost:5000/login";
      const payload = isSignup
        ? { user_name: userToSubmit, password: passToSubmit, role: selectedRole }
        : { user_name: userToSubmit, password: passToSubmit };

      const response = await axios.post(endpoint, payload);

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("user_id", response.data.user_id);

      navigate("/home");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please check your credentials or try a different username."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (user, pass) => {
    setIsSignup(false);
    setUsername(user);
    setPassword(pass);
    handleAuth(null, user, pass);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      {/* Warm Ambient Background Accents */}
      <div
        style={{
          position: "absolute",
          width: "380px",
          height: "380px",
          background: "radial-gradient(circle, rgba(200,109,81,0.12) 0%, rgba(0,0,0,0) 70%)",
          top: "12%",
          left: "22%",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "420px",
          height: "420px",
          background: "radial-gradient(circle, rgba(78,111,94,0.10) 0%, rgba(0,0,0,0) 70%)",
          bottom: "10%",
          right: "20%",
          filter: "blur(50px)",
          pointerEvents: "none",
        }}
      />

      <div
        className="cozy-card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "40px",
          position: "relative",
          zIndex: 10,
          background: "var(--bg-ivory)",
          borderTop: "4px solid var(--accent-terracotta)",
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "14px",
              background: "var(--accent-terracotta-light)",
              border: "1px solid rgba(200, 109, 81, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.9rem",
              margin: "0 auto 16px",
            }}
          >
            ☕
          </div>
          <h1
            className="serif"
            style={{ fontSize: "2.2rem", color: "var(--text-ink)", marginBottom: "6px" }}
          >
            Ink & Quill
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            {isSignup
              ? "Create a new literary account & join the studio"
              : "Enter your cozy reading room & story sanctuary"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.35)",
              color: "#c2410c",
              padding: "12px 16px",
              borderRadius: "var(--radius-sm)",
              marginBottom: "20px",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Login / Signup Form */}
        <form onSubmit={(e) => handleAuth(e)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--text-secondary)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. author1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "13px 16px",
                background: "#ffffff",
                border: "1px solid var(--border-cozy)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-ink)",
                fontSize: "1rem",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "var(--text-secondary)",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "13px 16px",
                background: "#ffffff",
                border: "1px solid var(--border-cozy)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-ink)",
                fontSize: "1rem",
                outline: "none",
              }}
            />
          </div>

          {/* Role Picker for New Account Signup */}
          {isSignup && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Studio Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  background: "#ffffff",
                  border: "1px solid var(--border-cozy)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text-ink)",
                  fontSize: "1rem",
                  outline: "none",
                }}
              >
                <option value="user">👤 Reader (Browse & Comment)</option>
                <option value="author">✒️ Author (Publish & Manage Stories)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "8px",
              padding: "14px",
              fontSize: "1rem",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Opening sanctuary..." : isSignup ? "Create Account & Enter →" : "Enter Sanctuary →"}
          </button>
        </form>

        {/* Switch Between Login and Signup */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            style={{
              fontSize: "0.88rem",
              color: "var(--accent-terracotta)",
              fontWeight: "600",
              cursor: "pointer",
              background: "none",
              border: "none",
              fontFamily: "var(--font-sans)",
            }}
          >
            {isSignup ? "Already have an account? Sign in" : "New to Ink & Quill? Create an account"}
          </button>
        </div>

        {/* Quick Demo Accounts Helper */}
        <div style={{ marginTop: "28px", borderTop: "1px solid var(--border-cozy)", paddingTop: "20px" }}>
          <p
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              textAlign: "center",
              marginBottom: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: "600",
            }}
          >
            Quick Test Demo Accounts
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            <button
              type="button"
              onClick={() => handleQuickLogin("user1", "pass")}
              className="btn-outline"
              style={{ padding: "8px 6px", fontSize: "0.78rem" }}
            >
              👤 Reader
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("author1", "pass")}
              className="btn-outline"
              style={{
                padding: "8px 6px",
                fontSize: "0.78rem",
                borderColor: "rgba(200, 109, 81, 0.4)",
                color: "var(--accent-terracotta)",
              }}
            >
              ✒️ Author 1
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin("admin1", "pass")}
              className="btn-outline"
              style={{
                padding: "8px 6px",
                fontSize: "0.78rem",
                borderColor: "rgba(78, 111, 94, 0.4)",
                color: "var(--accent-sage)",
              }}
            >
              🌿 Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;