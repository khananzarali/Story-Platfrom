import { useState, useEffect } from "react";
import axios from "axios";

function Writings(){
    const [stories, setStories] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWritings = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const response = await axios.get("http://localhost:5000/api/writings", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setStories(response.data);
            } catch (error) {
                console.error("Failed to fetch writings:", error);
                setError("Failed to load writings.");
            }
        };

        fetchWritings();
    }, []);

    return (
        <div>
            <h1>Writings</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {stories.length === 0 && !error ? (
                <p>No writings found.</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {stories.map(story => (
                        <li key={story.id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
                            <h2>{story.title}</h2>
                            <p>{story.content}</p>
                            <small>Author ID: {story.author_id}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
export default Writings;