import { useState, useEffect } from "react";
import axios from "axios";

function DailyBookRecommendation() {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    const fetchDailyBook = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;
        try {
          // 1. First try fetching from our backend endpoint which uses Redis Cache
          response = await axios.get("http://localhost:5000/api/recommendations/daily");
          if (response.data && response.data.cached) {
            setIsCached(true);
          }
        } catch (backendErr) {
          // 2. Fallback to direct Google Books API if local backend is unreachable
          console.warn("Backend Redis cache endpoint unreachable, falling back to direct Google Books API:", backendErr.message);
          response = await axios.get(
            "https://www.googleapis.com/books/v1/volumes?q=subject:fiction+classic+bestsellers&maxResults=40"
          );
        }

        const items = response.data.items || [];
        if (items.length === 0) {
          setError("No recommendations found at the moment.");
          return;
        }

        // Deterministic Daily Seed: Use today's day of year so every user sees the same book today
        const today = new Date();
        const start = new Date(today.getFullYear(), 0, 0);
        const diff = today - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);

        const dailyIndex = dayOfYear % items.length;
        setBook(items[dailyIndex]);
      } catch (err) {
        console.error("Error fetching book recommendations:", err);
        setError("Unable to load today's book recommendation.");
      } finally {
        setLoading(false);
      }
    };

    fetchDailyBook();
  }, []);

  if (loading) {
    return (
      <div className="cozy-card" style={{ padding: "32px", textAlign: "center" }}>
        <div
          style={{
            height: "180px",
            background: "rgba(200, 109, 81, 0.08)",
            borderRadius: "12px",
            marginBottom: "16px",
          }}
        />
        <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>
          ☕ Preparing today's literary pick...
        </p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div
        className="cozy-card"
        style={{
          padding: "24px",
          textAlign: "center",
          background: "var(--bg-ivory)",
          border: "1px solid var(--border-cozy)",
        }}
      >
        <p style={{ color: "var(--text-secondary)" }}>
          {error || "No recommendation available today."}
        </p>
      </div>
    );
  }

  const volumeInfo = book.volumeInfo || {};
  const title = volumeInfo.title || "Untitled Masterpiece";
  const authors = volumeInfo.authors ? volumeInfo.authors.join(", ") : "Unknown Author";
  const publishedYear = volumeInfo.publishedDate ? volumeInfo.publishedDate.substring(0, 4) : "";
  const categories = volumeInfo.categories ? volumeInfo.categories[0] : "Literary Fiction";
  const description = volumeInfo.description
    ? volumeInfo.description.replace(/<[^>]*>?/gm, "")
    : "A captivating literary work worth exploring in your daily reading routine.";

  const thumbnail =
    volumeInfo.imageLinks?.thumbnail ||
    volumeInfo.imageLinks?.smallThumbnail ||
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80";

  return (
    <div
      className="cozy-card animate-fade-in"
      style={{
        padding: "32px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "28px",
        flexWrap: "wrap",
        background: "var(--bg-ivory)",
      }}
    >
      {/* Book Cover Thumbnail */}
      <div style={{ flex: "0 0 160px", textAlign: "center" }}>
        <img
          src={thumbnail}
          alt={title}
          style={{
            width: "150px",
            height: "220px",
            objectFit: "cover",
            borderRadius: "10px",
            boxShadow: "0 8px 24px rgba(43, 46, 44, 0.15)",
            border: "2px solid var(--bg-parchment)",
          }}
        />
      </div>

      {/* Book Details */}
      <div style={{ flex: "1 1 320px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
          <span className="badge badge-gold">✨ Cozy Daily Recommendation</span>
          <span className="badge badge-indigo">{categories}</span>
          {isCached && (
            <span
              className="badge"
              style={{
                background: "rgba(43, 138, 98, 0.12)",
                color: "#2b8a62",
                border: "1px solid rgba(43, 138, 98, 0.3)",
              }}
            >
              ⚡ Cached in Redis • 1 API Request Saved
            </span>
          )}
        </div>

        <h3 className="serif" style={{ fontSize: "1.9rem", color: "var(--text-ink)", marginBottom: "4px" }}>
          {title}
        </h3>

        <p
          style={{
            fontSize: "1.02rem",
            color: "var(--accent-terracotta)",
            fontWeight: "600",
            marginBottom: "14px",
          }}
        >
          by {authors} {publishedYear && `(${publishedYear})`}
        </p>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.96rem",
            lineHeight: "1.7",
            marginBottom: "20px",
            display: "-webkit-box",
            WebkitLineClamp: "4",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </p>

        <a
          href={volumeInfo.previewLink || volumeInfo.infoLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
          style={{ padding: "9px 18px", fontSize: "0.88rem" }}
        >
          📖 Preview on Google Books →
        </a>
      </div>
    </div>
  );
}

export default DailyBookRecommendation;
