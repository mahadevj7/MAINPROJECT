import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Stethoscope,
    Plus,
    Pencil,
    Trash2,
    CalendarDays,
    Clock,
    Phone,
    Briefcase,
    X,
    Upload,
    UserCircle,
    Users,
    CheckCircle,
    AlertTriangle,
    FileText
} from 'lucide-react';

const ManageCounselling = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        experience: '',
        availableDays: '',
        availableTime: '',
        contactNumber: '',
        description: '',
        image: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [currentDoctorId, setCurrentDoctorId] = useState(null);
    const [viewingBookings, setViewingBookings] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

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
        white: "#FFFFFF",
        border: "#E5E7EB"
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/counselling');
            const data = await res.json();
            setDoctors(data);
        } catch (err) {
            console.error(err);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            const url = isEditing
                ? `http://localhost:5000/api/counselling/${currentDoctorId}`
                : 'http://localhost:5000/api/counselling';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    availableDays: Array.isArray(formData.availableDays)
                        ? formData.availableDays
                        : formData.availableDays.split(',').map(day => day.trim())
                })
            });

            if (response.ok) {
                fetchDoctors();
                resetForm();
                alert(isEditing ? 'Doctor updated successfully' : 'Doctor added successfully');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteClick = (id) => {
        setDeletingId(id);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/counselling/${deletingId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchDoctors();
                setShowDeleteModal(false);
                setDeletingId(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = (doctor) => {
        setIsEditing(true);
        setCurrentDoctorId(doctor._id);
        setFormData({
            name: doctor.name,
            specialization: doctor.specialization,
            experience: doctor.experience,
            availableDays: doctor.availableDays.join(', '),
            availableTime: doctor.availableTime,
            contactNumber: doctor.contactNumber,
            description: doctor.description || '',
            image: doctor.image || ''
        });
        setShowForm(true);
    };

    const handleViewBookings = async (doctor) => {
        setViewingBookings(doctor);
        setLoadingBookings(true);
        try {
            const res = await fetch(`http://localhost:5000/api/bookings/doctor/${doctor._id}`);
            const data = await res.json();
            setBookings(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingBookings(false);
        }
    };

    const closeViewBookings = () => {
        setViewingBookings(null);
        setBookings([]);
    };

    const handleStatusChange = async (bookingId, newStatus) => {
        try {
            const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setBookings(bookings.map(book =>
                    book._id === bookingId ? { ...book, status: newStatus } : book
                ));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentDoctorId(null);
        setShowForm(false);
        setFormData({
            name: '',
            specialization: '',
            experience: '',
            availableDays: '',
            availableTime: '',
            contactNumber: '',
            description: '',
            image: ''
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, image: reader.result });
        };
        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed': return theme.success;
            case 'Cancelled': return theme.danger;
            case 'Completed': return theme.info;
            default: return theme.warning;
        }
    };

    const totalBookingsCount = doctors.length;

    return (
        <div style={{
            minHeight: "100vh",
            background: theme.bg,
            fontFamily: '"Inter", "DM Sans", sans-serif',
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
                        onClick={() => navigate('/admin')}
                        style={{
                            background: theme.white,
                            border: `1px solid ${theme.border}`,
                            borderRadius: "12px",
                            padding: "10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.dark,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            transition: "all 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = theme.bg}
                        onMouseOut={(e) => e.currentTarget.style.background = theme.white}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{
                            fontSize: "28px", fontWeight: 700, color: theme.dark, margin: 0,
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                            <Stethoscope color={theme.primary} /> Manage Counselling
                        </h1>
                        <p style={{ fontSize: "14px", color: theme.light, margin: "4px 0 0" }}>
                            Add and manage doctors available for user sessions
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => { setShowForm(true); setIsEditing(false); }}
                    style={{
                        padding: "12px 24px",
                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                        color: theme.white,
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        transition: "all 0.2s",
                        boxShadow: `0 4px 12px ${theme.primary}40`
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = `0 6px 20px ${theme.primary}50`;
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = `0 4px 12px ${theme.primary}40`;
                    }}
                >
                    <Plus size={18} /> Add Doctor
                </button>
            </header>

            {/* Stats Row */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "24px",
                marginBottom: "32px"
            }}>
                <div style={{
                    background: theme.white,
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ fontSize: "14px", color: theme.light, margin: "0 0 8px" }}>Total Doctors</p>
                            <h2 style={{ fontSize: "32px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                                {doctors.length}
                            </h2>
                        </div>
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "12px",
                            background: `${theme.primary}15`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: theme.primary,
                        }}>
                            <Stethoscope size={24} />
                        </div>
                    </div>
                    <p style={{ fontSize: "12px", color: theme.light, margin: "12px 0 0", fontWeight: 500 }}>
                        Registered counsellors
                    </p>
                </div>

                <div style={{
                    background: theme.white,
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ fontSize: "14px", color: theme.light, margin: "0 0 8px" }}>Specializations</p>
                            <h2 style={{ fontSize: "32px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                                {[...new Set(doctors.map(d => d.specialization))].length}
                            </h2>
                        </div>
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "12px",
                            background: `${theme.success}15`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: theme.success,
                        }}>
                            <Briefcase size={24} />
                        </div>
                    </div>
                    <p style={{ fontSize: "12px", color: theme.light, margin: "12px 0 0", fontWeight: 500 }}>
                        Unique fields covered
                    </p>
                </div>

                <div style={{
                    background: theme.white,
                    borderRadius: "16px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <p style={{ fontSize: "14px", color: theme.light, margin: "0 0 8px" }}>Available Today</p>
                            <h2 style={{ fontSize: "32px", fontWeight: 700, color: theme.dark, margin: 0 }}>
                                {doctors.filter(d => {
                                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                                    return d.availableDays?.some(day =>
                                        day.toLowerCase().includes(today.toLowerCase())
                                    );
                                }).length}
                            </h2>
                        </div>
                        <div style={{
                            width: "48px", height: "48px", borderRadius: "12px",
                            background: `${theme.warning}15`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: theme.warning,
                        }}>
                            <CalendarDays size={24} />
                        </div>
                    </div>
                    <p style={{ fontSize: "12px", color: theme.light, margin: "12px 0 0", fontWeight: 500 }}>
                        Doctors available now
                    </p>
                </div>
            </div>

            {/* Doctors List */}
            <div style={{
                background: theme.white,
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}>
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginBottom: "20px"
                }}>
                    <h3 style={{
                        fontSize: "18px", fontWeight: 700, color: theme.dark, margin: 0,
                        display: "flex", alignItems: "center", gap: "8px"
                    }}>
                        <Users size={20} color={theme.primary} />
                        All Doctors
                        <span style={{
                            fontSize: "13px", fontWeight: 600,
                            background: `${theme.primary}15`,
                            color: theme.primary,
                            padding: "2px 10px",
                            borderRadius: "20px",
                            marginLeft: "4px"
                        }}>
                            {doctors.length}
                        </span>
                    </h3>
                </div>

                {doctors.length === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "60px 20px",
                        color: theme.light
                    }}>
                        <Stethoscope size={56} style={{ opacity: 0.15, marginBottom: "16px" }} />
                        <h4 style={{ color: theme.light, margin: "0 0 8px", fontWeight: 600 }}>No doctors added yet</h4>
                        <p style={{ color: "#9CA3AF", fontSize: "14px", margin: 0 }}>
                            Click "Add Doctor" to register a new counsellor.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {doctors.map(doctor => (
                            <div
                                key={doctor._id}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "16px",
                                    padding: "20px",
                                    borderRadius: "14px",
                                    border: `1px solid ${theme.border}`,
                                    transition: "all 0.2s",
                                    cursor: "default"
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.borderColor = `${theme.primary}40`;
                                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.borderColor = theme.border;
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                {/* Avatar / Image */}
                                {doctor.image ? (
                                    <img
                                        src={doctor.image}
                                        alt={doctor.name}
                                        style={{
                                            width: "72px", height: "72px",
                                            borderRadius: "14px", objectFit: "cover",
                                            flexShrink: 0
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: "72px", height: "72px", borderRadius: "14px",
                                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: theme.white, fontSize: "28px", fontWeight: 700,
                                        flexShrink: 0
                                    }}>
                                        {doctor.name.charAt(0)}
                                    </div>
                                )}

                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                                        <h4 style={{
                                            fontSize: "16px", fontWeight: 700,
                                            color: theme.dark, margin: 0
                                        }}>
                                            {doctor.name}
                                        </h4>
                                        <span style={{
                                            fontSize: "12px", fontWeight: 600,
                                            color: theme.primary,
                                            background: `${theme.primary}12`,
                                            padding: "2px 10px",
                                            borderRadius: "20px"
                                        }}>
                                            {doctor.specialization}
                                        </span>
                                    </div>

                                    {doctor.description && (
                                        <p style={{
                                            fontSize: "13px", color: theme.light,
                                            margin: "4px 0 12px", lineHeight: "1.5",
                                            overflow: "hidden", textOverflow: "ellipsis",
                                            display: "-webkit-box", WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical"
                                        }}>
                                            {doctor.description}
                                        </p>
                                    )}

                                    <div style={{
                                        display: "flex", flexWrap: "wrap", gap: "16px",
                                        marginTop: doctor.description ? "0" : "10px"
                                    }}>
                                        <span style={{
                                            fontSize: "13px", color: theme.light,
                                            display: "flex", alignItems: "center", gap: "5px"
                                        }}>
                                            <Briefcase size={14} color={theme.light} />
                                            {doctor.experience}
                                        </span>
                                        <span style={{
                                            fontSize: "13px", color: theme.light,
                                            display: "flex", alignItems: "center", gap: "5px"
                                        }}>
                                            <Phone size={14} color={theme.light} />
                                            {doctor.contactNumber}
                                        </span>
                                        <span style={{
                                            fontSize: "13px", color: theme.light,
                                            display: "flex", alignItems: "center", gap: "5px"
                                        }}>
                                            <Clock size={14} color={theme.light} />
                                            {doctor.availableTime}
                                        </span>
                                        <span style={{
                                            fontSize: "13px", color: theme.light,
                                            display: "flex", alignItems: "center", gap: "5px"
                                        }}>
                                            <CalendarDays size={14} color={theme.light} />
                                            {doctor.availableDays.join(', ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{
                                    display: "flex", gap: "8px", flexShrink: 0,
                                    alignItems: "flex-start"
                                }}>
                                    <button
                                        onClick={() => handleViewBookings(doctor)}
                                        title="View Bookings"
                                        style={{
                                            background: `${theme.info}10`,
                                            border: "none", borderRadius: "10px",
                                            padding: "10px", cursor: "pointer",
                                            color: theme.info,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = theme.info;
                                            e.currentTarget.style.color = theme.white;
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = `${theme.info}10`;
                                            e.currentTarget.style.color = theme.info;
                                        }}
                                    >
                                        <FileText size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(doctor)}
                                        title="Edit Doctor"
                                        style={{
                                            background: `${theme.warning}10`,
                                            border: "none", borderRadius: "10px",
                                            padding: "10px", cursor: "pointer",
                                            color: theme.warning,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = theme.warning;
                                            e.currentTarget.style.color = theme.white;
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = `${theme.warning}10`;
                                            e.currentTarget.style.color = theme.warning;
                                        }}
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(doctor._id)}
                                        title="Delete Doctor"
                                        style={{
                                            background: `${theme.danger}10`,
                                            border: "none", borderRadius: "10px",
                                            padding: "10px", cursor: "pointer",
                                            color: theme.danger,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = theme.danger;
                                            e.currentTarget.style.color = theme.white;
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = `${theme.danger}10`;
                                            e.currentTarget.style.color = theme.danger;
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add / Edit Doctor Modal */}
            {showForm && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 2000, padding: "20px"
                }}>
                    <div style={{
                        background: theme.white, borderRadius: "20px", padding: "32px",
                        maxWidth: "520px", width: "100%", maxHeight: "90vh", overflowY: "auto",
                        boxShadow: "0 24px 48px rgba(0,0,0,0.15)", position: "relative"
                    }}>
                        <button
                            onClick={resetForm}
                            style={{
                                position: "absolute", top: "20px", right: "20px",
                                background: theme.bg, border: "none", borderRadius: "10px",
                                padding: "8px", cursor: "pointer", color: theme.light,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = "#E5E7EB"; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = theme.bg; }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ marginBottom: "24px" }}>
                            <h2 style={{
                                fontSize: "22px", fontWeight: 700, color: theme.dark,
                                margin: "0 0 6px", display: "flex", alignItems: "center", gap: "10px"
                            }}>
                                {isEditing ? <Pencil size={22} color={theme.primary} /> : <Plus size={22} color={theme.primary} />}
                                {isEditing ? 'Edit Doctor' : 'Add New Doctor'}
                            </h2>
                            <p style={{ fontSize: "14px", color: theme.light, margin: 0 }}>
                                {isEditing ? 'Update the doctor\'s information below.' : 'Fill in the details to register a new counsellor.'}
                            </p>
                        </div>

                        <form onSubmit={onSubmit}>
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{
                                    display: "block", fontSize: "13px", fontWeight: 600,
                                    color: theme.dark, marginBottom: "6px"
                                }}>Full Name</label>
                                <input
                                    style={{
                                        width: "100%", padding: "12px 14px", borderRadius: "12px",
                                        border: `1px solid ${theme.border}`, outline: "none",
                                        fontSize: "14px", color: theme.dark,
                                        transition: "border-color 0.2s", boxSizing: "border-box",
                                        fontFamily: "inherit"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                                    onBlur={(e) => e.target.style.borderColor = theme.border}
                                    type="text"
                                    placeholder="e.g. Dr. Sarah Wilson"
                                    name="name"
                                    value={formData.name}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                                <div>
                                    <label style={{
                                        display: "block", fontSize: "13px", fontWeight: 600,
                                        color: theme.dark, marginBottom: "6px"
                                    }}>Specialization</label>
                                    <input
                                        style={{
                                            width: "100%", padding: "12px 14px", borderRadius: "12px",
                                            border: `1px solid ${theme.border}`, outline: "none",
                                            fontSize: "14px", color: theme.dark,
                                            transition: "border-color 0.2s", boxSizing: "border-box",
                                            fontFamily: "inherit"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = theme.primary}
                                        onBlur={(e) => e.target.style.borderColor = theme.border}
                                        type="text"
                                        placeholder="e.g. Psychologist"
                                        name="specialization"
                                        value={formData.specialization}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: "block", fontSize: "13px", fontWeight: 600,
                                        color: theme.dark, marginBottom: "6px"
                                    }}>Experience</label>
                                    <input
                                        style={{
                                            width: "100%", padding: "12px 14px", borderRadius: "12px",
                                            border: `1px solid ${theme.border}`, outline: "none",
                                            fontSize: "14px", color: theme.dark,
                                            transition: "border-color 0.2s", boxSizing: "border-box",
                                            fontFamily: "inherit"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = theme.primary}
                                        onBlur={(e) => e.target.style.borderColor = theme.border}
                                        type="text"
                                        placeholder="e.g. 8 years"
                                        name="experience"
                                        value={formData.experience}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{
                                    display: "block", fontSize: "13px", fontWeight: 600,
                                    color: theme.dark, marginBottom: "6px"
                                }}>Available Days</label>
                                <input
                                    style={{
                                        width: "100%", padding: "12px 14px", borderRadius: "12px",
                                        border: `1px solid ${theme.border}`, outline: "none",
                                        fontSize: "14px", color: theme.dark,
                                        transition: "border-color 0.2s", boxSizing: "border-box",
                                        fontFamily: "inherit"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                                    onBlur={(e) => e.target.style.borderColor = theme.border}
                                    type="text"
                                    placeholder="e.g. Monday, Wednesday, Friday"
                                    name="availableDays"
                                    value={formData.availableDays}
                                    onChange={onChange}
                                    required
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                                <div>
                                    <label style={{
                                        display: "block", fontSize: "13px", fontWeight: 600,
                                        color: theme.dark, marginBottom: "6px"
                                    }}>Available Time</label>
                                    <input
                                        style={{
                                            width: "100%", padding: "12px 14px", borderRadius: "12px",
                                            border: `1px solid ${theme.border}`, outline: "none",
                                            fontSize: "14px", color: theme.dark,
                                            transition: "border-color 0.2s", boxSizing: "border-box",
                                            fontFamily: "inherit"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = theme.primary}
                                        onBlur={(e) => e.target.style.borderColor = theme.border}
                                        type="text"
                                        placeholder="e.g. 10:00 AM - 4:00 PM"
                                        name="availableTime"
                                        value={formData.availableTime}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: "block", fontSize: "13px", fontWeight: 600,
                                        color: theme.dark, marginBottom: "6px"
                                    }}>Contact Number</label>
                                    <input
                                        style={{
                                            width: "100%", padding: "12px 14px", borderRadius: "12px",
                                            border: `1px solid ${theme.border}`, outline: "none",
                                            fontSize: "14px", color: theme.dark,
                                            transition: "border-color 0.2s", boxSizing: "border-box",
                                            fontFamily: "inherit"
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = theme.primary}
                                        onBlur={(e) => e.target.style.borderColor = theme.border}
                                        type="text"
                                        placeholder="e.g. +1 234 567 890"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{
                                    display: "block", fontSize: "13px", fontWeight: 600,
                                    color: theme.dark, marginBottom: "6px"
                                }}>Description</label>
                                <textarea
                                    style={{
                                        width: "100%", padding: "12px 14px", borderRadius: "12px",
                                        border: `1px solid ${theme.border}`, outline: "none",
                                        fontSize: "14px", color: theme.dark, minHeight: "80px",
                                        resize: "vertical", boxSizing: "border-box",
                                        fontFamily: "inherit", transition: "border-color 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = theme.primary}
                                    onBlur={(e) => e.target.style.borderColor = theme.border}
                                    placeholder="Brief description about the doctor..."
                                    name="description"
                                    value={formData.description}
                                    onChange={onChange}
                                ></textarea>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{
                                    display: "block", fontSize: "13px", fontWeight: 600,
                                    color: theme.dark, marginBottom: "6px"
                                }}>Profile Image</label>
                                <div style={{
                                    border: `2px dashed ${theme.border}`,
                                    borderRadius: "12px", padding: "20px",
                                    textAlign: "center", cursor: "pointer",
                                    transition: "border-color 0.2s",
                                    position: "relative"
                                }}
                                    onMouseOver={(e) => e.currentTarget.style.borderColor = theme.primary}
                                    onMouseOut={(e) => e.currentTarget.style.borderColor = theme.border}
                                >
                                    <input
                                        type="file"
                                        onChange={handleImageUpload}
                                        style={{
                                            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                                            opacity: 0, cursor: "pointer"
                                        }}
                                        accept="image/*"
                                    />
                                    {formData.image ? (
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            style={{
                                                width: "100%", height: "160px",
                                                objectFit: "cover", borderRadius: "8px"
                                            }}
                                        />
                                    ) : (
                                        <div>
                                            <Upload size={28} color={theme.light} style={{ marginBottom: "8px" }} />
                                            <p style={{ fontSize: "13px", color: theme.light, margin: 0 }}>
                                                Click or drag to upload an image
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    style={{
                                        flex: 1, padding: "14px",
                                        borderRadius: "12px", border: `1px solid ${theme.border}`,
                                        background: theme.white, color: theme.dark,
                                        fontSize: "15px", fontWeight: 600, cursor: "pointer",
                                        transition: "background 0.2s", fontFamily: "inherit"
                                    }}
                                    onMouseOver={(e) => e.target.style.background = "#F9FAFB"}
                                    onMouseOut={(e) => e.target.style.background = theme.white}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 1, padding: "14px",
                                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                        color: theme.white, border: "none",
                                        borderRadius: "12px", fontSize: "15px",
                                        fontWeight: 600, cursor: "pointer",
                                        transition: "all 0.2s", fontFamily: "inherit",
                                        boxShadow: `0 4px 12px ${theme.primary}40`,
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                        e.currentTarget.style.boxShadow = `0 6px 16px ${theme.primary}50`;
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${theme.primary}40`;
                                    }}
                                >
                                    {isEditing ? <><Pencil size={16} /> Update Doctor</> : <><Plus size={16} /> Add Doctor</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Bookings Modal */}
            {viewingBookings && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 2000, padding: "20px"
                }}>
                    <div style={{
                        background: theme.white, borderRadius: "20px", padding: "32px",
                        width: "90%", maxWidth: "600px", maxHeight: "85vh", overflowY: "auto",
                        boxShadow: "0 24px 48px rgba(0,0,0,0.15)", position: "relative"
                    }}>
                        <button
                            onClick={closeViewBookings}
                            style={{
                                position: "absolute", top: "20px", right: "20px",
                                background: theme.bg, border: "none", borderRadius: "10px",
                                padding: "8px", cursor: "pointer", color: theme.light,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.2s"
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = "#E5E7EB"; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = theme.bg; }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ marginBottom: "24px" }}>
                            <h2 style={{
                                fontSize: "22px", fontWeight: 700, color: theme.dark,
                                margin: "0 0 6px", display: "flex", alignItems: "center", gap: "10px"
                            }}>
                                <FileText size={22} color={theme.primary} />
                                Bookings
                            </h2>
                            <p style={{ fontSize: "14px", color: theme.light, margin: 0 }}>
                                Appointments for <strong style={{ color: theme.dark }}>{viewingBookings.name}</strong>
                            </p>
                        </div>

                        {loadingBookings ? (
                            <div style={{ textAlign: "center", padding: "40px", color: theme.light }}>
                                Loading bookings...
                            </div>
                        ) : bookings.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {bookings.map(booking => (
                                    <div
                                        key={booking._id}
                                        style={{
                                            padding: "18px", borderRadius: "14px",
                                            background: theme.bg,
                                            border: `1px solid ${theme.border}`,
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        <div style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "center", marginBottom: "10px"
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{
                                                    width: "36px", height: "36px", borderRadius: "10px",
                                                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    color: theme.white, fontSize: "14px", fontWeight: 700
                                                }}>
                                                    {booking.user?.name?.charAt(0)?.toUpperCase() || "?"}
                                                </div>
                                                <div>
                                                    <span style={{
                                                        fontWeight: 600, color: theme.dark, fontSize: "14px"
                                                    }}>
                                                        {booking.user?.name || 'Unknown User'}
                                                    </span>
                                                    <p style={{ fontSize: "12px", color: theme.light, margin: "2px 0 0" }}>
                                                        {booking.user?.email || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <select
                                                value={booking.status}
                                                onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                                                style={{
                                                    padding: "6px 12px",
                                                    borderRadius: "8px",
                                                    border: `1px solid ${theme.border}`,
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: getStatusColor(booking.status),
                                                    cursor: "pointer",
                                                    backgroundColor: `${getStatusColor(booking.status)}10`,
                                                    fontFamily: "inherit",
                                                    outline: "none"
                                                }}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Cancelled">Cancelled</option>
                                            </select>
                                        </div>

                                        <div style={{
                                            display: "flex", gap: "16px", fontSize: "13px",
                                            color: theme.light
                                        }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <CalendarDays size={14} />
                                                {new Date(booking.date).toLocaleDateString()}
                                            </span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                                <Clock size={14} />
                                                {booking.time}
                                            </span>
                                        </div>

                                        {booking.notes && (
                                            <div style={{
                                                fontSize: "13px", color: theme.dark,
                                                fontStyle: "italic", background: theme.white,
                                                padding: "10px 14px", borderRadius: "10px",
                                                marginTop: "10px", lineHeight: "1.5"
                                            }}>
                                                "{booking.notes}"
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                textAlign: "center", padding: "50px 20px", color: theme.light
                            }}>
                                <FileText size={48} style={{ opacity: 0.15, marginBottom: "12px" }} />
                                <p style={{ margin: 0, fontWeight: 500 }}>No bookings found for this doctor.</p>
                            </div>
                        )}
                    </div>
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
                        background: theme.white, borderRadius: "24px", padding: "40px",
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

                        <h2 style={{
                            fontSize: "22px", fontWeight: 700, color: theme.dark, marginBottom: "12px"
                        }}>
                            Delete Doctor?
                        </h2>
                        <p style={{
                            fontSize: "15px", color: theme.light, marginBottom: "32px",
                            lineHeight: "1.5"
                        }}>
                            This action cannot be undone. The doctor's profile and all related data will be permanently removed.
                        </p>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                onClick={() => { setShowDeleteModal(false); setDeletingId(null); }}
                                style={{
                                    flex: 1, padding: "14px 24px",
                                    borderRadius: "12px", border: `1px solid ${theme.border}`,
                                    background: theme.white, color: theme.dark,
                                    fontSize: "15px", fontWeight: 600, cursor: "pointer",
                                    transition: "background 0.2s", fontFamily: "inherit"
                                }}
                                onMouseOver={(e) => e.target.style.background = "#F9FAFB"}
                                onMouseOut={(e) => e.target.style.background = theme.white}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                style={{
                                    flex: 1, padding: "14px 24px",
                                    borderRadius: "12px", border: "none",
                                    background: theme.danger, color: theme.white,
                                    fontSize: "15px", fontWeight: 600, cursor: "pointer",
                                    transition: "all 0.2s", fontFamily: "inherit",
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
}

export default ManageCounselling;