import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2, Mail, Shield, Check, AlertCircle } from "lucide-react";

const C = {
  purple600: "#5b2d8e",
  purple500: "#7c3aed",
  gray200:   "#e5e7eb",
  gray400:   "#9ca3af",
  gray500:   "#64748b",
  gray600:   "#4b5563",
  gray900:   "#111827",
  white:     "#ffffff",
  red500:    "#ef4444",
  green500:  "#10b981",
};

export default function AccountSettings() {
  const auth = useAuth();
  const isDark = document.body.getAttribute("data-theme") === "dark";
  
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    try {
      setSaving(true);
      await api.changePassword(passwords.current, passwords.new);
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to change password" });
    } finally {
      setSaving(false);
    }
  };

  const s = {
    panel: {
      background: "var(--surface)",
      borderRadius: 16,
      border: "1px solid var(--border)",
      padding: "var(--dash-padding)",
      boxShadow: "var(--card-shadow)"
    },
    title: { fontSize: "1.25rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.5rem" },
    desc: { fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "2rem" },
    label: { display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 },
    input: {
      width: "100%", background: "var(--input-bg)",
      border: "1px solid var(--border)",
      color: "var(--text)",
      padding: "10px 14px", borderRadius: 8, fontSize: "0.875rem", outline: "none",
      transition: "border-color 0.2s"
    },
    btnPrimary: {
      background: "var(--accent-blue)", color: C.white, border: "none", padding: "10px 20px",
      borderRadius: 8, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 8,
      transition: "all 0.2s"
    },
    alert: (type) => ({
      padding: "12px 16px", borderRadius: 8, marginBottom: "1.5rem", fontSize: "0.875rem",
      display: "flex", alignItems: "center", gap: "10px",
      background: type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
      color: type === "success" ? C.green500 : C.red500,
      border: `1px solid ${type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
    })
  };

  return (
    <div style={s.panel}>
      <h2 style={s.title}>Account Settings</h2>
      <p style={s.desc}>Manage your login credentials and security parameters.</p>
      
      {message.text && (
        <div style={s.alert(message.type)}>
          {message.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={s.label}>Email Address</label>
        <div style={{ position: "relative" }}>
          <Mail size={16} style={{ position: "absolute", left: 14, top: 12, color: C.gray500 }} />
          <input style={{ ...s.input, paddingLeft: 40, opacity: 0.7 }} value={auth.user?.email || ""} disabled />
        </div>
      </div>

      <div style={{ marginBottom: "2rem" }}>
        <label style={s.label}>Role</label>
        <div style={{ position: "relative" }}>
          <Shield size={16} style={{ position: "absolute", left: 14, top: 12, color: C.gray500 }} />
          <input style={{ ...s.input, paddingLeft: 40, opacity: 0.7, textTransform: "capitalize" }} value={auth.user?.role || ""} disabled />
        </div>
      </div>

      <div style={{ height: 1, background: isDark ? "#1f2937" : C.gray200, margin: "2rem 0" }}></div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.white : C.gray900, marginBottom: "1rem" }}>Change Password</h3>

      <form onSubmit={handlePasswordChange}>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={s.label}>Current Password</label>
          <input type="password" style={s.input} value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} required />
        </div>
        <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}>New Password</label>
            <input type="password" style={s.input} value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} required />
          </div>
          <div style={{ flex: 1 }}>
            <label style={s.label}>Confirm Password</label>
            <input type="password" style={s.input} value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} required />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" style={s.btnPrimary} disabled={saving}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
