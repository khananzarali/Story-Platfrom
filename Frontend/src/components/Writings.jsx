import { useState, useEffect } from "react";
import axios from "axios";
import StoryReaderModal from "./StoryReaderModal";
import CreateEditStoryModal from "./CreateEditStoryModal";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Writings() {
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modals state
  const [activeStoryModal, setActiveStoryModal] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [storyToEdit, setStoryToEdit] = useState(null);

  const role = localStorage.getItem("role") || "user";
  const userId = localStorage.getItem("user_id");

  const categories = ["All", "Literary Fiction", "Sci-Fi", "Mystery", "Poetry", "Fantasy"];

  const fetchWritings = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery.trim() !== "") params.append("search", searchQuery.trim());
      if (selectedCategory !== "All") params.append("category", selectedCategory);

      const response = await axios.get(
        `${API_URL}/api/writings?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStories(response.data || []);
    } catch (err) {
      console.error("Failed to fetch writings:", err);
      setError("Failed to load writings from the server. Please check your token or ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWritings();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" from the collection?`)) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.delete(`${API_URL}/api/writings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStories(stories.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete story. You may not be authorized.");
    }
  };

  const canEditOrDelete = (story) => {
    if (role === "admin") return true;
    if (role === "author" && Number(story.author_id) === Number(userId)) return true;
    return false;
  };

  return (
    <div className="animate-fade-in">
      {/* Cozy Collection Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "28px",
          borderBottom: "1px solid var(--border-cozy)",
          paddingBottom: "24px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span className="badge badge-gold">
              {role === "author" ? `Author Sanctuary • ID #${userId}` : `${role.toUpperCase()} ACCESS`}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              • {stories.length} {stories.length === 1 ? "Story" : "Stories"}
            </span>
          </div>

          <h1 className="serif" style={{ fontSize: "2.6rem", color: "var(--text-ink)" }}>
            {role === "author" ? "My Literary Portfolio" : "The Fiction Archive"}
          </h1>
        </div>

        {(role === "author" || role === "admin") && (
          <button
            onClick={() => {
              setStoryToEdit(null);
              setShowCreateModal(true);
            }}
            className="btn-primary"
            style={{ padding: "12px 24px" }}
          >
            ✨ + Write New Story
          </button>
        )}
      </div>

      {/* Search Bar and Category Filter Pills */}
      <div
        className="cozy-card"
        style={{
          padding: "20px 24px",
          marginBottom: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          background: "var(--bg-ivory)",
        }}
      >
        {/* Search Input */}
        <div style={{ flex: "1 1 280px" }}>
          <input
            type="text"
            placeholder="🔍 Search stories by title, author, or theme..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 16px",
              background: "#ffffff",
              border: "1px solid var(--border-cozy)",
              borderRadius: "var(--radius-sm)",
              color: "var(--text-ink)",
              fontSize: "0.95rem",
              outline: "none",
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "7px 14px",
                borderRadius: "9999px",
                fontSize: "0.82rem",
                fontWeight: "600",
                background:
                  selectedCategory === cat
                    ? "var(--accent-terracotta)"
                    : "var(--bg-parchment)",
                color: selectedCategory === cat ? "#ffffff" : "var(--text-secondary)",
                border:
                  selectedCategory === cat
                    ? "1px solid var(--accent-terracotta)"
                    : "1px solid var(--border-cozy)",
                cursor: "pointer",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="cozy-card"
          style={{
            padding: "24px",
            background: "rgba(239, 68, 68, 0.08)",
            borderColor: "rgba(239, 68, 68, 0.35)",
            color: "#c2410c",
            marginBottom: "24px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && stories.length === 0 && !error && (
        <div className="cozy-card" style={{ padding: "56px 32px", textAlign: "center", background: "var(--bg-ivory)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>☕</div>
          <h2 className="serif" style={{ fontSize: "1.8rem", color: "var(--text-ink)", marginBottom: "8px" }}>
            No Stories Found on the Bookshelf
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "440px", margin: "0 auto" }}>
            Try adjusting your search terms or selecting a different genre filter.
          </p>
        </div>
      )}

      {/* Stories Multi-Column Bookshelf Grid */}
      {!loading && stories.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: "24px" }}>
          {stories.map((story) => (
            <div
              key={story.id}
              className="cozy-card animate-fade-in"
              style={{
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                background: "var(--bg-ivory)",
              }}
            >
              <div>
                {/* Story Top Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span className="badge badge-gold">Author #{story.author_id}</span>
                    {story.category && (
                      <span className="badge badge-indigo">{story.category}</span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    #{story.id}
                  </span>
                </div>

                {/* Story Title */}
                <h2
                  className="serif"
                  style={{
                    fontSize: "1.75rem",
                    color: "var(--text-ink)",
                    lineHeight: "1.25",
                    marginBottom: "14px",
                  }}
                >
                  {story.title}
                </h2>

                {/* Story Content Snippet */}
                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.98rem",
                    lineHeight: "1.75",
                    marginBottom: "24px",
                    display: "-webkit-box",
                    WebkitLineClamp: "5",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {story.content}
                </p>
              </div>

              {/* Story Card Footer */}
              <div>
                <div
                  style={{
                    borderTop: "1px solid var(--border-cozy)",
                    paddingTop: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: canEditOrDelete(story) ? "14px" : "0",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    ❤️ {story.likes_count || 0} • 💬 {story.comments_count || 0}
                  </span>

                  <button
                    onClick={() => setActiveStoryModal(story)}
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--accent-terracotta)",
                      fontWeight: "600",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    📖 Read & Discuss →
                  </button>
                </div>

                {/* Author / Admin Edit & Delete Actions */}
                {canEditOrDelete(story) && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                      borderTop: "1px solid rgba(200, 109, 81, 0.1)",
                      paddingTop: "12px",
                    }}
                  >
                    <button
                      onClick={() => {
                        setStoryToEdit(story);
                        setShowCreateModal(true);
                      }}
                      className="btn-outline"
                      style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(story.id, story.title)}
                      className="btn-outline"
                      style={{
                        padding: "6px 14px",
                        fontSize: "0.78rem",
                        borderColor: "rgba(239, 68, 68, 0.4)",
                        color: "#c2410c",
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story Reader & Discussion Modal */}
      {activeStoryModal && (
        <StoryReaderModal
          story={activeStoryModal}
          onClose={() => setActiveStoryModal(null)}
          onStoryUpdated={fetchWritings}
        />
      )}

      {/* Create / Edit Story Modal */}
      {(showCreateModal || storyToEdit) && (
        <CreateEditStoryModal
          storyToEdit={storyToEdit}
          onClose={() => {
            setShowCreateModal(false);
            setStoryToEdit(null);
          }}
          onSuccess={fetchWritings}
        />
      )}
    </div>
  );
}

export default Writings;