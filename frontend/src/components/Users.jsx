import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users as UsersIcon,
    ArrowLeft,
    Trash2,
    Search,
    Mail,
    Phone,
    Calendar,
    Shield,
    AlertCircle,
    CheckCircle,
    MapPin,
    RefreshCw,
    UserX,
    Eye
} from "lucide-react";

const Users = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleting, setDeleting] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

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
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }

        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch("http://localhost:5000/api/auth/users", {
                method: "GET",
                headers: {
                    "x-auth-token": token,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to fetch users");
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            alert("Something went wrong. Please try again.");
        }
        setLoading(false);
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            return;
        }

        setDeleting(userId);
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:5000/api/auth/users/${userId}`, {
                method: "DELETE",
                headers: {
                    "x-auth-token": token,
                },
            });

            if (response.ok) {
                setUsers(users.filter(user => user._id !== userId));
                alert("User deleted successfully");
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Something went wrong. Please try again.");
        }
        setDeleting(null);
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.includes(searchTerm)
    );

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
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
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "18px",
                    color: theme.dark,
                }}>
                    <RefreshCw size={24} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                    Loading users...
                </div>
                <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: theme.bg,
            padding: "32px",
        }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <button
                            onClick={() => navigate("/admin")}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "white",
                                border: "none",
                                padding: "12px 20px",
                                borderRadius: "12px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: theme.dark,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            }}
                        >
                            <ArrowLeft size={18} /> Back to Dashboard
                        </button>

                        <div>
                            <h1 style={{ fontSize: "28px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                                User Management
                            </h1>
                            <p style={{ fontSize: "14px", color: theme.light, margin: "4px 0 0" }}>
                                {users.length} total users
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {/* Search */}
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "12px 16px",
                            background: "white",
                            borderRadius: "12px",
                            border: "1px solid #E5E7EB",
                            width: "300px",
                        }}>
                            <Search size={18} color={theme.light} />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    border: "none",
                                    outline: "none",
                                    fontSize: "14px",
                                    width: "100%",
                                }}
                            />
                        </div>

                        {/* Refresh */}
                        <button
                            onClick={fetchUsers}
                            style={{
                                padding: "12px",
                                background: "white",
                                border: "1px solid #E5E7EB",
                                borderRadius: "12px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <RefreshCw size={18} color={theme.light} />
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div style={{
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                    {/* Table Header */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 100px",
                        padding: "16px 24px",
                        background: theme.bg,
                        borderBottom: "1px solid #E5E7EB",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: theme.light,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                    }}>
                        <div>User</div>
                        <div>Contact</div>
                        <div>Joined</div>
                        <div>Role</div>
                        <div>Status</div>
                        <div style={{ textAlign: "center" }}>Actions</div>
                    </div>

                    {/* Table Body */}
                    {filteredUsers.length === 0 ? (
                        <div style={{
                            padding: "60px",
                            textAlign: "center",
                            color: theme.light,
                        }}>
                            <UserX size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                            <p style={{ fontSize: "16px", margin: 0 }}>
                                {searchTerm ? "No users found matching your search" : "No users found"}
                            </p>
                        </div>
                    ) : (
                        filteredUsers.map((user, index) => (
                            <div
                                key={user._id}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "2fr 2fr 1.5fr 1fr 1fr 100px",
                                    padding: "20px 24px",
                                    borderBottom: index < filteredUsers.length - 1 ? "1px solid #E5E7EB" : "none",
                                    alignItems: "center",
                                    transition: "background 0.2s",
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = "#FAFAFA"}
                                onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                {/* User Info */}
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontSize: "18px",
                                        fontWeight: 700,
                                    }}>
                                        {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: "15px", fontWeight: 600, color: theme.dark, margin: 0 }}>
                                            {user.name || "Unknown"}
                                        </p>
                                        <p style={{ fontSize: "12px", color: theme.light, margin: "2px 0 0" }}>
                                            ID: {user._id?.slice(-8)}
                                        </p>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                        <Mail size={14} color={theme.light} />
                                        <span style={{ fontSize: "13px", color: theme.dark }}>{user.email || "N/A"}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <Phone size={14} color={theme.light} />
                                        <span style={{ fontSize: "13px", color: theme.light }}>{user.phoneNumber || "Not provided"}</span>
                                    </div>
                                </div>

                                {/* Joined */}
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <Calendar size={14} color={theme.light} />
                                    <span style={{ fontSize: "13px", color: theme.dark }}>{formatDate(user.createdAt)}</span>
                                </div>

                                {/* Role */}
                                <div>
                                    <span style={{
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        background: user.role === "admin" ? `${theme.warning}15` : `${theme.info}15`,
                                        color: user.role === "admin" ? theme.warning : theme.info,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}>
                                        {user.role === "admin" ? <Shield size={12} /> : <UsersIcon size={12} />}
                                        {user.role || "user"}
                                    </span>
                                </div>

                                {/* Status */}
                                <div>
                                    <span style={{
                                        padding: "6px 12px",
                                        borderRadius: "20px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        background: `${theme.success}15`,
                                        color: theme.success,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}>
                                        <CheckCircle size={12} />
                                        Active
                                    </span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                                    <button
                                        onClick={() => setSelectedUser(user)}
                                        style={{
                                            padding: "8px",
                                            background: `${theme.info}15`,
                                            border: "none",
                                            borderRadius: "8px",
                                            color: theme.info,
                                            cursor: "pointer",
                                        }}
                                        title="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user._id, user.name)}
                                        disabled={deleting === user._id || user.role === "admin"}
                                        style={{
                                            padding: "8px",
                                            background: user.role === "admin" ? "#E5E7EB" : `${theme.danger}15`,
                                            border: "none",
                                            borderRadius: "8px",
                                            color: user.role === "admin" ? theme.light : theme.danger,
                                            cursor: user.role === "admin" ? "not-allowed" : "pointer",
                                            opacity: deleting === user._id ? 0.5 : 1,
                                        }}
                                        title={user.role === "admin" ? "Cannot delete admin" : "Delete User"}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Stats Footer */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "16px",
                    marginTop: "24px",
                }}>
                    {[
                        { label: "Total Users", value: users.length, color: theme.primary },
                        { label: "Admins", value: users.filter(u => u.role === "admin").length, color: theme.warning },
                        { label: "Regular Users", value: users.filter(u => u.role !== "admin").length, color: theme.info },
                        { label: "With Emergency Contacts", value: users.filter(u => u.emergencyContacts?.length > 0).length, color: theme.success },
                    ].map((stat, index) => (
                        <div
                            key={index}
                            style={{
                                background: "white",
                                borderRadius: "12px",
                                padding: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <span style={{ fontSize: "14px", color: theme.light }}>{stat.label}</span>
                            <span style={{ fontSize: "24px", fontWeight: 700, color: stat.color }}>{stat.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                }}>
                    <div style={{
                        background: "white",
                        borderRadius: "20px",
                        padding: "32px",
                        maxWidth: "600px",
                        width: "90%",
                        maxHeight: "80vh",
                        overflow: "auto",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ fontSize: "22px", fontWeight: 700, color: theme.dark, margin: 0 }}>User Details</h2>
                            <button
                                onClick={() => setSelectedUser(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: theme.light,
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            marginBottom: "24px",
                            padding: "20px",
                            background: theme.bg,
                            borderRadius: "12px",
                        }}>
                            <div style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "28px",
                                fontWeight: 700,
                            }}>
                                {selectedUser.name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "20px", fontWeight: 700, color: theme.dark, margin: 0 }}>{selectedUser.name}</h3>
                                <p style={{ fontSize: "14px", color: theme.light, margin: "4px 0 0" }}>{selectedUser.email}</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {[
                                { label: "Phone", value: selectedUser.phoneNumber || "Not provided", icon: <Phone size={16} /> },
                                { label: "Role", value: selectedUser.role || "user", icon: <Shield size={16} /> },
                                { label: "Gender", value: selectedUser.gender || "Not specified", icon: <UsersIcon size={16} /> },
                                { label: "Blood Group", value: selectedUser.bloodGroup || "Not specified", icon: <AlertCircle size={16} /> },
                                { label: "Home Address", value: selectedUser.homeAddress || "Not provided", icon: <MapPin size={16} /> },
                                { label: "Joined", value: formatDate(selectedUser.createdAt), icon: <Calendar size={16} /> },
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    padding: "12px 16px",
                                    background: theme.bg,
                                    borderRadius: "10px",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                        <span style={{ color: theme.primary }}>{item.icon}</span>
                                        <span style={{ fontSize: "12px", color: theme.light, textTransform: "uppercase" }}>{item.label}</span>
                                    </div>
                                    <p style={{ fontSize: "14px", color: theme.dark, margin: 0, fontWeight: 500 }}>{item.value}</p>
                                </div>
                            ))}
                        </div>

                        {selectedUser.emergencyContacts?.length > 0 && (
                            <div style={{ marginTop: "24px" }}>
                                <h4 style={{ fontSize: "16px", fontWeight: 600, color: theme.dark, marginBottom: "12px" }}>
                                    Emergency Contacts ({selectedUser.emergencyContacts.length})
                                </h4>
                                {selectedUser.emergencyContacts.map((contact, idx) => (
                                    <div key={idx} style={{
                                        padding: "12px",
                                        background: theme.bg,
                                        borderRadius: "10px",
                                        marginBottom: "8px",
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}>
                                        <div>
                                            <p style={{ fontSize: "14px", fontWeight: 600, color: theme.dark, margin: 0 }}>{contact.name}</p>
                                            <p style={{ fontSize: "12px", color: theme.light, margin: "2px 0 0" }}>{contact.relation}</p>
                                        </div>
                                        <p style={{ fontSize: "13px", color: theme.primary, margin: 0 }}>{contact.phoneNumber}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedUser.ipAddresses?.length > 0 && (
                            <div style={{ marginTop: "24px" }}>
                                <h4 style={{ fontSize: "16px", fontWeight: 600, color: theme.dark, marginBottom: "12px" }}>
                                    Registered Devices ({selectedUser.ipAddresses.length}/3)
                                </h4>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    {selectedUser.ipAddresses.map((ip, idx) => (
                                        <span key={idx} style={{
                                            padding: "6px 12px",
                                            background: theme.bg,
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            color: theme.dark,
                                        }}>
                                            {ip}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
