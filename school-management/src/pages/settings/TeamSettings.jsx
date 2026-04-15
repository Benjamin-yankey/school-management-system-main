import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { Loader2, Plus, Mail, Check, AlertCircle, Trash2, Shield, User } from "lucide-react";

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

export default function TeamSettings() {
  const auth = useAuth();
  const isDark = document.body.getAttribute("data-theme") === "dark";
  
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({ email: "", firstName: "", lastName: "", role: "teacher" });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (auth.user?.role === "administration" || auth.user?.role === "superadmin") {
      fetchTeam();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await api.getAdministrationUsers();
      setTeam(data);
    } catch (err) {
      console.error("Failed to fetch team:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.createSchoolUser({ ...inviteData, password: "TemporaryPassword123!" });
      setMessage({ type: "success", text: `Invitation sent to ${inviteData.email}` });
      setShowInviteModal(false);
      setInviteData({ email: "", firstName: "", lastName: "", role: "teacher" });
      fetchTeam();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to send invitation" });
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
    btnPrimary: {
      background: "var(--accent-blue)", color: C.white, border: "none", padding: "10px 20px",
      borderRadius: 8, fontSize: "0.875rem", fontWeight: 600, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 8,
      transition: "all 0.2s"
    },
    label: { display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 },
    input: {
      width: "100%", background: "var(--input-bg)",
      border: "1px solid var(--border)",
      color: "var(--text)",
      padding: "10px 14px", borderRadius: 8, fontSize: "0.875rem", outline: "none",
      transition: "border-color 0.2s"
    },
    modalOverlay: {
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: "1rem"
    },
    alert: (type) => ({
      padding: "12px 16px", borderRadius: 8, marginBottom: "1.5rem", fontSize: "0.875rem",
      display: "flex", alignItems: "center", gap: "10px",
      background: type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
      color: type === "success" ? C.green500 : C.red500,
      border: `1px solid ${type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
    })
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <Loader2 className="animate-spin" size={32} color={C.purple600} />
      </div>
    );
  }

  return (
    <div style={s.panel}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h2 style={s.title}>Team & Members</h2>
          <p style={{ ...s.desc, marginBottom: 0 }}>Manage access and roles for your school team.</p>
        </div>
        <button style={s.btnPrimary} onClick={() => setShowInviteModal(true)}>
          <Plus size={16} /> Invite Member
        </button>
      </div>

      {message.text && (
        <div style={s.alert(message.type)}>
          {message.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {showInviteModal && (
        <div style={s.modalOverlay}>
          <div style={{ ...s.panel, width: "100%", maxWidth: 500 }}>
            <h2 style={s.title}>Invite New Member</h2>
            <form onSubmit={handleInvite}>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>First Name</label>
                  <input style={s.input} required value={inviteData.firstName} onChange={(e) => setInviteData({...inviteData, firstName: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Last Name</label>
                  <input style={s.input} required value={inviteData.lastName} onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})} />
                </div>
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={s.label}>Email Address</label>
                <input type="email" style={s.input} required value={inviteData.email} onChange={(e) => setInviteData({...inviteData, email: e.target.value})} />
              </div>
              <div style={{ marginBottom: "2rem" }}>
                <label style={s.label}>Role</label>
                <select style={s.input} value={inviteData.role} onChange={(e) => setInviteData({...inviteData, role: e.target.value})}>
                  <option value="teacher">Teacher</option>
                  <option value="administration">Admin</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                <button type="button" style={{ ...s.btnPrimary, background: "transparent", color: C.gray500, border: `1px solid ${C.gray200}` }} onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button type="submit" style={s.btnPrimary} disabled={saving}>{saving && <Loader2 size={16} className="animate-spin" />}Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
        {team.map((user, idx) => (
          <div key={user.id} style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px",
            borderBottom: idx !== team.length - 1 ? "1px solid var(--border)" : "none",
            background: "var(--surface)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ 
                width: 40, height: 40, borderRadius: "50%", 
                background: "linear-gradient(135deg, #7c3aed, #3b82f6)", 
                color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 
              }}>
                {user.firstName ? user.firstName[0].toUpperCase() : "U"}
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text)" }}>{user.firstName} {user.lastName}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{user.email} • <span style={{ textTransform: "capitalize" }}>{user.role}</span></div>
              </div>
            </div>
            <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = C.red500} onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
