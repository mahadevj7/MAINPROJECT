import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, Phone, MapPin, Users, Heart, Lock, ChevronRight, HeartHandshake } from 'lucide-react';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user'  // Default to 'user'
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  // --- Validation Helpers ---
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (!/^[A-Za-z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Phone number is required';
    if (!/^\d+$/.test(phone)) return 'Phone number must contain only digits';
    if (!/^[6-9]/.test(phone)) return 'Phone number must start with 6, 7, 8, or 9';
    if (phone.length !== 10) return 'Phone number must be exactly 10 digits';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleInputChange = (field, value) => {
    // For name: block non-letter characters (allow spaces)
    if (field === 'name') {
      value = value.replace(/[^A-Za-z\s]/g, '');
    }
    // For phone: block non-digit characters, limit to 10 digits
    if (field === 'phone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData({ ...formData, [field]: value });

    // Clear the error as the user types (validate on blur instead)
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
  };

  const handleInputBlur = (field) => {
    let error = '';
    switch (field) {
      case 'name': error = validateName(formData.name); break;
      case 'email': error = validateEmail(formData.email); break;
      case 'phone': error = validatePhone(formData.phone); break;
      case 'password': error = validatePassword(formData.password); break;
      default: break;
    }
    setFormErrors({ ...formErrors, [field]: error });
  };

  const errorStyle = {
    color: '#ef4444',
    fontSize: '13px',
    marginTop: '4px',
    marginLeft: '4px',
    fontWeight: 500
  };

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
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // Start at 440Hz

    // Modulate frequency to create siren effect
    const now = audioCtx.currentTime;
    for (let i = 0; i < 10; i++) { // Siren details
      oscillator.frequency.linearRampToValueAtTime(880, now + i * 2 + 1); // High pitch
      oscillator.frequency.linearRampToValueAtTime(440, now + i * 2 + 2); // Low pitch
    }

    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 20); // Fade out after 20 seconds

    oscillator.start(now);
    oscillator.stop(now + 20);
  };

  /* SOS Timer State */
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);

  const triggerSOS = async () => {
    // 1. Play Siren immediately
    playSiren();

    if (!isAuthenticated) {
      alert('Sending emergency alert... (Please login for full features)');
      // In a real app, we might still send an anonymous alert with location
    }

    // 2. Client-side User Feedback
    alert('SOS ALERT ACTIVATED! Sending your location and details to emergency contacts...');

    try {
      // 3. Fetch User's Public IP
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const userIp = ipData.ip;

      // 4. Get Current Location (Optional but recommended)
      navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };

        // 5. Send Alert to Backend
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
        // Send without location if geolocation fails
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

  React.useEffect(() => {
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

  const handleAuth = async (e) => {
    e.preventDefault();

    // --- Full Validation ---
    const errors = {
      name: '',
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      phone: ''
    };

    if (authMode === 'signup') {
      errors.name = validateName(formData.name);
      errors.phone = validatePhone(formData.phone);
    }

    setFormErrors(errors);

    // Check if any errors exist
    const hasErrors = Object.values(errors).some((err) => err !== '');
    if (hasErrors) {
      return;
    }

    try {
      const endpoint = authMode === 'signup'
        ? 'http://localhost:5000/api/auth/signup'
        : 'http://localhost:5000/api/auth/login';

      const payload = authMode === 'signup'
        ? {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phone,
          role: 'user'  // Default role is always 'user'
        }
        : {
          email: formData.email,
          password: formData.password
        };

      console.log('Sending payload:', payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Success
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        setIsAuthenticated(true);
        setShowAuthModal(false);
        setFormData({ name: '', email: '', password: '', phone: '', role: 'user' });
        setFormErrors({ name: '', email: '', password: '', phone: '' });

        alert(authMode === 'signup' ? 'Account created successfully!' : 'Login successful!');

        // Navigate based on role
        const userRole = data.user?.role || 'user';
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        // Error
        alert(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth Error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    alert('Logged out successfully');
  };

  return (
    <div style={{
      fontFamily: '"DM Sans", -apple-system, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #253eadff 0%, #232894ff 50%, #121492ff 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>

      <style>
      </style>

      {/* Header */}
      <header style={{
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Shield size={40} style={{ color: 'white', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }} />
          <h1 style={{
            fontSize: '32px',
            fontFamily: '"Space Mono", monospace',
            fontWeight: 700,
            color: 'white',
            margin: 0,
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '1px'
          }}>
            SafeHer
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{
                padding: '12px 28px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50px',
                color: 'white',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                style={{
                  padding: '12px 28px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50px',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                style={{
                  padding: '12px 28px',
                  background: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  color: '#667eea',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1.05)';
                  e.target.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0) scale(1)';
                  e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: '80px 48px',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Hero Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <h2 style={{
            fontSize: '64px',
            fontWeight: 700,
            color: 'white',
            margin: '0 0 24px 0',
            textShadow: '0 6px 20px rgba(0,0,0,0.3)',
            lineHeight: 1.2
          }}>
            Your Safety,<br />Our Priority
          </h2>
          <p style={{
            fontSize: '22px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto 60px',
            lineHeight: 1.6,
            textShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            24/7 emergency response system designed to keep you safe.
            One tap away from help when you need it most.
          </p>

          {/* SOS Button */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={handleSOSClick}
              style={{
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                border: '6px solid white',
                color: 'white',
                fontSize: '28px',
                fontWeight: 700,
                cursor: 'pointer',
                position: 'relative',
                zIndex: 2,
                boxShadow: '0 20px 60px rgba(239, 68, 68, 0.5)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.boxShadow = '0 25px 80px rgba(239, 68, 68, 0.7)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 20px 60px rgba(239, 68, 68, 0.5)';
              }}
            >
              <AlertCircle size={56} />
              <div>SOS</div>
            </button>
          </div>

          <p style={{
            marginTop: '32px',
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.8)',
            maxWidth: '500px',
            margin: '32px auto 0',
            fontWeight: 500
          }}>
            Press the SOS button for instant emergency alerts to your trusted contacts and authorities
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '32px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {[
            {
              icon: <Phone size={40} />,
              title: 'Emergency Contacts',
              description: 'Instantly notify your trusted contacts with your location and emergency status'
            },
            {
              icon: <MapPin size={40} />,
              title: 'Live Location Tracking',
              description: 'Real-time GPS tracking shared with your emergency contacts when activated'
            },
            {
              icon: <Users size={40} />,
              title: 'Community Network',
              description: 'Connect with nearby SafeHer users who can provide immediate assistance'
            },
            {
              icon: <HeartHandshake size={40} />,
              title: 'Counselling',
              description: 'Book counselling sessions with trained professionals'
            },
            {
              icon: <Lock size={40} />,
              title: 'Private & Secure',
              description: 'End-to-end encrypted communications and data protection guaranteed'
            },
            {
              icon: <AlertCircle size={40} />,
              title: '24/7 Monitoring',
              description: 'Round-the-clock emergency response team ready to assist you anytime'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',

              }}
            >
              <div style={{
                color: 'white',
                marginBottom: '20px',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
              }}>
                {feature.icon}
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: 'white',
                margin: '0 0 12px 0'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.6,
                margin: 0
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div style={{
          textAlign: 'center',
          marginTop: '100px',
          padding: '60px 40px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          maxWidth: '800px',
          margin: '100px auto 0'
        }}>
          <h3 style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'white',
            margin: '0 0 20px 0'
          }}>
            Join Our Safety Community
          </h3>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '32px',
            lineHeight: 1.6
          }}>
            Over 500,000 women trust SafeHer to keep them safe every day.
            Be part of a community that cares.
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              style={{
                padding: '18px 48px',
                background: 'white',
                border: 'none',
                borderRadius: '50px',
                color: '#667eea',
                fontSize: '18px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
                e.target.style.boxShadow = '0 16px 40px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
              }}
            >
              Get Started Now
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '32px',
            padding: '48px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 24px 80px rgba(0, 0, 0, 0.4)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '24px',
                right: '24px',
                background: 'none',
                border: 'none',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#666',
                lineHeight: 1,
                padding: '4px'
              }}
            >
              ×
            </button>

            <h2 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: '#1a34a5ff',
              margin: '0 0 12px 0',
              textAlign: 'center'
            }}>
              {authMode === 'login' ? 'Welcome Back' : 'Join SafeHer'}
            </h2>
            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '32px',
              textAlign: 'center'
            }}>
              {authMode === 'login'
                ? 'Login to access your safety dashboard'
                : 'Create your account and stay protected'}
            </p>

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {authMode === 'signup' && (
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="auth-input"
                    style={{
                      padding: '16px 20px',
                      border: `2px solid ${formErrors.name ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = formErrors.name ? '#ef4444' : '#667eea'}
                    onBlur={(e) => { handleInputBlur('name'); e.target.style.borderColor = formErrors.name ? '#ef4444' : '#e5e7eb'; }}
                  />
                  {formErrors.name && <p style={errorStyle}>{formErrors.name}</p>}
                </div>
              )}

              <div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="auth-input"
                  style={{
                    padding: '16px 20px',
                    border: `2px solid ${formErrors.email ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '16px',
                    fontSize: '16px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = formErrors.email ? '#ef4444' : '#667eea'}
                  onBlur={(e) => { handleInputBlur('email'); e.target.style.borderColor = formErrors.email ? '#ef4444' : '#e5e7eb'; }}
                />
                {formErrors.email && <p style={errorStyle}>{formErrors.email}</p>}
              </div>

              {authMode === 'signup' && (
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="auth-input"
                    style={{
                      padding: '16px 20px',
                      border: `2px solid ${formErrors.phone ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '16px',
                      fontSize: '16px',
                      outline: 'none',
                      fontFamily: 'inherit',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = formErrors.phone ? '#ef4444' : '#667eea'}
                    onBlur={(e) => { handleInputBlur('phone'); e.target.style.borderColor = formErrors.phone ? '#ef4444' : '#e5e7eb'; }}
                  />
                  {formErrors.phone && <p style={errorStyle}>{formErrors.phone}</p>}
                </div>
              )}



              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="auth-input"
                  style={{
                    padding: '16px 20px',
                    border: `2px solid ${formErrors.password ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '16px',
                    fontSize: '16px',
                    outline: 'none',
                    fontFamily: 'inherit',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = formErrors.password ? '#ef4444' : '#667eea'}
                  onBlur={(e) => { handleInputBlur('password'); e.target.style.borderColor = formErrors.password ? '#ef4444' : '#e5e7eb'; }}
                />
                {formErrors.password && <p style={errorStyle}>{formErrors.password}</p>}
              </div>

              <button
                type="submit"
                style={{
                  padding: '16px',
                  background: 'linear-gradient(135deg, #112478ff 0%, #271ea8ff 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  marginTop: '8px'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <p style={{
              textAlign: 'center',
              marginTop: '24px',
              color: '#666',
              fontSize: '14px'
            }}>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1e359cff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline',
                  fontFamily: 'inherit'
                }}
              >
                {authMode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      )}

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

      {/* Footer */}
      <footer style={{
        padding: '32px 48px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: '14px',
        position: 'relative',
        zIndex: 5
      }}>
        <p style={{ margin: 0 }}>
          © 2026 SafeHer. Your safety is our mission. Available 24/7 for emergencies.
        </p>
        <p style={{ margin: '8px 0 0', fontSize: '12px', opacity: 0.7 }}>
          Emergency Hotline: 1-800-SAFEHER
        </p>
      </footer>
    </div>
  );
}

export default Home;