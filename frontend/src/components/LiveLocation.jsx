import React, { useState } from 'react';
import { MapPin, Navigation, Share2 } from 'lucide-react';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import './LiveLocation.css';

const LiveLocation = () => {
    const navigate = useNavigate();
    const [currentLocation, setCurrentLocation] = useState(null);

    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState(null);

    const user = JSON.parse(localStorage.getItem('user'));



    const startTracking = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setIsTracking(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                setCurrentLocation(location);

                // Send location to backend
                try {
                    const response = await fetch('http://localhost:5000/api/locations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: user ? (user.id || user._id) : null,
                            location
                        })
                    });

                    if (!response.ok) {
                        console.error('Error saving location');
                    }
                } catch (err) {
                    console.error('Error saving location:', err);
                }

                setIsTracking(false);
            },
            (err) => {
                setError(`Error getting location: ${err.message}`);
                setIsTracking(false);
            },
            { enableHighAccuracy: true }
        );
    };



    return (
        <div className="live-location-page">
            <Navbar onLogout={() => navigate('/')} />

            <div className="location-container">
                <div className="location-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                        <h1><MapPin size={32} /> Live Location</h1>
                        <p>Track and share your real-time location with trusted contacts</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
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
                            transition: 'opacity 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="location-content">
                    <div className="current-location-card">
                        <div className="card-header">
                            <Navigation size={24} />
                            <h2>Current Location</h2>
                        </div>

                        {error && <p className="error-message">{error}</p>}

                        {currentLocation ? (
                            <div className="location-details">
                                <p><strong>Latitude:</strong> {currentLocation.latitude.toFixed(6)}</p>
                                <p><strong>Longitude:</strong> {currentLocation.longitude.toFixed(6)}</p>
                                <a
                                    href={`https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-map-link"
                                >
                                    View on Google Maps
                                </a>
                            </div>
                        ) : (
                            <p className="no-location">Click the button below to get your current location</p>
                        )}

                        <button
                            className={`track-button ${isTracking ? 'tracking' : ''}`}
                            onClick={startTracking}
                            disabled={isTracking}
                        >
                            {isTracking ? 'Getting Location...' : 'Get Current Location'}
                        </button>
                    </div>


                </div>
            </div>
        </div>
    );
};

export default LiveLocation;