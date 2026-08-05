import { Route, Routes, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Writings from "./components/Writings";
import About from "./components/About";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/home" element={<Home />} />
        <Route path="/writings" element={<Writings />} />
        <Route path="/about" element={<About />} />
      </Route>
    </Routes>
  );
}

export default App;