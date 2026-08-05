import { useState, useEffect } from "react";
import axios from "axios";

function StoryReaderModal({ story, onClose, onStoryUpdated }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(story?.likes_count || 0);
  const [loadingComments, setLoadingComments] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!story) return;

    // Fetch comments for this story
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/writings/${story.id}/comments`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setComments(res.data || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoadingComments(false);
      }
    };

    // Check if current user liked this story
    const checkLiked = async () => {
      if (!token || !userId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/writings/${story.id}/likes/check`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data && res.data.liked) {
          setLiked(true);
        }
      } catch (err) {
        // Silently ignore if check fails
      }
    };

    fetchComments();
    checkLiked();
  }, [story, token, userId]);

  const handleToggleLike = async () => {
    if (!token) {
      alert("Please log in to like this story.");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/writings/${story.id}/likes`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(res.data.liked);
      setLikesCount(res.data.likes_count);
      if (onStoryUpdated) onStoryUpdated();
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!token) {
      alert("Please log in to leave a comment.");
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await axios.post(
        `http://localhost:5000/api/writings/${story.id}/comments`,
        { content: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([...comments, res.data]);
      setNewComment("");
      if (onStoryUpdated) onStoryUpdated();
    } catch (err) {
      console.error("Comment post error:", err);
      alert("Could not post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!story) return null;

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
          maxWidth: "760px",
          maxHeight: "88vh",
          overflowY: "auto",
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

        {/* Story Metadata */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
          <span className="badge badge-gold">Author #{story.author_id}</span>
          {story.category && <span className="badge badge-indigo">{story.category}</span>}
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
            Story #{story.id}
          </span>
        </div>

        {/* Title */}
        <h1 className="serif" style={{ fontSize: "2.6rem", color: "var(--text-ink)", marginBottom: "20px" }}>
          {story.title}
        </h1>

        {/* Story Content */}
        <div
          style={{
            fontSize: "1.08rem",
            lineHeight: "1.85",
            color: "var(--text-ink)",
            marginBottom: "36px",
            whiteSpace: "pre-line",
            borderBottom: "1px solid var(--border-cozy)",
            paddingBottom: "32px",
          }}
        >
          {story.content}
        </div>

        {/* Like Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "36px" }}>
          <button
            onClick={handleToggleLike}
            className={liked ? "btn-primary" : "btn-outline"}
            style={{ padding: "10px 22px" }}
          >
            {liked ? "❤️ Liked Story" : "🤍 Like Story"} ({likesCount})
          </button>
          <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
            Show your appreciation for the author's work
          </span>
        </div>

        {/* Discussion & Comments Section */}
        <div>
          <h3 className="serif" style={{ fontSize: "1.6rem", color: "var(--text-ink)", marginBottom: "20px" }}>
            ☕ Reader Reflections ({comments.length})
          </h3>

          {/* Comment Form */}
          <form onSubmit={handlePostComment} style={{ marginBottom: "28px" }}>
            <textarea
              rows="3"
              placeholder="Write your reflection or note to the author..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "var(--radius-sm)",
                background: "#ffffff",
                border: "1px solid var(--border-cozy)",
                color: "var(--text-ink)",
                fontSize: "0.95rem",
                outline: "none",
                marginBottom: "10px",
                fontFamily: "var(--font-sans)",
              }}
            />
            <button type="submit" className="btn-primary" disabled={submittingComment}>
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </form>

          {/* Comments List */}
          {loadingComments ? (
            <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
              Loading discussion...
            </p>
          ) : comments.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {comments.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: "var(--bg-parchment)",
                    padding: "16px 20px",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-cozy)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "600", color: "var(--accent-terracotta)", fontSize: "0.9rem" }}>
                      {c.user_name || `Reader #${c.user_id}`}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Just now"}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-ink)", fontSize: "0.95rem", lineHeight: "1.6" }}>
                    {c.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoryReaderModal;
