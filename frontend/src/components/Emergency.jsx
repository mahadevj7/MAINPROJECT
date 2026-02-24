import React, { useState, useEffect } from "react";
import { Plus, Trash2, Phone, Mail, Users, Heart, ArrowLeft, Save, AlertCircle, ShieldCheck, Edit2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Emergency = () => {
  const navigate = useNavigate();
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // Track which contact is being edited
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    relation: ""
  });
  const [editContact, setEditContact] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    relation: ""
  });

  // Theme colors
  const theme = {
    primary: "#1c2da9ff",
    primaryHover: "#15239bff",
    secondary: "#2a22a2ff",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    textDark: "#1F2937",
    textLight: "#6B7280",
  };

  const relationOptions = [
    "Parent", "Spouse", "Sibling", "Child", "Friend", "Relative", "Colleague", "Other"
  ];

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const fetchEmergencyContacts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/emergency-contacts", {
        method: "GET",
        headers: {
          "x-auth-token": token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmergencyContacts(data || []);
      } else {
        console.error("Failed to fetch emergency contacts");
      }
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
    }
    setLoading(false);
  };

  const saveContacts = async (contacts) => {
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5000/api/auth/emergency-contacts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token,
        },
        body: JSON.stringify({ emergencyContacts: contacts }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmergencyContacts(data);
        return true;
      } else {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          alert(errorData.message || "Failed to save contacts");
        } else {
          const errorText = await response.text();
          alert(errorText || "Failed to save contacts");
        }
        return false;
      }
    } catch (error) {
      console.error("Error saving contacts:", error);
      alert("Something went wrong. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.phoneNumber || !newContact.relation) {
      alert("Please fill in Name, Phone Number, and Relation");
      return;
    }

    const updatedContacts = [...emergencyContacts, { ...newContact }];
    const success = await saveContacts(updatedContacts);

    if (success) {
      setNewContact({ name: "", email: "", phoneNumber: "", relation: "" });
      setShowAddContact(false);
    }
  };

  const handleDeleteContact = async (index) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return;
    }

    const updatedContacts = emergencyContacts.filter((_, i) => i !== index);
    await saveContacts(updatedContacts);
  };

  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditContact({ ...emergencyContacts[index] });
    setShowAddContact(false); // Close add form if open
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditContact({ name: "", email: "", phoneNumber: "", relation: "" });
  };

  const handleUpdateContact = async () => {
    if (!editContact.name || !editContact.phoneNumber || !editContact.relation) {
      alert("Please fill in Name, Phone Number, and Relation");
      return;
    }

    const updatedContacts = emergencyContacts.map((contact, index) =>
      index === editingIndex ? { ...editContact } : contact
    );

    const success = await saveContacts(updatedContacts);

    if (success) {
      setEditingIndex(null);
      setEditContact({ name: "", email: "", phoneNumber: "", relation: "" });
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #fdf2f8 0%, #fae8ff 50%, #f5f3ff 100%)",
      }}>
        <div style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
        }}>
          <div style={{ fontSize: "18px", color: theme.textDark }}>Loading emergency contacts...</div>
        </div>
      </div>
    );
  }

  // Reusable form fields component
  const ContactFormFields = ({ contact, setContact, isEdit = false }) => (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "20px",
    }}>
      <div>
        <label style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 600,
          color: theme.textLight,
          marginBottom: "6px",
          textTransform: "uppercase",
        }}>
          Name *
        </label>
        <input
          type="text"
          placeholder="Contact's full name"
          value={contact.name}
          onChange={(e) => setContact({ ...contact, name: e.target.value })}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "2px solid #E5E7EB",
            borderRadius: "10px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <label style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 600,
          color: theme.textLight,
          marginBottom: "6px",
          textTransform: "uppercase",
        }}>
          Relation *
        </label>
        <select
          value={contact.relation}
          onChange={(e) => setContact({ ...contact, relation: e.target.value })}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "2px solid #E5E7EB",
            borderRadius: "10px",
            fontSize: "14px",
            outline: "none",
            background: "white",
            cursor: "pointer",
            boxSizing: "border-box",
          }}
        >
          <option value="">Select relation</option>
          {relationOptions.map((rel) => (
            <option key={rel} value={rel}>{rel}</option>
          ))}
        </select>
      </div>

      <div>
        <label style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 600,
          color: theme.textLight,
          marginBottom: "6px",
          textTransform: "uppercase",
        }}>
          Phone Number *
        </label>
        <input
          type="tel"
          placeholder="e.g., +91 9876543210"
          value={contact.phoneNumber}
          onChange={(e) => setContact({ ...contact, phoneNumber: e.target.value })}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "2px solid #E5E7EB",
            borderRadius: "10px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <label style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 600,
          color: theme.textLight,
          marginBottom: "6px",
          textTransform: "uppercase",
        }}>
          Email (Optional)
        </label>
        <input
          type="email"
          placeholder="contact@email.com"
          value={contact.email || ""}
          onChange={(e) => setContact({ ...contact, email: e.target.value })}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "2px solid #E5E7EB",
            borderRadius: "10px",
            fontSize: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdf2f8 0%, #fae8ff 50%, #f5f3ff 100%)",
      padding: "40px 20px",
    }}>
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

        {/* Main Card */}
        <div style={{
          background: "white",
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
        }}>
          {/* Header Banner */}
          <div style={{
            padding: "32px 40px",
            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
            color: "white",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <AlertCircle size={32} />
              <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>
                Emergency Contacts
              </h1>
            </div>
            <p style={{ fontSize: "16px", opacity: 0.9, margin: 0 }}>
              Add trusted contacts who will be notified in case of emergency. They will receive your location and alerts.
            </p>
          </div>

          <div style={{ padding: "40px" }}>
            {/* Add Contact Button */}
            {!showAddContact && editingIndex === null && (
              <button
                onClick={() => setShowAddContact(true)}
                style={{
                  width: "100%",
                  padding: "20px",
                  background: "#F9FAFB",
                  border: "2px dashed #E5E7EB",
                  borderRadius: "16px",
                  color: theme.primary,
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "24px",
                  transition: "all 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = theme.primary;
                  e.currentTarget.style.background = "#F3F0FF";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#E5E7EB";
                  e.currentTarget.style.background = "#F9FAFB";
                }}
              >
                <Plus size={20} /> Add New Emergency Contact
              </button>
            )}

            {/* Add Contact Form */}
            {showAddContact && (
              <div style={{
                padding: "24px",
                background: "#F9FAFB",
                borderRadius: "16px",
                marginBottom: "24px",
                border: `2px solid ${theme.primary}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                  <Heart size={20} color={theme.primary} />
                  <h3 style={{ fontSize: "18px", fontWeight: 700, color: theme.textDark, margin: 0 }}>
                    Add New Emergency Contact
                  </h3>
                </div>

                <ContactFormFields contact={newContact} setContact={setNewContact} />

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={handleAddContact}
                    disabled={saving}
                    style={{
                      padding: "12px 24px",
                      background: theme.success,
                      border: "none",
                      borderRadius: "10px",
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
                    <Save size={16} /> {saving ? "Saving..." : "Save Contact"}
                  </button>

                  <button
                    onClick={() => {
                      setShowAddContact(false);
                      setNewContact({ name: "", email: "", phoneNumber: "", relation: "" });
                    }}
                    style={{
                      padding: "12px 24px",
                      background: "#F3F4F6",
                      border: "none",
                      borderRadius: "10px",
                      color: theme.textDark,
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Emergency Contacts List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {emergencyContacts.length === 0 ? (
                <div style={{
                  padding: "60px 40px",
                  background: "#F9FAFB",
                  borderRadius: "16px",
                  textAlign: "center",
                }}>
                  <Users size={48} color={theme.textLight} style={{ marginBottom: "16px" }} />
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: theme.textDark, margin: "0 0 8px" }}>
                    No Emergency Contacts Yet
                  </h3>
                  <p style={{ fontSize: "14px", color: theme.textLight, margin: 0 }}>
                    Add trusted contacts who will be notified during emergencies.
                  </p>
                </div>
              ) : (
                emergencyContacts.map((contact, index) => (
                  <div key={index}>
                    {/* Edit Mode */}
                    {editingIndex === index ? (
                      <div style={{
                        padding: "24px",
                        background: "#FFFBEB",
                        borderRadius: "16px",
                        border: `2px solid ${theme.warning}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                          <Edit2 size={20} color={theme.warning} />
                          <h3 style={{ fontSize: "18px", fontWeight: 700, color: theme.textDark, margin: 0 }}>
                            Edit Contact
                          </h3>
                        </div>

                        <ContactFormFields contact={editContact} setContact={setEditContact} isEdit={true} />

                        <div style={{ display: "flex", gap: "12px" }}>
                          <button
                            onClick={handleUpdateContact}
                            disabled={saving}
                            style={{
                              padding: "12px 24px",
                              background: theme.success,
                              border: "none",
                              borderRadius: "10px",
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
                            <Save size={16} /> {saving ? "Updating..." : "Update Contact"}
                          </button>

                          <button
                            onClick={handleCancelEdit}
                            style={{
                              padding: "12px 24px",
                              background: "#F3F4F6",
                              border: "none",
                              borderRadius: "10px",
                              color: theme.textDark,
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
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div
                        style={{
                          padding: "24px",
                          border: "2px solid #E5E7EB",
                          borderRadius: "16px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          transition: "all 0.2s",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.borderColor = theme.primary;
                          e.currentTarget.style.boxShadow = "0 4px 12px rgba(139, 92, 246, 0.1)";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.borderColor = "#E5E7EB";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          {/* Avatar */}
                          <div style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "22px",
                            fontWeight: 700,
                          }}>
                            {contact.name ? contact.name.charAt(0).toUpperCase() : "?"}
                          </div>

                          {/* Contact Info */}
                          <div>
                            <h3 style={{
                              fontSize: "18px",
                              fontWeight: 700,
                              color: theme.textDark,
                              margin: 0,
                            }}>
                              {contact.name}
                            </h3>
                            <div style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "4px",
                            }}>
                              <span style={{
                                padding: "4px 10px",
                                background: "#F3E8FF",
                                color: theme.primary,
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}>
                                {contact.relation}
                              </span>
                            </div>
                            <div style={{
                              display: "flex",
                              gap: "16px",
                              marginTop: "8px",
                              fontSize: "14px",
                              color: theme.textLight,
                              flexWrap: "wrap",
                            }}>
                              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Phone size={14} color={theme.primary} />
                                {contact.phoneNumber}
                              </span>
                              {contact.email && (
                                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <Mail size={14} color={theme.primary} />
                                  {contact.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          {/* Edit Button */}
                          <button
                            onClick={() => handleStartEdit(index)}
                            disabled={saving || editingIndex !== null}
                            style={{
                              padding: "12px",
                              background: "#EDE9FE",
                              border: "none",
                              borderRadius: "12px",
                              color: theme.primary,
                              cursor: (saving || editingIndex !== null) ? "not-allowed" : "pointer",
                              transition: "all 0.2s",
                              opacity: (saving || editingIndex !== null) ? 0.5 : 1,
                            }}
                            onMouseOver={(e) => {
                              if (editingIndex === null) e.currentTarget.style.background = "#DDD6FE";
                            }}
                            onMouseOut={(e) => e.currentTarget.style.background = "#EDE9FE"}
                          >
                            <Edit2 size={18} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteContact(index)}
                            disabled={saving || editingIndex !== null}
                            style={{
                              padding: "12px",
                              background: "#FEE2E2",
                              border: "none",
                              borderRadius: "12px",
                              color: "#DC2626",
                              cursor: (saving || editingIndex !== null) ? "not-allowed" : "pointer",
                              transition: "all 0.2s",
                              opacity: (saving || editingIndex !== null) ? 0.5 : 1,
                            }}
                            onMouseOver={(e) => {
                              if (editingIndex === null) e.currentTarget.style.background = "#FECACA";
                            }}
                            onMouseOut={(e) => e.currentTarget.style.background = "#FEE2E2"}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Safety Tip */}
            {emergencyContacts.length > 0 && editingIndex === null && (
              <div style={{
                marginTop: "32px",
                padding: "20px 24px",
                background: "#DCFCE7",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <ShieldCheck size={24} color="#166534" />
                <div>
                  <p style={{ margin: 0, fontSize: "14px", color: "#166534", fontWeight: 600 }}>
                    {emergencyContacts.length} contact{emergencyContacts.length > 1 ? "s" : ""} will be notified
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#166534", opacity: 0.8 }}>
                    When you trigger an SOS alert, all your emergency contacts will receive your live location.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
