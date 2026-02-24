import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { ArrowLeft, AlertCircle, MapPin, Calendar, Clock, CheckCircle, XCircle, Activity } from 'lucide-react';

const RecentAlerts = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const userId = user ? (user.id || user._id) : null;

                if (!userId) {
                    setError("User not found. Please log in.");
                    setLoading(false);
                    return;
                }

                const response = await fetch(`http://localhost:5000/api/alerts/user/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch alerts');
                }
                const data = await response.json();
                setAlerts(data);
            } catch (err) {
                console.error("Error fetching alerts:", err);
                setError("Could not load alerts. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return '#ef4444'; // Red
            case 'Resolved': return '#10b981'; // Green
            case 'False Alarm': return '#f59e0b'; // Amber
            default: return '#6b7280'; // Gray
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Active': return <Activity size={20} />;
            case 'Resolved': return <CheckCircle size={20} />;
            case 'False Alarm': return <XCircle size={20} />;
            default: return <AlertCircle size={20} />;
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            padding: "40px",
            background: "white",
            fontFamily: "'Inter', sans-serif"
        }}>
            <Navbar onLogout={() => navigate("/")} />

            <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", marginBottom: "32px" }}>
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            background: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "48px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            marginRight: "20px",
                            color: "#4b5563"
                        }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#1f2937", margin: "auto", marginTop: "15px" }}>
                        Recent Alerts History
                    </h1>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
                        Loading alert history...
                    </div>
                ) : error ? (
                    <div style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        padding: "24px",
                        borderRadius: "16px",
                        textAlign: "center"
                    }}>
                        {error}
                    </div>
                ) : alerts.length === 0 ? (
                    <div style={{
                        background: "white",
                        padding: "60px",
                        borderRadius: "24px",
                        textAlign: "center",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
                    }}>
                        <div style={{
                            background: "#eff6ff",
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                            color: "#3b82f6"
                        }}>
                            <CheckCircle size={40} />
                        </div>
                        <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>No Alerts Found</h3>
                        <p style={{ color: "#6b7280" }}>You haven't sent any emergency alerts yet. Stay safe!</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {alerts.map((alert) => (
                            <div key={alert._id} style={{
                                background: "white",
                                borderRadius: "20px",
                                padding: "24px",
                                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                                display: "grid",
                                gridTemplateColumns: "auto 1fr auto",
                                gap: "24px",
                                alignItems: "center",
                                borderLeft: `6px solid ${getStatusColor(alert.status)}`
                            }}>
                                {/* Icon Column */}
                                <div style={{
                                    width: "60px",
                                    height: "60px",
                                    borderRadius: "16px",
                                    background: `${getStatusColor(alert.status)}20`,
                                    color: getStatusColor(alert.status),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    {getStatusIcon(alert.status)}
                                </div>

                                {/* Details Column */}
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1f2937" }}>
                                            {alert.type} Alert
                                        </h3>
                                        <span style={{
                                            background: `${getStatusColor(alert.status)}20`,
                                            color: getStatusColor(alert.status),
                                            padding: "4px 12px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            fontWeight: "600"
                                        }}>
                                            {alert.status}
                                        </span>
                                    </div>

                                    <div style={{ display: "flex", gap: "24px", color: "#6b7280", fontSize: "14px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Calendar size={16} />
                                            {new Date(alert.timestamp || alert.createdAt).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Clock size={16} />
                                            {new Date(alert.timestamp || alert.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>

                                    {alert.location && (
                                        <div style={{ marginTop: "12px", display: "flex", alignItems: "flex-start", gap: "6px", color: "#4b5563", fontSize: "14px" }}>
                                            <MapPin size={16} style={{ marginTop: "2px", flexShrink: 0 }} />
                                            <span>
                                                {alert.location.address ||
                                                    (alert.location.latitude ?
                                                        `Lat: ${alert.location.latitude.toFixed(4)}, Long: ${alert.location.longitude.toFixed(4)}` :
                                                        "Location data not available"
                                                    )
                                                }
                                            </span>
                                        </div>
                                    )}

                                    <div style={{ marginTop: "8px", fontSize: "12px", color: "#9ca3af" }}>
                                        IP: {alert.ipAddress} • ID: {alert._id.slice(-6).toUpperCase()}
                                    </div>
                                </div>

                                {/* Action/Time Column (Optional) */}
                                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {/* Could put action buttons here if needed */}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentAlerts;
