import React, { useState } from "react";
import { Shield, Smartphone, Monitor, Globe, Bell, User, History, LogOut, Lock, CreditCard, LifeBuoy, MessageSquare, Book, Mail } from "lucide-react";
import { useTheme as useAppTheme } from "../../contexts/ThemeContext";

const C = {
  purple600: "#5b2d8e",
  purple500: "#7c3aed",
  purple50:  "#f5f3ff",
  gray100:   "#f3f4f6",
  gray200:   "#e5e7eb",
  gray400:   "#9ca3af",
  gray500:   "#64748b",
  gray600:   "#4b5563",
  gray900:   "#111827",
  white:     "#ffffff",
  red500:    "#ef4444",
  green500:  "#10b981",
};

export default function SecuritySettings() {
  const { isDarkMode: isDark } = useAppTheme();
  const [twoFactor, setTwoFactor] = useState(false);

  const s = {
    panel: {
      background: isDark ? "#111827" : C.white,
      borderRadius: 16,
      border: `1px solid ${isDark ? "#1f2937" : C.gray200}`,
      padding: "2rem",
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      marginBottom: "2rem"
    },
    title: { fontSize: 18, fontWeight: 700, color: isDark ? C.white : C.gray900, marginBottom: "1.5rem" },
    desc: { fontSize: 14, color: C.gray500, marginBottom: "2rem" },
    card: {
      border: `1px solid ${isDark ? "#1f2937" : C.gray200}`,
      borderRadius: 12, padding: "1rem", marginBottom: "1rem",
      display: "flex", justifyContent: "space-between", alignItems: "center"
    },
    btnPrimary: {
      background: C.purple600, color: C.white, border: "none", padding: "8px 16px",
      borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
    },
    btnSecondary: {
      background: "transparent", color: C.gray500, border: `1px solid ${C.gray200}`,
      padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Privacy & Security */}
      <div style={s.panel}>
        <h2 style={s.title}>Privacy & Security</h2>
        <div style={s.card}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? "rgba(124, 58, 237, 0.1)" : C.purple50, display: "flex", alignItems: "center", justifyContent: "center", color: C.purple600 }}>
              <Smartphone size={20} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>Two-Factor Authentication (2FA)</div>
              <div style={{ fontSize: 12, color: C.gray500 }}>Add an extra layer of security to your account.</div>
            </div>
          </div>
          <button style={twoFactor ? s.btnSecondary : s.btnPrimary} onClick={() => setTwoFactor(!twoFactor)}>
            {twoFactor ? "Disable" : "Enable"}
          </button>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 600, color: isDark ? C.white : C.gray900, margin: "2rem 0 1rem" }}>Active Sessions</h3>
        <div style={{ borderRadius: 10, border: `1px solid ${isDark ? "#1f2937" : C.gray200}`, overflow: "hidden" }}>
          {[
            { device: "MacBook Pro 14\"", location: "Accra, GH", current: true, time: "Now" },
            { device: "iPhone 15 Pro Plus", location: "Lagos, NG", current: false, time: "2 hours ago" }
          ].map((session, idx) => (
            <div key={idx} style={{ 
              display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px",
              borderBottom: idx === 0 ? `1px solid ${isDark ? "#1f2937" : C.gray200}` : "none",
              background: isDark ? "#111827" : C.white
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Monitor size={16} color={C.gray400} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{session.device} {session.current && <span style={{ color: C.green500, fontSize: 11, marginLeft: 8 }}>(Current)</span>}</div>
                  <div style={{ fontSize: 11, color: C.gray500 }}>{session.location} • {session.time}</div>
                </div>
              </div>
              {!session.current && <button style={{ background: "none", border: "none", color: C.red500, fontSize: 12, cursor: "pointer" }}>Revoke</button>}
            </div>
          ))}
        </div>
      </div>

      {/* Connected Apps */}
      <div style={s.panel}>
        <h2 style={s.title}>Connected Apps</h2>
        {[
          { id: "google", label: "Google Workspace", desc: "Calendar, Meet and Drive integration.", icon: Globe },
          { id: "slack", label: "Slack Connect", desc: "Receive real-time notifications in your channels.", icon: Bell }
        ].map(app => (
          <div key={app.id} style={s.card}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? "#1f2937" : C.gray100, display: "flex", alignItems: "center", justifyContent: "center", color: C.purple600 }}>
                <app.icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{app.label}</div>
                <div style={{ fontSize: 12, color: C.gray500 }}>{app.desc}</div>
              </div>
            </div>
            <button style={s.btnSecondary}>Connect</button>
          </div>
        ))}
      </div>

      {/* Activity Log */}
      <div style={s.panel}>
        <h2 style={s.title}>Activity Log</h2>
        <div style={{ borderRadius: 10, border: `1px solid ${isDark ? "#1f2937" : C.gray200}`, overflow: "hidden" }}>
          {[
            { action: "Profile Updated", details: "Changed display name and phone number", time: "Oct 24, 10:45 AM", icon: User },
            { action: "Login Success", details: "Chrome on macOS (192.168.1.1)", time: "Oct 24, 09:12 AM", icon: LogOut },
            { action: "Password Changed", details: "Security credentials updated", time: "Oct 20, 02:30 PM", icon: Lock }
          ].map((item, idx) => (
            <div key={idx} style={{ 
              display: "flex", gap: "1rem", padding: "16px",
              borderBottom: idx !== 2 ? `1px solid ${isDark ? "#1f2937" : C.gray200}` : "none",
              background: isDark ? "#111827" : C.white
            }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: isDark ? "#1f2937" : C.gray100, display: "flex", alignItems: "center", justifyContent: "center", color: C.gray500 }}>
                <item.icon size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{item.action}</span>
                  <span style={{ fontSize: 12, color: C.gray500 }}>{item.time}</span>
                </div>
                <div style={{ fontSize: 12, color: C.gray500 }}>{item.details}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
