import React, { useState } from "react";
import { Shield, LogOut, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <header className="navbar">
      {/* LEFT: Logo + Website Name */}
      <div className="navbar-brand" onClick={() => navigate("/dashboard")}>
        <div className="navbar-logo">
          <Shield size={24} />
          <Sparkles size={12} className="navbar-logo-sparkle" />
        </div>
        <div className="navbar-title-wrapper">
          <h1 className="navbar-title">SafeHer</h1>
          <span className="navbar-tagline">Your Safety Companion</span>
        </div>
      </div>

      {/* RIGHT: Logout */}
      <button
        className={`navbar-logout ${isHovered ? 'navbar-logout--hover' : ''}`}
        onClick={onLogout}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <LogOut size={16} />
        <span>Logout</span>
      </button>
    </header>
  );
};

export default Navbar;
