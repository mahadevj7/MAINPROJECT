import React, { useState, useEffect } from 'react';
import { Star, Send, MessageSquare, CheckCircle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [myFeedbacks, setMyFeedbacks] = useState([]);

    const theme = {
        primary: "#1e2786ff",
        secondary: "#1c1e6cff",
        bg: "#F9FAFB",
        white: "#FFFFFF",
        text: "#1F2937",
        muted: "#6B7280",
        border: "#E5E7EB",
        danger: "#EF4444",
        success: "#10B981",
        starActive: "#F59E0B",
        starInactive: "#D1D5DB"
    };

    useEffect(() => {
        fetchMyFeedbacks();
    }, []);

    const fetchMyFeedbacks = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch('http://localhost:5000/api/feedback/user', {
                headers: { 'x-auth-token': token }
            });
            const data = await res.json();
            setMyFeedbacks(data);
        } catch (err) {
            console.error("Error fetching feedbacks:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login to submit feedback.");
            return;
        }

        if (rating === 0) {
            alert("Please select a star rating.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ rating, subject, message })
            });

            if (res.ok) {
                setSubmitted(true);
                setRating(0);
                setSubject('');
                setMessage('');
                fetchMyFeedbacks();
                setTimeout(() => setSubmitted(false), 4000);
            } else {
                alert("Failed to submit feedback. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const getRatingLabel = (r) => {
        const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        return labels[r] || '';
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <div style={{ minHeight: '100vh', background: theme.bg, padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* Back Button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: theme.muted, fontSize: '15px', fontWeight: '500',
                        marginBottom: '24px', padding: '8px 0',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = theme.primary}
                    onMouseOut={(e) => e.currentTarget.style.color = theme.muted}
                >
                    <ArrowLeft size={18} /> Back to Dashboard
                </button>

                {/* Header */}
                <header style={{ marginBottom: '40px', textAlign: 'center' }}>
                    <div style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 20px', boxShadow: `0 12px 32px rgba(30, 39, 134, 0.3)`
                    }}>
                        <MessageSquare size={36} color="white" />
                    </div>
                    <h1 style={{ fontSize: '36px', fontWeight: '800', color: theme.text, marginBottom: '10px' }}>
                        Share Your Feedback
                    </h1>
                    <p style={{ color: theme.muted, fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>
                        Help us improve by sharing your experience. Your feedback matters to us!
                    </p>
                </header>

                {/* Success Message */}
                {submitted && (
                    <div style={{
                        background: '#ECFDF5', border: '1px solid #A7F3D0',
                        borderRadius: '16px', padding: '20px 24px',
                        display: 'flex', alignItems: 'center', gap: '14px',
                        marginBottom: '30px',
                        animation: 'fadeIn 0.4s ease'
                    }}>
                        <CheckCircle size={28} color={theme.success} />
                        <div>
                            <p style={{ fontWeight: '700', color: '#065F46', fontSize: '16px', margin: 0 }}>
                                Thank you for your feedback!
                            </p>
                            <p style={{ color: '#047857', fontSize: '14px', margin: '4px 0 0' }}>
                                We appreciate you taking the time to share your thoughts.
                            </p>
                        </div>
                    </div>
                )}

                {/* Feedback Form Card */}
                <div style={{
                    background: theme.white, borderRadius: '24px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
                    padding: '40px', marginBottom: '40px',
                    border: `1px solid ${theme.border}`
                }}>
                    <form onSubmit={handleSubmit}>
                        {/* Star Rating */}
                        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                            <label style={{
                                display: 'block', marginBottom: '16px',
                                fontWeight: '700', color: theme.text, fontSize: '18px'
                            }}>
                                How would you rate your experience?
                            </label>
                            <div style={{
                                display: 'flex', justifyContent: 'center', gap: '8px',
                                marginBottom: '10px'
                            }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            padding: '6px', borderRadius: '8px',
                                            transition: 'transform 0.2s ease, filter 0.2s ease',
                                            transform: (hoverRating >= star || rating >= star) ? 'scale(1.2)' : 'scale(1)',
                                        }}
                                    >
                                        <Star
                                            size={42}
                                            fill={(hoverRating || rating) >= star ? theme.starActive : 'none'}
                                            color={(hoverRating || rating) >= star ? theme.starActive : theme.starInactive}
                                            strokeWidth={1.5}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p style={{
                                color: (hoverRating || rating) ? theme.starActive : theme.muted,
                                fontWeight: '600', fontSize: '16px',
                                minHeight: '24px',
                                transition: 'color 0.2s'
                            }}>
                                {getRatingLabel(hoverRating || rating)}
                            </p>
                        </div>

                        {/* Subject */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block', marginBottom: '8px',
                                fontWeight: '600', color: theme.text, fontSize: '15px'
                            }}>
                                Subject
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="What is your feedback about?"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                style={{
                                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                                    border: `1.5px solid ${theme.border}`, fontSize: '16px',
                                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                                    boxSizing: 'border-box', fontFamily: "'Inter', sans-serif"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = theme.primary;
                                    e.target.style.boxShadow = `0 0 0 3px rgba(30, 39, 134, 0.1)`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = theme.border;
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {/* Message */}
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{
                                display: 'block', marginBottom: '8px',
                                fontWeight: '600', color: theme.text, fontSize: '15px'
                            }}>
                                Message
                            </label>
                            <textarea
                                required
                                placeholder="Tell us more about your experience..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={5}
                                style={{
                                    width: '100%', padding: '14px 16px', borderRadius: '12px',
                                    border: `1.5px solid ${theme.border}`, fontSize: '16px',
                                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                                    resize: 'vertical', minHeight: '120px',
                                    boxSizing: 'border-box', fontFamily: "'Inter', sans-serif"
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = theme.primary;
                                    e.target.style.boxShadow = `0 0 0 3px rgba(30, 39, 134, 0.1)`;
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = theme.border;
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '14px',
                                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                background: loading
                                    ? theme.muted
                                    : `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                                color: theme.white, fontSize: '17px', fontWeight: '700',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                transition: 'all 0.3s ease',
                                boxShadow: loading ? 'none' : `0 8px 24px rgba(30, 39, 134, 0.3)`
                            }}
                            onMouseOver={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(30, 39, 134, 0.4)';
                                }
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(30, 39, 134, 0.3)';
                            }}
                        >
                            <Send size={20} />
                            {loading ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                </div>

                {/* Previous Feedbacks */}
                {myFeedbacks.length > 0 && (
                    <section>
                        <h2 style={{
                            fontSize: '24px', fontWeight: '700', color: theme.text,
                            marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <MessageSquare size={24} color={theme.primary} /> Your Previous Feedback
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {myFeedbacks.map(fb => (
                                <div key={fb._id} style={{
                                    background: theme.white, padding: '24px', borderRadius: '16px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                                    borderLeft: `5px solid ${theme.primary}`,
                                    transition: 'transform 0.2s, box-shadow 0.2s'
                                }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)';
                                    }}
                                >
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between',
                                        alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px'
                                    }}>
                                        <h3 style={{ fontWeight: '700', color: theme.text, fontSize: '17px', margin: 0 }}>
                                            {fb.subject}
                                        </h3>
                                        <span style={{
                                            fontSize: '13px', color: theme.muted, whiteSpace: 'nowrap'
                                        }}>
                                            {formatDate(fb.createdAt)}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={18}
                                                fill={fb.rating >= star ? theme.starActive : 'none'}
                                                color={fb.rating >= star ? theme.starActive : theme.starInactive}
                                                strokeWidth={1.5}
                                            />
                                        ))}
                                        <span style={{
                                            marginLeft: '8px', fontSize: '13px', fontWeight: '600',
                                            color: theme.starActive
                                        }}>
                                            {getRatingLabel(fb.rating)}
                                        </span>
                                    </div>
                                    <p style={{
                                        color: theme.muted, fontSize: '15px', lineHeight: '1.6', margin: 0
                                    }}>
                                        {fb.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Inline animations */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default Feedback;