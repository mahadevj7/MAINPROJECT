import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Shield,
    AlertTriangle,
    MapPin,
    Clock,
    Phone,
    User,
    CheckCircle,
    XCircle,
    Activity,
    Wifi
} from "lucide-react";

const LiveAlerts = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Theme colors (matching AdminDashboard)
    const theme = {
        primary: "#8B5CF6",
        secondary: "#EC4899",
        success: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
        dark: "#1F2937",
        light: "#6B7280",
        bg: "#F3F4F6",
    };

    const fetchAlerts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/alerts');
            const data = await response.json();
            setAlerts(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch alerts", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 5000); // Poll every 5s for live updates
        return () => clearInterval(interval);
    }, []);

    const handleBack = () => {
        navigate('/admin');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: true
        });
    };

    const handleViewMap = (alert) => {
        if (alert.location) {
            let query = '';
            if (alert.location.latitude && alert.location.longitude) {
                query = `${alert.location.latitude},${alert.location.longitude}`;
            } else if (alert.location.address) {
                query = encodeURIComponent(alert.location.address);
            }

            if (query) {
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
            } else {
                alert("Location coordinates not available for this alert.");
            }
        }
    };

    const handleMarkSafe = async (alertId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/alerts/${alertId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'Resolved' })
            });

            if (response.ok) {
                // Optimistically update UI
                setAlerts(prev => prev.map(a =>
                    a._id === alertId ? { ...a, status: 'Resolved' } : a
                ));
            } else {
                alert("Failed to update status");
            }
        } catch (err) {
            console.error("Error updating status:", err);
            alert("Error updating status");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: theme.bg,
            fontFamily: '"DM Sans", sans-serif',
            padding: "32px"
        }}>
            {/* Header */}
            <header style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <button
                        onClick={handleBack}
                        style={{
                            background: "white",
                            border: "1px solid #E5E7EB",
                            borderRadius: "12px",
                            padding: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.dark,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 700, color: theme.dark, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Activity color={theme.danger} /> Live SOS Alerts
                        </h1>
                        <p style={{ fontSize: "14px", color: theme.light, margin: "4px 0 0" }}>
                            Real-time emergency monitoring console
                        </p>
                    </div>
                </div>

                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "white",
                    padding: "8px 16px",
                    borderRadius: "50px",
                    border: "1px solid #E5E7EB",
                    fontSize: "13px",
                    color: theme.success,
                    fontWeight: 600
                }}>
                    <span style={{
                        width: "8px",
                        height: "8px",
                        background: theme.success,
                        borderRadius: "50%",
                        animation: "pulse 2s infinite"
                    }}></span>
                    System Live
                </div>
                <style>{`
                    @keyframes pulse {
                        0% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(1.2); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            </header>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: theme.light }}>Loading alerts...</div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                    gap: "24px"
                }}>
                    {alerts.map((alert) => (
                        <div
                            key={alert._id}
                            style={{
                                background: "white",
                                borderRadius: "20px",
                                overflow: "hidden",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                border: `1px solid ${alert.status === 'Active' ? theme.danger : '#E5E7EB'}`,
                                position: "relative",
                                opacity: alert.status === 'Resolved' ? 0.7 : 1
                            }}
                        >
                            {/* Status Banner */}
                            <div style={{
                                background: alert.status === 'Active' ? theme.danger : theme.success,
                                padding: "12px 24px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                color: "white"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
                                    {alert.status === 'Active' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                                    {alert.status.toUpperCase()}
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", opacity: 0.9 }}>
                                    <Clock size={14} />
                                    {formatDate(alert.timestamp)}
                                </div>
                            </div>

                            <div style={{ padding: "24px" }}>
                                {/* User Info */}
                                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                                    <div style={{
                                        width: "56px",
                                        height: "56px",
                                        borderRadius: "16px",
                                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "24px",
                                        fontWeight: 700,
                                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                                    }}>
                                        {alert.user?.name?.charAt(0) || "U"}
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: "18px", fontWeight: 700, color: theme.dark, margin: "0 0 4px" }}>
                                            {alert.user?.name || "Unknown User"}
                                        </h3>
                                        <div style={{ display: "flex", gap: "12px", fontSize: "14px", color: theme.light }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Phone size={14} /> {alert.user?.phoneNumber || "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div style={{ display: "grid", gap: "16px" }}>
                                    {/* Location */}
                                    <div style={{
                                        background: theme.bg,
                                        padding: "16px",
                                        borderRadius: "12px",
                                        display: "flex",
                                        gap: "12px",
                                        alignItems: "flex-start"
                                    }}>
                                        <MapPin color={theme.info} size={20} style={{ marginTop: "2px" }} />
                                        <div>
                                            <span style={{ display: "block", fontSize: "12px", color: theme.light, fontWeight: 600, marginBottom: "4px" }}>
                                                LOCATION
                                            </span>
                                            <span style={{ fontSize: "14px", color: theme.dark, lineHeight: 1.5, display: "block" }}>
                                                {alert.location?.address ||
                                                    (alert.location?.latitude ?
                                                        `Lat: ${alert.location.latitude.toFixed(6)}, Lng: ${alert.location.longitude.toFixed(6)}` :
                                                        "Location not available")
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* IP Verification Status */}
                                    <div style={{
                                        background: alert.ipMatched ? "#ECFDF5" : "#FEF2F2",
                                        padding: "16px",
                                        borderRadius: "12px",
                                        border: `1px solid ${alert.ipMatched ? theme.success : theme.danger}30`,
                                        display: "flex",
                                        gap: "12px",
                                        alignItems: "center"
                                    }}>
                                        {alert.ipMatched ?
                                            <Wifi color={theme.success} size={20} /> :
                                            <Wifi color={theme.danger} size={20} />
                                        }
                                        <div>
                                            <span style={{ display: "block", fontSize: "12px", color: theme.light, fontWeight: 600, marginBottom: "2px" }}>
                                                DEVICE VERIFICATION
                                            </span>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{
                                                    fontSize: "14px",
                                                    fontWeight: 700,
                                                    color: alert.ipMatched ? theme.success : theme.danger
                                                }}>
                                                    {alert.ipMatched ? "Verified Device" : "Unverified Device"}
                                                </span>
                                                <span style={{ fontSize: "12px", color: theme.light }}>
                                                    ({alert.ipAddress})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <button
                                        onClick={() => handleViewMap(alert)}
                                        style={{
                                            padding: "12px",
                                            borderRadius: "10px",
                                            border: `1px solid ${theme.info}`,
                                            background: "white",
                                            color: theme.info,
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px"
                                        }}>
                                        <MapPin size={16} /> View Map
                                    </button>

                                    {alert.status === 'Active' ? (
                                        <button
                                            onClick={() => handleMarkSafe(alert._id)}
                                            style={{
                                                padding: "12px",
                                                borderRadius: "10px",
                                                border: "none",
                                                background: theme.success,
                                                color: "white",
                                                fontWeight: 600,
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                                boxShadow: `0 4px 12px ${theme.success}40`
                                            }}>
                                            <CheckCircle size={16} /> Mark Safe
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            style={{
                                                padding: "12px",
                                                borderRadius: "10px",
                                                border: "1px solid #E5E7EB",
                                                background: "#F3F4F6",
                                                color: "#9CA3AF",
                                                fontWeight: 600,
                                                cursor: "not-allowed",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px"
                                            }}>
                                            <CheckCircle size={16} /> Resolved
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {alerts.length === 0 && (
                        <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px", background: "white", borderRadius: "20px" }}>
                            <Shield size={64} color={theme.success} style={{ opacity: 0.2, marginBottom: "16px" }} />
                            <h3 style={{ color: theme.light }}>No active alerts</h3>
                            <p style={{ color: "#9CA3AF" }}>System is monitoring for emergencies...</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


export default LiveAlerts;
