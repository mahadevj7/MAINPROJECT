import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import {
  User,
  Calendar,
  Phone,
  MapPin,
  Users,
  AlertCircle,
  History,
  ArrowRight,
  Shield,
  MessageSquare
} from "lucide-react";
import "./UserDashboard.css";

const UserDashboard = () => {
  const navigate = useNavigate();

  // Siren Sound Generator
  const playSiren = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);

    const now = audioCtx.currentTime;
    for (let i = 0; i < 10; i++) {
      oscillator.frequency.linearRampToValueAtTime(880, now + i * 2 + 1);
      oscillator.frequency.linearRampToValueAtTime(440, now + i * 2 + 2);
    }

    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 20);

    oscillator.start(now);
    oscillator.stop(now + 20);
  };

  /* SOS Timer State */
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);

  const triggerSOS = async () => {
    playSiren();
    alert('SOS ALERT ACTIVATED! Sending your location and details to emergency contacts...');

    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp = ipData.ip;

      navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        const user = JSON.parse(localStorage.getItem('user'));

        const payload = {
          userId: user ? (user.id || user._id) : null,
          ipAddress: userIp,
          location
        };

        const response = await fetch('http://localhost:5000/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('SOS Response:', data);
      }, (error) => {
        console.error("Location error:", error);
        const user = JSON.parse(localStorage.getItem('user'));

        const payload = {
          userId: user ? (user.id || user._id) : null,
          ipAddress: userIp
        };

        fetch('http://localhost:5000/api/alerts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      });

    } catch (error) {
      console.error('Error sending SOS:', error);
    }
  };

  const handleSOSClick = () => {
    setIsSosModalOpen(true);
    setSosCountdown(5);
  };

  const cancelSOS = () => {
    setIsSosModalOpen(false);
    setSosCountdown(5);
  };

  useEffect(() => {
    let interval;
    if (isSosModalOpen && sosCountdown > 0) {
      interval = setInterval(() => {
        setSosCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSosModalOpen && sosCountdown === 0) {
      setIsSosModalOpen(false);
      triggerSOS();
    }
    return () => clearInterval(interval);
  }, [isSosModalOpen, sosCountdown]);

  const user = JSON.parse(localStorage.getItem('user'));
  const profileName = user ? user.name : "User";

  const dashboardCards = [
    {
      label: "My Profile",
      description: "Manage your personal information and settings",
      icon: <User size={36} />,
      color: "#667eea",
      shadowColor: "rgba(102, 126, 234, 0.35)",
      path: "/profile"
    },
    {
      label: "Counselling",
      description: "Book sessions with professional counselors",
      icon: <Calendar size={36} />,
      color: "#10b981",
      shadowColor: "rgba(16, 185, 129, 0.35)",
      path: "/counselling"
    },
    {
      label: "Emergency",
      description: "Quick access to emergency contacts and helplines",
      icon: <Phone size={36} />,
      color: "#ef4444",
      shadowColor: "rgba(239, 68, 68, 0.35)",
      path: "/emergency"
    },
    {
      label: "Live Location",
      description: "Share your real-time location with trusted contacts",
      icon: <MapPin size={36} />,
      color: "#f59e0b",
      shadowColor: "rgba(245, 158, 11, 0.35)",
      path: "/location"
    },
    {
      label: "Community",
      description: "Connect with others in a safe supportive space",
      icon: <Users size={36} />,
      color: "#8b5cf6",
      shadowColor: "rgba(139, 92, 246, 0.35)",
      path: "/community"
    },
    {
      label: "Alert History",
      description: "View your past alerts and emergency notifications",
      icon: <History size={36} />,
      color: "#ec4899",
      shadowColor: "rgba(236, 72, 153, 0.35)",
      path: "/alerts-history"
    },
    {
      label: "Feedback",
      description: "Share your experience and help us improve",
      icon: <MessageSquare size={36} />,
      color: "#0ea5e9",
      shadowColor: "rgba(14, 165, 233, 0.35)",
      path: "/feedback"
    }
  ];

  return (
    <div className="user-dashboard">

      {/* Content Wrapper */}
      <div className="dashboard-content">
        {/* Top Navbar */}
        <Navbar onLogout={() => navigate("/")} />

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-welcome">
            Welcome back, {profileName}
          </h1>
          <p className="dashboard-subtitle">
            <Shield size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Your safety dashboard is ready. Stay protected.
          </p>
        </div>

        {/* SOS Button Section */}
        <div className="sos-container">
          <div className="sos-button-wrapper">
            <div className="sos-ripple"></div>
            <div className="sos-ripple"></div>
            <div className="sos-ripple"></div>
            <button className="sos-button" onClick={handleSOSClick}>
              <AlertCircle size={48} />
              <span>SOS</span>
              <span className="sos-button-label">Emergency Alert</span>
            </button>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="dashboard-grid">
          {dashboardCards.map((card) => (
            <div
              key={card.label}
              className="dashboard-card"
              onClick={() => navigate(card.path)}
              style={{
                '--card-accent': card.color,
                '--card-shadow': card.shadowColor
              }}
            >
              <div className="card-icon-wrapper">
                <span className="card-icon">{card.icon}</span>
              </div>
              <h3 className="card-title">{card.label}</h3>
              <p className="card-description">{card.description}</p>
              <div className="card-arrow">
                <ArrowRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SOS Confirmation Modal */}
      {isSosModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '32px',
            padding: '48px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 24px 80px rgba(239, 68, 68, 0.5)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Progress Bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '6px',
              background: '#ef4444',
              width: `${(sosCountdown / 5) * 100}%`,
              transition: 'width 1s linear'
            }}></div>

            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: '#ef4444',
              animation: 'pulse-ring 1s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              <span style={{ fontSize: '48px', fontWeight: '800' }}>{sosCountdown}</span>
            </div>

            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#1f2937', marginBottom: '16px' }}>
              Emergency Alert
            </h2>

            <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px', lineHeight: '1.6' }}>
              SOS signal will be sent in <strong>{sosCountdown} seconds</strong>.
              <br />
              Your location and details will be shared with emergency contacts.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={cancelSOS}
                style={{
                  padding: '16px 32px',
                  borderRadius: '50px',
                  background: '#f3f4f6',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#4b5563',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: 1
                }}
                onMouseOver={(e) => e.target.style.background = '#e5e7eb'}
                onMouseOut={(e) => e.target.style.background = '#f3f4f6'}
              >
                Cancel
              </button>
              <button
                onClick={triggerSOS}
                style={{
                  padding: '16px 32px',
                  borderRadius: '50px',
                  background: '#ef4444',
                  border: 'none',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: 1,
                  boxShadow: '0 8px 24px rgba(239, 68, 68, 0.4)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 32px rgba(239, 68, 68, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
                }}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
