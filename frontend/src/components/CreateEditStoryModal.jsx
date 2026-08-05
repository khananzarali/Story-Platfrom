import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function CreateEditStoryModal({ storyToEdit, onClose, onSuccess }) {
  const [title, setTitle] = useState(storyToEdit ? storyToEdit.title : "");
  const [content, setContent] = useState(storyToEdit ? storyToEdit.content : "");
  const [category, setCategory] = useState(storyToEdit?.category || "Literary Fiction");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = ["Literary Fiction", "Sci-Fi", "Mystery", "Poetry", "Fantasy"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Please provide both a title and story content.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You must be logged in as an Author or Admin to perform this action.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = {
        title: title.trim(),
        content: content.trim(),
        category: category,
      };

      if (storyToEdit) {
        // UPDATE existing story
        await axios.put(`${API_URL}/api/writings/${storyToEdit.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // CREATE new story
        await axios.post(`${API_URL}/api/writings`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save story. Make sure you have Author or Admin permission."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(43, 46, 44, 0.55)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        className="cozy-card animate-fade-in"
        style={{
          width: "100%",
          maxWidth: "680px",
          padding: "40px",
          position: "relative",
          background: "var(--bg-ivory)",
          borderTop: "4px solid var(--accent-terracotta)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "24px",
            right: "24px",
            background: "var(--bg-parchment)",
            border: "1px solid var(--border-cozy)",
            borderRadius: "9999px",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "1.1rem",
            color: "var(--text-ink)",
          }}
        >
          ✕
        </button>

        <span className="badge badge-gold" style={{ marginBottom: "12px" }}>
          {storyToEdit ? "✏️ Edit Writing" : "✨ Publish New Story"}
        </span>

        <h2 className="serif" style={{ fontSize: "2.2rem", color: "var(--text-ink)", marginBottom: "20px" }}>
          {storyToEdit ? "Refine Your Writing" : "Create a New Literary Work"}
        </h2>

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
            }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
              Story Title
            </label>
            <input
              type="text"
              placeholder="e.g. A Year in Tokyo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
                fontFamily: "var(--font-serif)",
                fontWeight: "600",
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
              Genre Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "13px 16px",
                background: "#ffffff",
                border: "1px solid var(--border-cozy)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-ink)",
                fontSize: "0.95rem",
                outline: "none",
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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
              Story Content
            </label>
            <textarea
              rows="8"
              placeholder="Write your narrative here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 16px",
                background: "#ffffff",
                border: "1px solid var(--border-cozy)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-ink)",
                fontSize: "1rem",
                lineHeight: "1.7",
                outline: "none",
                fontFamily: "var(--font-sans)",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              style={{ padding: "12px 24px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ padding: "12px 28px", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Saving..." : storyToEdit ? "Save Changes" : "Publish Story →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEditStoryModal;
