import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/api";
import { Camera, Loader2, Check, AlertCircle } from "lucide-react";

const C = {
  purple600: "#5b2d8e",
  purple500: "#7c3aed",
  blue500:   "#3b82f6",
  gray200:   "#e5e7eb",
  gray400:   "#9ca3af",
  gray500:   "#64748b",
  gray600:   "#4b5563",
  gray900:   "#111827",
  white:     "#ffffff",
  red500:    "#ef4444",
  green500:  "#10b981",
};

export default function ProfileSettings() {
  const auth = useAuth();
  const isDark = document.body.getAttribute("data-theme") === "dark";
  
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        bio: data.bio || "",
        phone: data.phone || "",
        email: data.email || ""
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const result = await auth.updateProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        phone: profile.phone
      });
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} color={C.purple600} />
      </div>
    );
  }

  const s = {
    panel: {
      background: isDark ? "#111827" : C.white,
      borderRadius: 16,
      border: `1px solid ${isDark ? "#1f2937" : C.gray200}`,
      padding: "2rem",
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
    },
    title: { fontSize: 20, fontWeight: 700, color: isDark ? C.white : C.gray900, marginBottom: "0.5rem" },
    desc: { fontSize: 14, color: C.gray500, marginBottom: "2rem" },
    label: { display: "block", fontSize: 13, fontWeight: 600, color: isDark ? "#9ca3af" : C.gray600, marginBottom: 6 },
    input: {
      width: "100%", background: isDark ? "#1f2937" : "#fcfcfc",
      border: `1px solid ${isDark ? "#374151" : C.gray200}`,
      color: isDark ? C.white : C.gray900,
      padding: "10px 14px", borderRadius: 8, fontSize: 14, outline: "none"
    },
    btnPrimary: {
      background: C.purple600, color: C.white, border: "none", padding: "10px 20px",
      borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 8
    },
    alert: (type) => ({
      padding: "12px 16px", borderRadius: 8, marginBottom: "1.5rem", fontSize: 14,
      display: "flex", alignItems: "center", gap: "10px",
      background: type === "success" ? (isDark ? "rgba(16, 185, 129, 0.1)" : "#ecfdf5") : (isDark ? "rgba(239, 68, 68, 0.1)" : "#fef2f2"),
      color: type === "success" ? C.green500 : C.red500,
      border: `1px solid ${type === "success" ? (isDark ? "rgba(16, 185, 129, 0.2)" : "#d1fae5") : (isDark ? "rgba(239, 68, 68, 0.2)" : "#fee2e2")}`
    })
  };

  return (
    <div style={s.panel}>
      <h2 style={s.title}>My Profile</h2>
      <p style={s.desc}>Update your personal details and public profile information.</p>
      
      {message.text && (
        <div style={s.alert(message.type)}>
          {message.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ 
          width: 80, height: 80, borderRadius: "50%", 
          background: `linear-gradient(135deg, ${C.purple500}, ${C.blue500})`,
          color: C.white, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, position: "relative"
        }}>
          {profile.firstName ? profile.firstName[0].toUpperCase() : "U"}
          <button style={{
            position: "absolute", bottom: -5, right: -5,
            width: 32, height: 32, borderRadius: "50%",
            background: isDark ? "#374151" : C.white,
            border: `1px solid ${isDark ? "#4b5563" : C.gray200}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: isDark ? "#9ca3af" : C.gray600
          }}>
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.white : C.gray900, marginBottom: 4 }}>Profile Photo</h3>
          <p style={{ fontSize: 13, color: C.gray500 }}>JPG, GIF or PNG. 1MB max.</p>
        </div>
      </div>

      <form onSubmit={handleUpdate}>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>First Name</label>
            <input style={s.input} value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Last Name</label>
            <input style={s.input} value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} />
          </div>
        </div>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={s.label}>Bio</label>
          <textarea 
            style={{ ...s.input, minHeight: 100, resize: "vertical" }} 
            placeholder="Write a brief description..."
            value={profile.bio}
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
          ></textarea>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={s.label}>Phone Number</label>
          <input style={s.input} value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" style={s.btnPrimary} disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
