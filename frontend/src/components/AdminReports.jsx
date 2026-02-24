import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Shield,
    AlertTriangle,
    Users,
    TrendingUp,
    MessageSquare,
    CheckCircle,
    Calendar,
    MapPin,
    LogOut,
    Activity,
    Stethoscope,
    Heart,
    Clock,
    ArrowLeft,
    RefreshCw,
    FileText,
    BarChart3,
    XCircle,
    UserPlus,
    ShieldAlert,
    BookOpen
} from "lucide-react";

const AdminReports = () => {
    const navigate = useNavigate();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("reports");
    const [refreshing, setRefreshing] = useState(false);
    const [animatedStats, setAnimatedStats] = useState({});

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
        cyan: "#06B6D4",
        indigo: "#6366F1",
        orange: "#F97316"
    };

    // Animate numbers counting up
    useEffect(() => {
        if (reportData) {
            const targets = {
                newSosAlerts: reportData.newSosAlerts,
                newUsers: reportData.newUsers,
                casesResolved: reportData.casesResolved,
                newCommunityPosts: reportData.newCommunityPosts,
                totalCounsellingBookings: reportData.totalCounsellingBookings,
                completedBookings: reportData.completedBookings,
                activeAlerts: reportData.activeAlerts,
                locationUpdates: reportData.locationUpdates,
                totalLikes: reportData.totalLikes,
                totalComments: reportData.totalComments
            };

            const duration = 1200;
            const steps = 40;
            const interval = duration / steps;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                const progress = Math.min(step / steps, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                const current = {};
                Object.keys(targets).forEach(key => {
                    current[key] = Math.round(targets[key] * eased);
                });
                setAnimatedStats(current);

                if (step >= steps) clearInterval(timer);
            }, interval);

            return () => clearInterval(timer);
        }
    }, [reportData]);

    const fetchReports = async () => {
        try {
            setRefreshing(true);
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/auth/admin/reports", {
                headers: {
                    "Content-Type": "application/json",
                    "x-auth-token": token,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setReportData(data);
            }
        } catch (err) {
            console.error("Failed to fetch reports", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
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

        fetchReports();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    // Calculate percentages for bar chart
    const getBarWidth = (value, max) => {
        if (max === 0) return 0;
        return Math.max((value / max) * 100, 4);
    };

    const styles = {
        /* ===== Keyframe Animations via style tag ===== */
        container: {
            minHeight: "100vh",
            background: theme.bg,
            padding: "32px",
            fontFamily: "'Segoe UI', 'Inter', -apple-system, sans-serif"
        },
        sidebar: {
            width: "280px",
            background: "white",
            borderRight: "1px solid #E5E7EB",
            padding: "24px 0",
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: 0,
            height: "100vh"
        },
        logoSection: {
            padding: "0 24px 24px",
            borderBottom: "1px solid #E5E7EB"
        },
        logoContainer: {
            display: "flex",
            alignItems: "center",
            gap: "12px"
        },
        logoIcon: {
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        },
        logoTitle: {
            fontSize: "20px",
            fontWeight: 700,
            color: theme.dark,
            margin: 0
        },
        logoSubtitle: {
            fontSize: "12px",
            color: theme.light,
            margin: 0
        },
        nav: {
            flex: 1,
            padding: "24px 16px"
        },
        navButton: (isActive) => ({
            width: "100%",
            padding: "14px 16px",
            marginBottom: "8px",
            background: isActive ? `${theme.primary}15` : "transparent",
            border: "none",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            color: isActive ? theme.primary : theme.light,
            fontWeight: isActive ? 600 : 400,
            fontSize: "15px",
            transition: "all 0.2s"
        }),
        logoutButton: {
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
            fontSize: "15px"
        },
        main: {
            flex: 1,
            padding: "32px",
            overflowY: "auto"
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px"
        },
        headerTitle: {
            fontSize: "28px",
            fontWeight: 700,
            color: theme.dark,
            margin: 0
        },
        headerSubtitle: {
            fontSize: "14px",
            color: theme.light,
            margin: "4px 0 0"
        },
        headerActions: {
            display: "flex",
            alignItems: "center",
            gap: "12px"
        },
        backButton: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            cursor: "pointer",
            color: theme.dark,
            fontSize: "14px",
            fontWeight: 500,
            transition: "all 0.2s"
        },
        refreshButton: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all 0.2s"
        },
        periodBadge: {
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 14px",
            background: `${theme.primary}12`,
            borderRadius: "20px",
            color: theme.primary,
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "24px"
        },
        statsGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "28px"
        },
        statCard: (gradient, delay) => ({
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            position: "relative",
            overflow: "hidden",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            animation: `fadeSlideUp 0.5s ease ${delay}s both`
        }),
        statCardGlow: (color) => ({
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            borderRadius: "16px 16px 0 0"
        }),
        statCardHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "4px"
        },
        statLabel: {
            fontSize: "13px",
            color: theme.light,
            margin: "0 0 8px",
            fontWeight: 500
        },
        statValue: {
            fontSize: "32px",
            fontWeight: 700,
            color: theme.dark,
            margin: 0,
            letterSpacing: "-0.5px"
        },
        statIcon: (color) => ({
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color
        }),
        statFooter: (color) => ({
            fontSize: "12px",
            color: color || theme.light,
            margin: "10px 0 0",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "4px"
        }),
        chartSection: {
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "24px",
            marginBottom: "28px"
        },
        card: {
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        },
        cardTitle: {
            fontSize: "18px",
            fontWeight: 700,
            color: theme.dark,
            margin: "0 0 20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
        },
        barRow: {
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px"
        },
        barLabel: {
            fontSize: "13px",
            color: theme.dark,
            fontWeight: 500,
            width: "140px",
            flexShrink: 0
        },
        barTrack: {
            flex: 1,
            height: "28px",
            background: theme.bg,
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative"
        },
        barFill: (width, color, delay) => ({
            height: "100%",
            background: `linear-gradient(90deg, ${color}, ${color}CC)`,
            borderRadius: "8px",
            width: `${width}%`,
            transition: `width 1s ease ${delay}s`,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingRight: "8px"
        }),
        barValue: {
            fontSize: "12px",
            fontWeight: 700,
            color: "white",
            textShadow: "0 1px 2px rgba(0,0,0,0.2)"
        },
        timelineItem: (isLast) => ({
            display: "flex",
            gap: "16px",
            paddingBottom: isLast ? 0 : "20px",
            borderLeft: isLast ? "none" : `2px solid ${theme.bg}`,
            marginLeft: "11px",
            paddingLeft: "24px",
            position: "relative"
        }),
        timelineDot: (color) => ({
            position: "absolute",
            left: "-7px",
            top: "2px",
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: color,
            border: "2px solid white",
            boxShadow: `0 0 0 3px ${color}30`
        }),
        timelineContent: {
            flex: 1
        },
        timelineTitle: {
            fontSize: "14px",
            fontWeight: 600,
            color: theme.dark,
            margin: 0
        },
        timelineDesc: {
            fontSize: "12px",
            color: theme.light,
            margin: "4px 0 0"
        },
        breakdownSection: {
            marginBottom: "28px"
        },
        tableContainer: {
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            overflow: "hidden"
        },
        table: {
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0
        },
        tableHeader: {
            fontSize: "12px",
            fontWeight: 600,
            color: theme.light,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            padding: "14px 16px",
            textAlign: "left",
            borderBottom: "2px solid #F3F4F6",
            background: "#FAFAFA"
        },
        tableCell: {
            padding: "16px",
            fontSize: "14px",
            color: theme.dark,
            borderBottom: "1px solid #F3F4F6"
        },
        badge: (color) => ({
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "4px 10px",
            borderRadius: "6px",
            background: `${color}15`,
            color: color,
            fontSize: "12px",
            fontWeight: 600
        }),
        summaryCards: {
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            marginBottom: "28px"
        },
        summaryCard: (borderColor) => ({
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            borderLeft: `4px solid ${borderColor}`
        }),
        summaryTitle: {
            fontSize: "14px",
            fontWeight: 600,
            color: theme.dark,
            margin: "0 0 12px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
        },
        summaryRow: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 0",
            borderBottom: "1px solid #F3F4F6"
        },
        summaryLabel: {
            fontSize: "13px",
            color: theme.light
        },
        summaryValue: {
            fontSize: "14px",
            fontWeight: 600,
            color: theme.dark
        }
    };

    if (loading) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme.bg,
                flexDirection: "column",
                gap: "16px"
            }}>
                <style>{`
                    @keyframes spin { 
                        to { transform: rotate(360deg); } 
                    }
                `}</style>
                <div style={{
                    width: "48px",
                    height: "48px",
                    border: `4px solid ${theme.primary}30`,
                    borderTopColor: theme.primary,
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                }} />
                <p style={{ fontSize: "16px", color: theme.dark, fontWeight: 500 }}>Loading reports...</p>
            </div>
        );
    }

    const reportCards = [
        {
            label: "New SOS Alerts",
            value: animatedStats.newSosAlerts ?? 0,
            icon: <ShieldAlert size={22} />,
            color: theme.danger,
            footer: "Last 30 days",
            footerColor: theme.danger
        },
        {
            label: "New Users",
            value: animatedStats.newUsers ?? 0,
            icon: <UserPlus size={22} />,
            color: theme.primary,
            footer: "Last 30 days",
            footerColor: theme.success
        },
        {
            label: "Cases Resolved",
            value: animatedStats.casesResolved ?? 0,
            icon: <CheckCircle size={22} />,
            color: theme.success,
            footer: "Last 30 days",
            footerColor: theme.success
        },
        {
            label: "Community Posts",
            value: animatedStats.newCommunityPosts ?? 0,
            icon: <MessageSquare size={22} />,
            color: theme.info,
            footer: "Last 30 days",
            footerColor: theme.info
        },
        {
            label: "Counselling Bookings",
            value: animatedStats.totalCounsellingBookings ?? 0,
            icon: <Stethoscope size={22} />,
            color: theme.cyan,
            footer: "Last 30 days",
            footerColor: theme.cyan
        },
        {
            label: "Sessions Completed",
            value: animatedStats.completedBookings ?? 0,
            icon: <BookOpen size={22} />,
            color: theme.indigo,
            footer: "Last 30 days",
            footerColor: theme.indigo
        },
        {
            label: "Active Alerts",
            value: animatedStats.activeAlerts ?? 0,
            icon: <AlertTriangle size={22} />,
            color: theme.warning,
            footer: "Currently active",
            footerColor: theme.warning
        },
        {
            label: "Location Updates",
            value: animatedStats.locationUpdates ?? 0,
            icon: <MapPin size={22} />,
            color: theme.orange,
            footer: "Last 30 days",
            footerColor: theme.orange
        }
    ];

    // Build bar chart data
    const barChartData = reportData ? [
        { label: "SOS Alerts", value: reportData.newSosAlerts, color: theme.danger },
        { label: "New Users", value: reportData.newUsers, color: theme.primary },
        { label: "Resolved", value: reportData.casesResolved, color: theme.success },
        { label: "Posts", value: reportData.newCommunityPosts, color: theme.info },
        { label: "Bookings", value: reportData.totalCounsellingBookings, color: theme.cyan },
        { label: "Completed", value: reportData.completedBookings, color: theme.indigo }
    ] : [];

    const maxBarValue = Math.max(...barChartData.map(d => d.value), 1);

    // Build timeline events
    const timelineEvents = reportData?.recentActivity || [];

    // Build breakdown table
    const breakdownRows = reportData ? [
        { metric: "SOS Alerts Triggered", total: reportData.newSosAlerts, status: "danger", icon: <ShieldAlert size={16} /> },
        { metric: "Cases Resolved", total: reportData.casesResolved, status: "success", icon: <CheckCircle size={16} /> },
        { metric: "False Alarms", total: reportData.falseAlarms, status: "warning", icon: <XCircle size={16} /> },
        { metric: "New User Registrations", total: reportData.newUsers, status: "primary", icon: <UserPlus size={16} /> },
        { metric: "Community Posts Created", total: reportData.newCommunityPosts, status: "info", icon: <MessageSquare size={16} /> },
        { metric: "Counselling Bookings", total: reportData.totalCounsellingBookings, status: "cyan", icon: <Stethoscope size={16} /> },
        { metric: "Sessions Completed", total: reportData.completedBookings, status: "indigo", icon: <BookOpen size={16} /> },
        { metric: "Sessions Cancelled", total: reportData.cancelledBookings, status: "danger", icon: <XCircle size={16} /> },
        { metric: "Location Updates", total: reportData.locationUpdates, status: "orange", icon: <MapPin size={16} /> },
        { metric: "Community Engagement (Likes)", total: reportData.totalLikes, status: "secondary", icon: <Heart size={16} /> },
        { metric: "Community Engagement (Comments)", total: reportData.totalComments, status: "info", icon: <MessageSquare size={16} /> }
    ] : [];

    const statusColors = {
        danger: theme.danger,
        success: theme.success,
        warning: theme.warning,
        primary: theme.primary,
        info: theme.info,
        cyan: theme.cyan,
        indigo: theme.indigo,
        orange: theme.orange,
        secondary: theme.secondary
    };

    return (
        <div style={styles.container}>
            {/* Inject keyframe animations */}
            <style>{`
                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .report-stat-card:hover {
                    transform: translateY(-4px) !important;
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1) !important;
                }
                .report-bar-row:hover {
                    background: #F9FAFB;
                    border-radius: 8px;
                }
                .report-table-row:hover {
                    background: #FAFBFF !important;
                }
                .report-refresh-btn:hover {
                    opacity: 0.9;
                    transform: scale(1.02);
                }
                .report-back-btn:hover {
                    background: #F9FAFB !important;
                    border-color: #D1D5DB !important;
                }
                .report-summary-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important;
                    transition: all 0.3s ease;
                }
            `}</style>

            {/* Main Content */}
            <div>
                {/* Header */}
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.headerTitle}>
                            <BarChart3 size={28} style={{ verticalAlign: "middle", marginRight: "10px", color: theme.primary }} />
                            Reports & Analytics
                        </h1>
                        <p style={styles.headerSubtitle}>
                            Comprehensive overview of SafeHer platform activity
                        </p>
                    </div>
                    <div style={styles.headerActions}>
                        <button
                            className="report-back-btn"
                            onClick={() => navigate("/admin")}
                            style={styles.backButton}
                        >
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </button>
                        <button
                            className="report-refresh-btn"
                            onClick={fetchReports}
                            style={styles.refreshButton}
                            disabled={refreshing}
                        >
                            <RefreshCw size={16} style={{
                                animation: refreshing ? "spin 0.8s linear infinite" : "none"
                            }} />
                            {refreshing ? "Refreshing..." : "Refresh Data"}
                        </button>
                    </div>
                </header>

                {/* Period Badge */}
                <div style={styles.periodBadge}>
                    <Calendar size={14} />
                    Reporting Period: Last 30 Days
                </div>

                {/* Stats Grid — 8 Cards */}
                <div style={styles.statsGrid}>
                    {reportCards.map((card, index) => (
                        <div
                            key={index}
                            className="report-stat-card"
                            style={styles.statCard(card.color, index * 0.08)}
                        >
                            <div style={styles.statCardGlow(card.color)} />
                            <div style={styles.statCardHeader}>
                                <div>
                                    <p style={styles.statLabel}>{card.label}</p>
                                    <h2 style={styles.statValue}>{card.value}</h2>
                                </div>
                                <div style={styles.statIcon(card.color)}>
                                    {card.icon}
                                </div>
                            </div>
                            <p style={styles.statFooter(card.footerColor)}>
                                <Clock size={11} />
                                {card.footer}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Summary Row */}
                <div style={styles.summaryCards}>
                    {/* Alert Breakdown */}
                    <div className="report-summary-card" style={styles.summaryCard(theme.danger)}>
                        <p style={styles.summaryTitle}>
                            <AlertTriangle size={16} color={theme.danger} />
                            Alert Breakdown
                        </p>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>Active Alerts</span>
                            <span style={styles.summaryValue}>{reportData?.activeAlerts || 0}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>Resolved</span>
                            <span style={styles.summaryValue}>{reportData?.casesResolved || 0}</span>
                        </div>
                        <div style={{ ...styles.summaryRow, borderBottom: "none" }}>
                            <span style={styles.summaryLabel}>False Alarms</span>
                            <span style={styles.summaryValue}>{reportData?.falseAlarms || 0}</span>
                        </div>
                    </div>

                    {/* Counselling Status */}
                    <div className="report-summary-card" style={styles.summaryCard(theme.cyan)}>
                        <p style={styles.summaryTitle}>
                            <Stethoscope size={16} color={theme.cyan} />
                            Counselling Status
                        </p>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>Pending</span>
                            <span style={styles.summaryValue}>{reportData?.pendingBookings || 0}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>Confirmed</span>
                            <span style={styles.summaryValue}>{reportData?.confirmedBookings || 0}</span>
                        </div>
                        <div style={{ ...styles.summaryRow, borderBottom: "none" }}>
                            <span style={styles.summaryLabel}>Cancelled</span>
                            <span style={styles.summaryValue}>{reportData?.cancelledBookings || 0}</span>
                        </div>
                    </div>

                    {/* Community Engagement */}
                    <div className="report-summary-card" style={styles.summaryCard(theme.info)}>
                        <p style={styles.summaryTitle}>
                            <Heart size={16} color={theme.info} />
                            Community Engagement
                        </p>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>Total Posts</span>
                            <span style={styles.summaryValue}>{reportData?.newCommunityPosts || 0}</span>
                        </div>
                        <div style={styles.summaryRow}>
                            <span style={styles.summaryLabel}>Total Likes</span>
                            <span style={styles.summaryValue}>{reportData?.totalLikes || 0}</span>
                        </div>
                        <div style={{ ...styles.summaryRow, borderBottom: "none" }}>
                            <span style={styles.summaryLabel}>Total Comments</span>
                            <span style={styles.summaryValue}>{reportData?.totalComments || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Chart + Timeline */}
                <div style={styles.chartSection}>
                    {/* Bar Chart */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>
                            <BarChart3 size={20} color={theme.primary} />
                            Activity Overview
                        </h3>
                        {barChartData.map((item, index) => (
                            <div key={index} className="report-bar-row" style={styles.barRow}>
                                <span style={styles.barLabel}>{item.label}</span>
                                <div style={styles.barTrack}>
                                    <div style={styles.barFill(
                                        getBarWidth(item.value, maxBarValue),
                                        item.color,
                                        index * 0.15
                                    )}>
                                        <span style={styles.barValue}>
                                            {item.value > 0 ? item.value : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent Activity Timeline */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>
                            <Clock size={20} color={theme.secondary} />
                            Recent Activity
                        </h3>
                        {timelineEvents.length === 0 ? (
                            <p style={{ fontSize: "14px", color: theme.light, textAlign: "center", padding: "40px 0" }}>
                                No recent activity to display
                            </p>
                        ) : (
                            <div style={{ paddingTop: "8px" }}>
                                {timelineEvents.map((event, index) => (
                                    <div key={index} style={styles.timelineItem(index === timelineEvents.length - 1)}>
                                        <div style={styles.timelineDot(
                                            event.type === "sos" ? theme.danger :
                                                event.type === "user" ? theme.primary :
                                                    event.type === "resolved" ? theme.success :
                                                        event.type === "post" ? theme.info :
                                                            event.type === "booking" ? theme.cyan :
                                                                theme.light
                                        )} />
                                        <div style={styles.timelineContent}>
                                            <p style={styles.timelineTitle}>{event.title}</p>
                                            <p style={styles.timelineDesc}>{event.description}</p>
                                            <p style={{ fontSize: "11px", color: theme.light, margin: "4px 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                                                <Clock size={10} />
                                                {new Date(event.time).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detailed Breakdown Table */}
                <div style={styles.breakdownSection}>
                    <div style={styles.tableContainer}>
                        <h3 style={styles.cardTitle}>
                            <FileText size={20} color={theme.dark} />
                            Detailed Breakdown
                        </h3>
                        <div style={{ overflowX: "auto" }}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.tableHeader}>Metric</th>
                                        <th style={{ ...styles.tableHeader, textAlign: "center" }}>Count (30 Days)</th>
                                        <th style={{ ...styles.tableHeader, textAlign: "center" }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {breakdownRows.map((row, index) => (
                                        <tr key={index} className="report-table-row" style={{ transition: "background 0.2s" }}>
                                            <td style={styles.tableCell}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <span style={{ color: statusColors[row.status] }}>{row.icon}</span>
                                                    <span style={{ fontWeight: 500 }}>{row.metric}</span>
                                                </div>
                                            </td>
                                            <td style={{ ...styles.tableCell, textAlign: "center", fontWeight: 700, fontSize: "16px" }}>
                                                {row.total}
                                            </td>
                                            <td style={{ ...styles.tableCell, textAlign: "center" }}>
                                                <span style={styles.badge(statusColors[row.status])}>
                                                    {row.total > 0 ? "Recorded" : "None"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    textAlign: "center",
                    padding: "20px 0",
                    color: theme.light,
                    fontSize: "13px"
                }}>
                    <p style={{ margin: 0 }}>
                        Report generated on {new Date().toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        })} • SafeHer Admin Panel
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;