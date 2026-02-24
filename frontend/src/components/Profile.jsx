import React, { useState, useEffect, useRef } from "react";
import { Edit2, Save, X, User, ShieldCheck, MapPin, Phone, Droplet, Users, Wifi, Plus, Trash2, ArrowLeft, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    gender: "",
    bloodGroup: "",
    homeAddress: "",
    ipAddresses: [],
    profilePhoto: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newIp, setNewIp] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  // SafeHer Brand Colors
  const theme = {
    primary: "#2e1a9eff",
    primaryHover: "#2f2b9dff",
    secondary: "#2a2590ff",
    bg: "#F3F4F6",
    cardBg: "#ffffff",
    textDark: "#1F2937",
    textLight: "#6B7280",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "GET",
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.name || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          gender: data.gender || "",
          bloodGroup: data.bloodGroup || "",
          homeAddress: data.homeAddress || "",
          ipAddresses: data.ipAddresses || [],
          profilePhoto: data.profilePhoto || "",
        });
      } else {
        console.error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({
          name: profileData.name,
          gender: profileData.gender,
          bloodGroup: profileData.bloodGroup,
          phoneNumber: profileData.phoneNumber,
          homeAddress: profileData.homeAddress,
          ipAddresses: profileData.ipAddresses,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditingProfile(false);
        alert("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  const handleAddIp = () => {
    if (!newIp.trim()) {
      alert("Please enter an IP address");
      return;
    }
    if (profileData.ipAddresses.length >= 3) {
      alert("Maximum 3 IP addresses allowed");
      return;
    }
    if (profileData.ipAddresses.includes(newIp.trim())) {
      alert("This IP is already added");
      return;
    }
    setProfileData({
      ...profileData,
      ipAddresses: [...profileData.ipAddresses, newIp.trim()],
    });
    setNewIp("");
  };

  const handleRemoveIp = (ipToRemove) => {
    setProfileData({
      ...profileData,
      ipAddresses: profileData.ipAddresses.filter((ip) => ip !== ipToRemove),
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:5000/api/auth/profile/photo', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
          body: JSON.stringify({ profilePhoto: base64String }),
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(prev => ({ ...prev, profilePhoto: data.profilePhoto }));
        } else {
          const errData = await response.json();
          alert(errData.message || 'Failed to upload photo');
        }
        setUploadingPhoto(false);
      };
      reader.onerror = () => {
        alert('Error reading file');
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Something went wrong. Please try again.');
      setUploadingPhoto(false);
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile photo?')) return;

    setUploadingPhoto(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile/photo', {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });

      if (response.ok) {
        setProfileData(prev => ({ ...prev, profilePhoto: '' }));
      } else {
        alert('Failed to remove photo');
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('Something went wrong.');
    }
    setUploadingPhoto(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}>
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}>
          <div style={{ fontSize: "18px", color: theme.textDark }}>Loading profile...</div>
        </div>
      </div>
    );
  }

  const profileFields = [
    { key: "name", label: "Full Name", icon: <User size={18} />, type: "text" },
    { key: "email", label: "Email Address", icon: <ShieldCheck size={18} />, type: "email", disabled: true },
    { key: "phoneNumber", label: "Phone Number", icon: <Phone size={18} />, type: "tel" },
    { key: "gender", label: "Gender", icon: <Users size={18} />, type: "select", options: ["Male", "Female", "Other", "Prefer not to say"] },
    { key: "bloodGroup", label: "Blood Group", icon: <Droplet size={18} />, type: "select", options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    { key: "homeAddress", label: "Home Address", icon: <MapPin size={18} />, type: "textarea" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdf2f8 0%, #fae8ff 50%, #f5f3ff 100%)",
      padding: "40px 20px",
    }}>
      {/* Inject CSS for hover effects */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .photo-overlay {
          opacity: 0 !important;
          transition: opacity 0.25s ease !important;
        }
        .photo-overlay:hover,
        div:hover > div > .photo-overlay {
          opacity: 1 !important;
        }
      `}</style>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "12px",
            cursor: "pointer",
            marginBottom: "24px",
            fontSize: "14px",
            fontWeight: 600,
            color: theme.textDark,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            transition: "all 0.2s",
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = "translateX(-4px)"}
          onMouseOut={(e) => e.currentTarget.style.transform = "translateX(0)"}
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        {/* Main Profile Card */}
        <div style={{
          background: theme.cardBg,
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
        }}>
          {/* Header Banner */}
          <div style={{
            height: "140px",
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`
          }}>
            <div style={{
              position: "absolute",
              top: 20,
              left: 24,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <ShieldCheck size={24} />
              <span style={{ fontWeight: 700, fontSize: "18px" }}>SafeHer Profile</span>
            </div>
          </div>

          <div style={{ padding: "0 40px 40px" }}>
            {/* Avatar and Name Section */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "-60px",
              marginBottom: "40px",
              flexWrap: "wrap",
              gap: "20px",
            }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: "20px" }}>
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />

                {/* Avatar with photo overlay */}
                <div style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background: "white",
                  padding: "5px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  position: "relative",
                  flexShrink: 0,
                }}>
                  <div style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: profileData.profilePhoto
                      ? `url(${profileData.profilePhoto}) center/cover no-repeat`
                      : `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "48px",
                    fontWeight: 700,
                    overflow: "hidden",
                    position: "relative",
                  }}>
                    {!profileData.profilePhoto && (
                      <span>{profileData.name ? profileData.name.charAt(0).toUpperCase() : "U"}</span>
                    )}

                    {/* Hover overlay with camera icon */}
                    <div
                      className="photo-overlay"
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        cursor: uploadingPhoto ? "wait" : "pointer",
                        opacity: 0,
                        transition: "opacity 0.25s ease",
                      }}
                    >
                      {uploadingPhoto ? (
                        <div style={{
                          width: "24px",
                          height: "24px",
                          border: "3px solid rgba(255,255,255,0.3)",
                          borderTopColor: "white",
                          borderRadius: "50%",
                          animation: "spin 0.7s linear infinite",
                        }} />
                      ) : (
                        <Camera size={28} color="white" />
                      )}
                    </div>
                  </div>

                  {/* Remove photo button */}
                  {profileData.profilePhoto && (
                    <button
                      onClick={handleRemovePhoto}
                      disabled={uploadingPhoto}
                      title="Remove photo"
                      style={{
                        position: "absolute",
                        bottom: "0",
                        right: "0",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: theme.danger,
                        border: "3px solid white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: uploadingPhoto ? "wait" : "pointer",
                        transition: "transform 0.2s, background 0.2s",
                        zIndex: 2,
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                      onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <Trash2 size={14} color="white" />
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <h1 style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: theme.textDark,
                    marginTop: "70px",
                  }}>
                    {profileData.name || "Your Profile"}
                  </h1>
                  <p style={{ color: theme.textLight, fontSize: "14px", margin: "4px 0 0" }}>
                    {profileData.email}
                  </p>
                  <p style={{ color: theme.textLight, fontSize: "12px", margin: "4px 0 0", fontStyle: "italic" }}>
                    {profileData.profilePhoto ? "Click photo to change • Red button to remove" : "Click avatar to upload a photo"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    style={{
                      padding: "12px 24px",
                      background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                      border: "none",
                      borderRadius: "30px",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.2s",
                      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      style={{
                        padding: "12px 24px",
                        background: theme.success,
                        border: "none",
                        borderRadius: "30px",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: saving ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        fetchProfile(); // Reset to original data
                      }}
                      style={{
                        padding: "12px 24px",
                        background: theme.danger,
                        border: "none",
                        borderRadius: "30px",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <X size={16} /> Cancel
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Fields */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              marginBottom: "40px",
            }}>
              {profileFields.map((field) => (
                <div key={field.key}>
                  <label style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    color: theme.primary,
                    marginBottom: "8px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}>
                    {field.icon} {field.label}
                  </label>

                  {isEditingProfile && !field.disabled ? (
                    field.type === "select" ? (
                      <select
                        value={profileData[field.key]}
                        onChange={(e) => setProfileData({ ...profileData, [field.key]: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          border: "2px solid #E5E7EB",
                          borderRadius: "12px",
                          fontSize: "16px",
                          color: theme.textDark,
                          outline: "none",
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea
                        value={profileData[field.key]}
                        onChange={(e) => setProfileData({ ...profileData, [field.key]: e.target.value })}
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          border: "2px solid #E5E7EB",
                          borderRadius: "12px",
                          fontSize: "16px",
                          color: theme.textDark,
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                          boxSizing: "border-box",
                        }}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={profileData[field.key]}
                        onChange={(e) => setProfileData({ ...profileData, [field.key]: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "14px 16px",
                          border: "2px solid #E5E7EB",
                          borderRadius: "12px",
                          fontSize: "16px",
                          color: theme.textDark,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    )
                  ) : (
                    <div style={{
                      padding: "14px 16px",
                      background: "#F9FAFB",
                      borderRadius: "12px",
                      fontSize: "16px",
                      color: profileData[field.key] ? theme.textDark : theme.textLight,
                      border: "1px solid transparent",
                    }}>
                      {profileData[field.key] || "Not set"}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* IP Addresses Section */}
            <div style={{
              background: "#F9FAFB",
              borderRadius: "16px",
              padding: "24px",
              border: "2px solid #E5E7EB",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Wifi size={20} color={theme.primary} />
                  <h3 style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: theme.textDark,
                    margin: 0,
                  }}>
                    Authorized Devices (IP Addresses)
                  </h3>
                </div>
                <span style={{
                  padding: "6px 12px",
                  background: profileData.ipAddresses.length >= 3 ? "#FEE2E2" : "#DCFCE7",
                  color: profileData.ipAddresses.length >= 3 ? "#991B1B" : "#166534",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}>
                  {profileData.ipAddresses.length}/3 devices
                </span>
              </div>

              <p style={{
                fontSize: "14px",
                color: theme.textLight,
                marginBottom: "20px",
              }}>
                We use your IP address to send critical alerts and verify your location, ensuring you receive timely assistance during emergencies.
              </p>

              {/* Current IPs */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                {profileData.ipAddresses.length === 0 ? (
                  <div style={{
                    padding: "16px",
                    background: "white",
                    borderRadius: "10px",
                    textAlign: "center",
                    color: theme.textLight,
                    fontSize: "14px",
                  }}>
                    No IP addresses added yet
                  </div>
                ) : (
                  profileData.ipAddresses.map((ip, index) => (
                    <div key={index} style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      background: "white",
                      borderRadius: "10px",
                      border: "1px solid #E5E7EB",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "10px",
                          background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                        }}>
                          <Wifi size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: theme.textDark }}>{ip}</div>
                          <div style={{ fontSize: "12px", color: theme.textLight }}>Device {index + 1}</div>
                        </div>
                      </div>
                      {isEditingProfile && (
                        <button
                          onClick={() => handleRemoveIp(ip)}
                          style={{
                            padding: "8px",
                            background: "#FEE2E2",
                            border: "none",
                            borderRadius: "8px",
                            color: "#DC2626",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add New IP */}
              {isEditingProfile && profileData.ipAddresses.length < 3 && (
                <div style={{ display: "flex", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="Enter IP address (e.g., 192.168.1.1)"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "12px 16px",
                      border: "2px solid #E5E7EB",
                      borderRadius: "10px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    onKeyPress={(e) => e.key === "Enter" && handleAddIp()}
                  />
                  <button
                    onClick={handleAddIp}
                    style={{
                      padding: "12px 20px",
                      background: theme.primary,
                      border: "none",
                      borderRadius: "10px",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;