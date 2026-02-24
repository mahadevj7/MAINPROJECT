import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    MessageSquare,
    Star,
    Trash2,
    User,
    Clock,
    Search,
    Filter,
    ChevronDown,
    AlertTriangle,
    CheckCircle
} from "lucide-react";

const AdminFeedbacks = () => {
    const navigate = useNavigate();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRating, setFilterRating] = useState(0);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

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
        starActive: "#F59E0B",
        starInactive: "#D1D5DB"
    };

    const fetchFeedbacks = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/feedback');
            const data = await response.json();
            setFeedbacks(data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch feedbacks", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const handleBack = () => {
        navigate('/admin');
    };

    const handleDeleteClick = (id) => {
        setDeletingId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/feedback/${deletingId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (res.ok) {
                setFeedbacks(prev => prev.filter(f => f._id !== deletingId));
                setShowDeleteModal(false);
                setDeletingId(null);
            } else {
                alert("Failed to delete feedback.");
            }
        } catch (err) {
            console.error("Error deleting feedback:", err);
            alert("Error deleting feedback.");
        }
    };

    const getRatingLabel = (r) => {
        const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        return labels[r] || '';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: 'numeric',
            hour12: true
        });
    };

    // Compute stats
    const totalFeedbacks = feedbacks.length;
    const averageRating = totalFeedbacks > 0
        ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalFeedbacks).toFixed(1)
        : '0.0';
    const ratingDistribution = [1, 2, 3, 4, 5].map(
        star => feedbacks.filter(f => f.rating === star).length
    );

    // Filter feedbacks
    const filteredFeedbacks = feedbacks.filter(fb => {
        const matchesSearch = searchTerm === "" ||
            fb.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fb.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = filterRating === 0 || fb.rating === filterRating;
        return matchesSearch && matchesRating;
    });

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
                            <MessageSquare color={theme.primary} /> User Feedbacks
                        </h1>
                        <p style={{ fontSize: "14px", color: theme.light, margin: "4px 0 0" }}>
                            View and manage all user feedback submissions
                        </p>
                    </div>
                </div>

                <div style={{
                    background: "white",
                    padding: "8px 16px",
                    borderRadius: "50px",
                    border: "1px solid #E5E7EB",
                    fontSize: "13px",
                    color: theme.primary,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <MessageSquare size={14} />
                    {totalFeedbacks} Total Feedbacks
                </div>
            </header>

            {/* Stats Row */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
                marginBottom: "32px"
            }}>
                {/* Total Feedbacks Card */}
                <div style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ fontSize: "14px", color: theme.light, margin: "0 0 8px" }}>Total Feedbacks</p>
                            <h2 style={{ fontSize: "32px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                                {totalFeedbacks}
                            </h2>
                        </div>
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "12px",
                            background: `${theme.primary}15`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: theme.primary,
                        }}>
                            <MessageSquare size={24} />
                        </div>
                    </div>
                    <p style={{ fontSize: "12px", color: theme.light, margin: "12px 0 0", fontWeight: 500 }}>
                        All time submissions
                    </p>
                </div>

                {/* Average Rating Card */}
                <div style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ fontSize: "14px", color: theme.light, margin: "0 0 8px" }}>Average Rating</p>
                            <h2 style={{ fontSize: "32px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                                {averageRating}
                            </h2>
                        </div>
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "12px",
                            background: `${theme.warning}15`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: theme.warning,
                        }}>
                            <Star size={24} fill={theme.warning} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "3px", marginTop: "12px" }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                size={14}
                                fill={parseFloat(averageRating) >= star ? theme.starActive : 'none'}
                                color={parseFloat(averageRating) >= star ? theme.starActive : theme.starInactive}
                                strokeWidth={1.5}
                            />
                        ))}
                        <span style={{ fontSize: "12px", color: theme.light, marginLeft: "6px", fontWeight: 500 }}>
                            out of 5
                        </span>
                    </div>
                </div>

                {/* Rating Distribution Card */}
                <div style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                    <p style={{ fontSize: "14px", color: theme.light, margin: "0 0 16px", fontWeight: 500 }}>Rating Distribution</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = ratingDistribution[star - 1];
                            const percentage = totalFeedbacks > 0 ? (count / totalFeedbacks) * 100 : 0;
                            return (
                                <div key={star} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "12px", color: theme.dark, fontWeight: 600, width: "14px" }}>{star}</span>
                                    <Star size={12} fill={theme.starActive} color={theme.starActive} />
                                    <div style={{
                                        flex: 1, height: "8px", background: "#F3F4F6",
                                        borderRadius: "4px", overflow: "hidden"
                                    }}>
                                        <div style={{
                                            height: "100%", borderRadius: "4px",
                                            background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                                            width: `${percentage}%`,
                                            transition: "width 0.5s ease"
                                        }} />
                                    </div>
                                    <span style={{ fontSize: "12px", color: theme.light, fontWeight: 500, width: "24px", textAlign: "right" }}>
                                        {count}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div style={{
                display: "flex",
                gap: "16px",
                marginBottom: "24px",
                alignItems: "center"
            }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "12px 16px", background: "white",
                    borderRadius: "12px", border: "1px solid #E5E7EB",
                    flex: 1
                }}>
                    <Search size={18} color={theme.light} />
                    <input
                        type="text"
                        placeholder="Search by name, email, subject, or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            border: "none", outline: "none", fontSize: "14px",
                            width: "100%", fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Rating Filter */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "12px 16px", background: "white",
                    borderRadius: "12px", border: "1px solid #E5E7EB",
                    position: "relative"
                }}>
                    <Filter size={16} color={theme.light} />
                    <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(Number(e.target.value))}
                        style={{
                            border: "none", outline: "none", fontSize: "14px",
                            cursor: "pointer", background: "transparent",
                            color: theme.dark, fontWeight: 500, fontFamily: 'inherit',
                            paddingRight: "20px", appearance: "none"
                        }}
                    >
                        <option value={0}>All Ratings</option>
                        <option value={5}>⭐ 5 - Excellent</option>
                        <option value={4}>⭐ 4 - Very Good</option>
                        <option value={3}>⭐ 3 - Good</option>
                        <option value={2}>⭐ 2 - Fair</option>
                        <option value={1}>⭐ 1 - Poor</option>
                    </select>
                    <ChevronDown size={14} color={theme.light} style={{ position: "absolute", right: "12px", pointerEvents: "none" }} />
                </div>
            </div>

            {/* Feedbacks List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: theme.light }}>Loading feedbacks...</div>
            ) : filteredFeedbacks.length === 0 ? (
                <div style={{
                    textAlign: "center", padding: "60px",
                    background: "white", borderRadius: "20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}>
                    <MessageSquare size={64} color={theme.light} style={{ opacity: 0.2, marginBottom: "16px" }} />
                    <h3 style={{ color: theme.light, margin: "0 0 8px" }}>No feedbacks found</h3>
                    <p style={{ color: "#9CA3AF", fontSize: "14px" }}>
                        {searchTerm || filterRating ? "Try adjusting your search or filter criteria." : "No feedback submissions yet."}
                    </p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {filteredFeedbacks.map((fb) => (
                        <div
                            key={fb._id}
                            style={{
                                background: "white",
                                borderRadius: "16px",
                                padding: "24px",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                                border: "1px solid #E5E7EB",
                                transition: "transform 0.2s, box-shadow 0.2s"
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "translateY(-2px)";
                                e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                            }}
                        >
                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "16px"
                            }}>
                                {/* Left: User Info + Content */}
                                <div style={{ display: "flex", gap: "16px", flex: 1 }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: "48px", height: "48px", borderRadius: "14px",
                                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: "white", fontSize: "20px", fontWeight: 700,
                                        flexShrink: 0
                                    }}>
                                        {fb.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                    </div>

                                    {/* Content */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px", flexWrap: "wrap" }}>
                                            <h3 style={{ fontSize: "16px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                                                {fb.user?.name || "Unknown User"}
                                            </h3>
                                            <span style={{ fontSize: "13px", color: theme.light }}>
                                                {fb.user?.email || ""}
                                            </span>
                                        </div>

                                        {/* Star Rating */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "10px" }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    fill={fb.rating >= star ? theme.starActive : 'none'}
                                                    color={fb.rating >= star ? theme.starActive : theme.starInactive}
                                                    strokeWidth={1.5}
                                                />
                                            ))}
                                            <span style={{
                                                fontSize: "12px", fontWeight: 600,
                                                color: theme.starActive, marginLeft: "6px",
                                                background: `${theme.warning}15`,
                                                padding: "2px 8px", borderRadius: "6px"
                                            }}>
                                                {getRatingLabel(fb.rating)}
                                            </span>
                                        </div>

                                        {/* Subject */}
                                        <h4 style={{
                                            fontSize: "15px", fontWeight: 600,
                                            color: theme.dark, margin: "0 0 8px"
                                        }}>
                                            {fb.subject}
                                        </h4>

                                        {/* Message */}
                                        <p style={{
                                            fontSize: "14px", color: theme.light,
                                            lineHeight: "1.6", margin: "0 0 8px"
                                        }}>
                                            {fb.message}
                                        </p>

                                        {/* Timestamp */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <Clock size={13} color={theme.light} />
                                            <span style={{ fontSize: "12px", color: theme.light }}>
                                                {formatDate(fb.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Delete Button */}
                                <button
                                    onClick={() => handleDeleteClick(fb._id)}
                                    style={{
                                        background: `${theme.danger}10`,
                                        border: "none",
                                        borderRadius: "10px",
                                        padding: "10px",
                                        cursor: "pointer",
                                        color: theme.danger,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 0.2s",
                                        flexShrink: 0
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = theme.danger;
                                        e.currentTarget.style.color = "white";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = `${theme.danger}10`;
                                        e.currentTarget.style.color = theme.danger;
                                    }}
                                    title="Delete feedback"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 2000, padding: "20px"
                }}>
                    <div style={{
                        background: "white", borderRadius: "24px", padding: "40px",
                        maxWidth: "440px", width: "100%",
                        boxShadow: "0 24px 48px rgba(0,0,0,0.15)",
                        textAlign: "center"
                    }}>
                        <div style={{
                            width: "72px", height: "72px", borderRadius: "50%",
                            background: "#FEE2E2",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 20px"
                        }}>
                            <AlertTriangle size={32} color={theme.danger} />
                        </div>

                        <h2 style={{ fontSize: "22px", fontWeight: 700, color: theme.dark, marginBottom: "12px" }}>
                            Delete Feedback?
                        </h2>
                        <p style={{ fontSize: "15px", color: theme.light, marginBottom: "32px", lineHeight: "1.5" }}>
                            This action cannot be undone. The feedback will be permanently removed from the system.
                        </p>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeletingId(null); }}
                                style={{
                                    flex: 1, padding: "14px 24px",
                                    borderRadius: "12px", border: "1px solid #E5E7EB",
                                    background: "white", color: theme.dark,
                                    fontSize: "15px", fontWeight: 600, cursor: "pointer",
                                    transition: "background 0.2s"
                                }}
                                onMouseOver={(e) => e.target.style.background = "#F9FAFB"}
                                onMouseOut={(e) => e.target.style.background = "white"}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                style={{
                                    flex: 1, padding: "14px 24px",
                                    borderRadius: "12px", border: "none",
                                    background: theme.danger, color: "white",
                                    fontSize: "15px", fontWeight: 600, cursor: "pointer",
                                    transition: "all 0.2s",
                                    boxShadow: `0 4px 12px ${theme.danger}40`,
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = "translateY(-1px)";
                                    e.currentTarget.style.boxShadow = `0 6px 16px ${theme.danger}50`;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.danger}40`;
                                }}
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFeedbacks;