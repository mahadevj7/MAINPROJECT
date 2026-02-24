import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Briefcase, PlusCircle, X } from 'lucide-react';

const Counselling = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    notes: ''
  });

  const theme = {
    primary: "#1e2786ff",
    secondary: "#1c1e6cff",
    bg: "#F9FAFB",
    white: "#FFFFFF",
    text: "#1F2937",
    muted: "#6B7280",
    border: "#E5E7EB",
    danger: "#EF4444",
    success: "#10B981"
  };

  useEffect(() => {
    fetchDoctors();
    fetchMyBookings();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/counselling');
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
    }
  };

  const fetchMyBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/bookings/user', {
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      setMyBookings(data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleBookClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to book a session.");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          ...bookingData
        })
      });

      if (res.ok) {
        alert("Booking Successful!");
        setShowModal(false);
        setBookingData({ date: '', time: '', notes: '' });
        fetchMyBookings();
      } else {
        alert("Booking failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this session?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Cancelled' })
      });

      if (res.ok) {
        alert("Session cancelled successfully.");
        fetchMyBookings(); // Refresh the list
      } else {
        alert("Failed to cancel session.");
      }
    } catch (err) {
      console.error("Error cancelling session:", err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center', position: 'relative' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '10px 20px',
              background: '#1F2937',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: theme.text, marginBottom: '10px' }}>
            Mental Health Support
          </h1>
          <p style={{ color: theme.muted, fontSize: '18px' }}>
            Connect with professional counselors and take a step towards better well-being.
          </p>
        </header>

        {/* My Bookings Section */}
        {myBookings.length > 0 && (
          <section style={{ marginBottom: '50px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={24} color={theme.primary} /> Your Upcoming Sessions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {myBookings.map(booking => (
                <div key={booking._id} style={{
                  background: theme.white, padding: '20px', borderRadius: '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', borderLeft: `5px solid ${theme.success}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ fontWeight: '600', color: theme.text }}>{booking.doctor?.name}</h3>
                    <span style={{
                      fontSize: '12px',
                      background: booking.status === 'Cancelled' ? `${theme.danger}20` : `${theme.success}20`,
                      color: booking.status === 'Cancelled' ? theme.danger : theme.success,
                      padding: '4px 8px', borderRadius: '12px', height: 'fit-content'
                    }}>
                      {booking.status}
                    </span>
                  </div>
                  <p style={{ color: theme.muted, fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={14} /> {new Date(booking.date).toLocaleDateString()}
                  </p>
                  <p style={{ color: theme.muted, fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} /> {booking.time}
                  </p>

                  {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: theme.danger,
                        color: theme.white,
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.opacity = '0.9'}
                      onMouseOut={(e) => e.target.style.opacity = '1'}
                    >
                      Cancel Session
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Available Doctors Section */}
        <section>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: theme.text, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={24} color={theme.secondary} /> Available Counselors
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
            {doctors.map(doctor => (
              <div key={doctor._id} style={{
                background: theme.white, borderRadius: '20px', overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s',
                border: `1px solid ${theme.border}`
              }}>
                <div style={{ height: '120px', background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, position: 'relative' }}>
                  {doctor.image ? (
                    <img src={doctor.image} alt={doctor.name} style={{
                      width: '100px', height: '100px', borderRadius: '50%', border: '4px solid white',
                      position: 'absolute', bottom: '-50px', left: '20px', objectFit: 'cover'
                    }} />
                  ) : (
                    <div style={{
                      width: '100px', height: '100px', borderRadius: '50%', border: '4px solid white',
                      position: 'absolute', bottom: '-50px', left: '20px', background: theme.white,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 'bold', color: theme.primary
                    }}>
                      {doctor.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div style={{ padding: '60px 20px 20px 20px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.text, marginBottom: '5px' }}>{doctor.name}</h3>
                  <p style={{ color: theme.secondary, fontWeight: '500', marginBottom: '15px' }}>{doctor.specialization}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', color: theme.muted, fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={16} /> {doctor.experience} Experience
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} /> {doctor.availableDays.join(', ')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} /> {doctor.availableTime}
                    </div>
                  </div>

                  <p style={{ color: theme.muted, fontSize: '14px', fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.5' }}>
                    "{doctor.description || "Here to help you navigate through life's challenges."}"
                  </p>

                  <button
                    onClick={() => handleBookClick(doctor)}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
                      background: theme.text, color: theme.white, fontSize: '16px', fontWeight: '600',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.opacity = '0.9'}
                    onMouseOut={(e) => e.target.style.opacity = '1'}
                  >
                    <PlusCircle size={18} /> Book Session
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: theme.white, padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '500px',
            position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={24} color={theme.text} />
            </button>

            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: theme.text }}>
              Book with {selectedDoctor?.name}
            </h2>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.text }}>Date</label>
                <input
                  type="date"
                  required
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, fontSize: '16px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.text }}>Preferred Time</label>
                <input
                  type="time"
                  required
                  value={bookingData.time}
                  onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, fontSize: '16px' }}
                />
                <p style={{ fontSize: '12px', color: theme.muted, marginTop: '4px' }}>
                  Available: {selectedDoctor?.availableTime}
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: theme.text }}>Notes (Optional)</label>
                <textarea
                  placeholder="Briefly describe why you are seeking counselling..."
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, fontSize: '16px', minHeight: '100px' }}
                ></textarea>
              </div>

              <button
                type="submit"
                style={{
                  marginTop: '10px', padding: '14px', borderRadius: '12px', border: 'none',
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  color: theme.white, fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Counselling;