import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    Shield,
    AlertTriangle,
    Activity,
    LogOut,
    Search,
    Bell,
    TrendingUp,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Stethoscope,
    MessageSquare
} from "lucide-react";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    // Dynamic stats state
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeAlerts: 0,
        sosToday: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);

    // Theme colors
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

    // Helper function to format relative time
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInDays === 0) return "Today";
        if (diffInDays === 1) return "Yesterday";
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (!token) {
            navigate("/");
            return;
        }

        if (user) {
            try {
                const parsedUser = JSON.parse(user);
                if (parsedUser.role !== "admin") {
                    alert("Access denied. Admin privileges required.");
                    navigate("/dashboard");
                    return;
                }
                setAdminData(parsedUser);
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
        setLoading(false);

        // Fetch Admin Dashboard Data
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem("token");
                const headers = {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                };

                // Fetch Stats
                const statsResponse = await fetch('http://localhost:5000/api/auth/admin/stats', { headers });
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData);
                }

                // Fetch Recent Users
                const usersResponse = await fetch('http://localhost:5000/api/auth/admin/recent-users', { headers });
                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setRecentUsers(usersData);
                }

                // Fetch Alerts
                const alertsResponse = await fetch('http://localhost:5000/api/alerts');
                if (alertsResponse.ok) {
                    const alertsData = await alertsResponse.json();
                    setRecentAlerts(alertsData.slice(0, 5)); // Get only first 5
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000); // Poll every 10s

        return () => clearInterval(interval);
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme.bg,
            }}>
                <div style={{ fontSize: "18px", color: theme.dark }}>Loading admin dashboard...</div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: theme.bg,
            display: "flex",
        }}>
            {/* Sidebar */}
            <aside style={{
                width: "280px",
                background: "white",
                borderRight: "1px solid #E5E7EB",
                padding: "24px 0",
                display: "flex",
                flexDirection: "column",
            }}>
                {/* Logo */}
                <div style={{
                    padding: "0 24px 24px",
                    borderBottom: "1px solid #E5E7EB",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <Shield size={24} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: "20px", fontWeight: 700, color: theme.dark, margin: 0 }}>SafeHer</h1>
                            <p style={{ fontSize: "12px", color: theme.light, margin: 0 }}>Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: "24px 16px" }}>
                    {[
                        { id: "overview", label: "Overview", icon: <Activity size={20} />, path: null },
                        { id: "users", label: "Users", icon: <Users size={20} />, path: "/admin/users" },
                        { id: "alerts", label: "Active Alerts", icon: <AlertTriangle size={20} />, path: "/admin/alerts" },
                        { id: "counselling", label: "Manage Counselling", icon: <Stethoscope size={20} />, path: "/admin/counselling" },
                        { id: "reports", label: "Reports", icon: <TrendingUp size={20} />, path: "/admin/reports" },
                        { id: "feedbacks", label: "Feedbacks", icon: <MessageSquare size={20} />, path: "/admin/feedbacks" },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                if (item.path) {
                                    navigate(item.path);
                                } else {
                                    setActiveTab(item.id);
                                }
                            }}
                            style={{
                                width: "100%",
                                padding: "14px 16px",
                                marginBottom: "8px",
                                background: activeTab === item.id ? `${theme.primary}15` : "transparent",
                                border: "none",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                cursor: "pointer",
                                color: activeTab === item.id ? theme.primary : theme.light,
                                fontWeight: activeTab === item.id ? 600 : 400,
                                fontSize: "15px",
                                transition: "all 0.2s",
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
                <div style={{ padding: "16px" }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            padding: "14px 16px",
                            background: "#FEE2E2",
                            border: "none",
                            borderRadius: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            cursor: "pointer",
                            color: theme.danger,
                            fontWeight: 600,
                            fontSize: "15px",
                        }}
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: "32px" }}>
                {/* Header */}
                <header style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                            Welcome back, {adminData?.name || "Admin"}
                        </h1>
                        <p style={{ fontSize: "14px", color: theme.light, margin: "4px 0 0" }}>
                            Here's what's happening with SafeHer today.
                        </p>
                    </div>

                   

                    
                </header>

                {/* Stats Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "24px",
                    marginBottom: "32px",
                }}>
                    {/* Total Users Card */}
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <p style={{ fontSize: "14px", color: theme.light, margin: "0 0 8px" }}>Total Users</p>
                                <h2 style={{ fontSize: "32px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                                    {stats.totalUsers.toLocaleString()}
                                </h2>
                            </div>
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: `${theme.primary}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: theme.primary,
                            }}>
                                <Users size={24} />
                            </div>
                        </div>
                        <p style={{
                            fontSize: "12px",
                            color: theme.light,
                            margin: "12px 0 0",
                            fontWeight: 500,
                        }}>
                            Registered users
                        </p>
                    </div>

                    {/* Active Alerts Card */}
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <p style={{ fontSize: "14px", color: theme.light, margin: "0 0 8px" }}>Active Alerts</p>
                                <h2 style={{ fontSize: "32px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                                    {stats.activeAlerts}
                                </h2>
                            </div>
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: `${theme.danger}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: theme.danger,
                            }}>
                                <AlertTriangle size={24} />
                            </div>
                        </div>
                        <p style={{
                            fontSize: "12px",
                            color: stats.activeAlerts > 0 ? theme.danger : theme.success,
                            margin: "12px 0 0",
                            fontWeight: 600,
                        }}>
                            {stats.activeAlerts > 0 ? "Requires attention" : "All clear"}
                        </p>
                    </div>

                    {/* SOS Triggered Today Card */}
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <p style={{ fontSize: "14px", color: theme.light, margin: "0 0 8px" }}>SOS Triggered Today</p>
                                <h2 style={{ fontSize: "32px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                                    {stats.sosToday}
                                </h2>
                            </div>
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: `${theme.warning}15`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: theme.warning,
                            }}>
                                <Shield size={24} />
                            </div>
                        </div>
                        <p style={{
                            fontSize: "12px",
                            color: theme.light,
                            margin: "12px 0 0",
                            fontWeight: 500,
                        }}>
                            Emergency alerts today
                        </p>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
                    {/* Recent Alerts */}
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, color: theme.dark, margin: 0 }}>Recent Alerts</h3>
                            <button
                                onClick={() => navigate("/admin/alerts")}
                                style={{
                                    padding: "8px 16px",
                                    background: `${theme.primary}15`,
                                    border: "none",
                                    borderRadius: "8px",
                                    color: theme.primary,
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                View All
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {recentAlerts.map((alert) => (
                                <div
                                    key={alert._id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "16px",
                                        background: theme.bg,
                                        borderRadius: "12px",
                                        borderLeft: alert.ipMatched ? `4px solid ${theme.success}` : `4px solid ${theme.danger}`
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{
                                            width: "40px",
                                            height: "40px",
                                            borderRadius: "10px",
                                            background: alert.status === "Active" ? `${theme.danger}15` : `${theme.success}15`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}>
                                            {alert.status === "Active" ? (
                                                <AlertTriangle size={18} color={theme.danger} />
                                            ) : (
                                                <CheckCircle size={18} color={theme.success} />
                                            )}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "14px", fontWeight: 600, color: theme.dark, margin: 0 }}>
                                                {alert.user?.name || "Unknown User"}
                                            </p>
                                            <p style={{ fontSize: "12px", color: theme.light, margin: "2px 0 0" }}>
                                                {alert.type} • <MapPin size={12} style={{ verticalAlign: "middle" }} />
                                                {alert.location?.address || `Lat: ${alert.location?.latitude?.toFixed(4)}, Lng: ${alert.location?.longitude?.toFixed(4)}` || "Location N/A"}
                                            </p>
                                            <p style={{ fontSize: "11px", color: alert.ipMatched ? theme.success : theme.danger, margin: "2px 0 0", fontWeight: 'bold' }}>
                                                IP: {alert.ipAddress} ({alert.ipMatched ? "Verified" : "Unverified Device"})
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: "right" }}>
                                        <p style={{ fontSize: "12px", color: theme.light, margin: 0 }}>
                                            <Clock size={12} style={{ verticalAlign: "middle" }} /> {new Date(alert.timestamp).toLocaleTimeString()}
                                        </p>
                                        <span style={{
                                            fontSize: "11px",
                                            padding: "4px 8px",
                                            borderRadius: "6px",
                                            background: alert.status === "Active" ? `${theme.danger}15` : `${theme.success}15`,
                                            color: alert.status === "Active" ? theme.danger : theme.success,
                                            fontWeight: 600,
                                            textTransform: "capitalize",
                                            display: 'inline-block',
                                            marginTop: '4px'
                                        }}>
                                            {alert.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div style={{
                        background: "white",
                        borderRadius: "16px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "18px", fontWeight: 700, color: theme.dark, margin: 0 }}>Recent Users</h3>
                            <button
                                onClick={() => navigate("/admin/users")}
                                style={{
                                    padding: "8px 16px",
                                    background: `${theme.primary}15`,
                                    border: "none",
                                    borderRadius: "8px",
                                    color: theme.primary,
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}>
                                View All
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {recentUsers.length === 0 ? (
                                <p style={{ fontSize: "14px", color: theme.light, textAlign: "center", padding: "20px" }}>
                                    No recent users found
                                </p>
                            ) : (
                                recentUsers.map((user) => (
                                    <div
                                        key={user._id}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            padding: "12px",
                                            borderRadius: "10px",
                                            transition: "background 0.2s",
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.background = theme.bg}
                                        onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontSize: "16px",
                                                fontWeight: 700,
                                            }}>
                                                {user.name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: "14px", fontWeight: 600, color: theme.dark, margin: 0 }}>{user.name}</p>
                                                <p style={{ fontSize: "12px", color: theme.light, margin: "2px 0 0" }}>{user.email}</p>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <p style={{ fontSize: "11px", color: theme.light, margin: "0 0 4px" }}>
                                                Joined {getRelativeTime(user.createdAt)}
                                            </p>
                                            <span style={{
                                                fontSize: "11px",
                                                padding: "4px 8px",
                                                borderRadius: "6px",
                                                background: `${theme.success}15`,
                                                color: theme.success,
                                                fontWeight: 600,
                                            }}>
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
