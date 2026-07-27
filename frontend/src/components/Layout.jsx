import { Outlet, Link, useNavigate } from "react-router-dom";

function Layout() {
    const role = localStorage.getItem("role");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        navigate("/login");
    };

    return (
        <div>
            <nav style={{ display: "flex", gap: "15px", padding: "15px", background: "#f8f9fa", alignItems: "center", borderBottom: "1px solid #ddd" }}>
                {role === "user" && (
                    <>
                        <Link to="/home">Home</Link>
                        <Link to="/writings">Writings</Link>
                        <Link to="/about">About</Link>
                    </>
                )}
                {role === "author" && (
                    <>
                        <Link to="/home">Home</Link>
                        <Link to="/writings">My Writings</Link>
                    </>
                )}
                {role === "admin" && (
                    <>
                        <Link to="/home">Dashboard</Link>
                        <Link to="/writings">All Writings</Link>
                        <Link to="/about">About</Link>
                    </>
                )}
                
                <button onClick={handleLogout} style={{ marginLeft: "auto", padding: "5px 10px", cursor: "pointer" }}>
                    Logout ({role})
                </button>
            </nav>
            
            <div style={{ padding: "20px" }}>
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;
