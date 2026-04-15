import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  Bell, Palette, Globe, Eye, Shield, Link as LinkIcon, 
  History, HelpCircle, MessageSquare, Keyboard, Star,
  User, Settings, CreditCard, Users, ChevronRight
} from "lucide-react";
import Navbar from "../../components/Navbar";
import { useTheme } from "../../contexts/ThemeContext";

const C = {
  purple600: "#5b2d8e",
  purple500: "#7c3aed",
  purple100: "#ede9fe",
  purple50:  "#f5f3ff",
  blue600:   "#2563eb",
  gray50:    "#f9fafb",
  gray100:   "#f3f4f6",
  gray200:   "#e5e7eb",
  gray400:   "#9ca3af",
  gray500:   "#64748b",
  gray600:   "#4b5563",
  gray900:   "#111827",
  white:     "#ffffff"
};

const SECTIONS = [
  {
    label: "Account",
    items: [
      { id: "profile", label: "My Profile", desc: "Photo, name, bio", icon: User },
      { id: "account", label: "Preferences", desc: "Email, password, role", icon: Settings },
      { id: "billing", label: "Billing & Plans", desc: "Subscription, invoices", icon: CreditCard },
      { id: "team", label: "Team & Members", desc: "Invite people, manage roles", icon: Users },
    ]
  },
  {
    label: "General",
    items: [
      { id: "notifications", label: "Notifications", desc: "Alerts, emails, reminders", icon: Bell, badge: "3" },
      { id: "appearance", label: "Appearance", desc: "Theme, density, font size", icon: Palette },
      { id: "language", label: "Language & Region", desc: "Locale, timezone, date format", icon: Globe },
      { id: "accessibility", label: "Accessibility", desc: "Motion, contrast, screen reader", icon: Eye },
    ]
  },
  {
    label: "Security",
    items: [
      { id: "privacy", label: "Privacy & Security", desc: "Two-factor, sessions, data", icon: Shield },
      { id: "connected", label: "Connected Apps", desc: "OAuth, integrations, tokens", icon: LinkIcon },
      { id: "activity", label: "Activity Log", desc: "Login history, recent actions", icon: History },
    ]
  },
  {
    label: "Support",
    items: [
      { id: "help", label: "Help & Documentation", desc: "Guides, FAQs, tutorials", icon: HelpCircle },
      { id: "feedback", label: "Send Feedback", desc: "Report bugs, suggest features", icon: MessageSquare },
      { id: "shortcuts", label: "Keyboard Shortcuts", desc: "View all shortcuts", icon: Keyboard },
      { id: "whats-new", label: "What's New", desc: "Changelog & release notes", icon: Star, badge: "New", badgeColor: "#0ea5e9" },
    ]
  }
];

export default function SettingsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode: isDark } = useTheme();
  const currentPath = location.pathname.split("/").pop();

  const styles = {
    layout: {
      minHeight: "100vh",
      background: isDark ? "#0b0f19" : C.gray50,
      display: "flex",
      flexDirection: "column"
    },
    container: {
      display: "flex",
      flex: 1,
      maxWidth: 1200,
      margin: "0 auto",
      width: "100%",
      padding: "2rem 1rem",
      gap: "2.5rem"
    },
    sidebar: {
      width: 320,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem"
    },
    content: {
      flex: 1,
      minWidth: 0
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: isDark ? C.gray500 : C.gray400,
      marginBottom: "0.75rem",
      paddingLeft: "0.5rem"
    },
    navItem: (isActive) => ({
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      padding: "0.75rem 0.5rem",
      borderRadius: 12,
      cursor: "pointer",
      transition: "all 0.2s",
      background: isActive ? (isDark ? "#1e293b" : "#f5f3ff") : "transparent",
      textDecoration: "none",
      border: "none",
      width: "100%",
      textAlign: "left"
    }),
    iconWrap: (isActive) => ({
      width: 40,
      height: 40,
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: isActive ? (isDark ? C.purple600 : C.purple100) : (isDark ? "#171a2e" : C.white),
      color: isActive ? (isDark ? C.white : C.purple600) : (isDark ? C.gray400 : C.gray500),
      boxShadow: !isActive && !isDark ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
      flexShrink: 0
    }),
    textWrap: {
      flex: 1,
      minWidth: 0
    },
    label: (isActive) => ({
      fontSize: 14,
      fontWeight: isActive ? 700 : 600,
      color: isActive ? (isDark ? C.white : C.purple900) : (isDark ? C.gray100 : C.gray900),
      margin: 0
    }),
    desc: {
      fontSize: 12,
      color: isDark ? C.gray500 : C.gray500,
      margin: "2px 0 0",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    },
    badge: (color) => ({
      padding: "2px 8px",
      borderRadius: 20,
      fontSize: 10,
      fontWeight: 800,
      background: color || (isDark ? C.purple600 : C.purple100),
      color: color ? C.white : (isDark ? C.white : C.purple600),
      textTransform: "uppercase"
    })
  };

  return (
    <div style={styles.layout}>
      <Navbar />
      
      {/* Mobile Settings Header */}
      <div className="settings-mobile-header" style={{
        display: "none",
        padding: "1rem",
        background: isDark ? "rgba(17, 24, 39, 0.8)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
        position: "sticky",
        top: 70, // Height of Navbar
        zIndex: 40
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: C.gray500, textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.05em" }}>
              Settings Category
            </label>
            <select 
              value={currentPath} 
              onChange={(e) => navigate(`/settings/${e.target.value}`)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 10,
                background: isDark ? "rgba(31, 41, 55, 0.5)" : C.gray50,
                color: isDark ? C.white : C.gray900,
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : C.gray200}`,
                fontSize: 14,
                fontWeight: 600,
                outline: "none"
              }}
            >
              {SECTIONS.flatMap(s => s.items).map(item => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="settings-container" style={styles.container}>
        <style>{`
          @media (max-width: 900px) {
            .settings-container {
              flex-direction: column !important;
              padding: 1rem !important;
              gap: 1.5rem !important;
            }
            .settings-sidebar-desktop {
              display: none !important;
            }
            .settings-mobile-header {
              display: block !important;
            }
            .settings-main-content {
              padding-top: 0 !important;
            }
          }
        `}</style>

        {/* Sidebar Nav (Desktop) */}
        <aside className="settings-sidebar-desktop" style={styles.sidebar}>
          {SECTIONS.map((section) => (
            <div key={section.label}>
              <div style={styles.sectionLabel}>{section.label}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {section.items.map((item) => {
                  const isActive = currentPath === item.id;
                  return (
                    <button
                      key={item.id}
                      style={styles.navItem(isActive)}
                      onClick={() => navigate(`/settings/${item.id}`)}
                    >
                      <div style={styles.iconWrap(isActive)}>
                        <item.icon size={20} />
                      </div>
                      <div style={styles.textWrap}>
                        <p style={styles.label(isActive)}>{item.label}</p>
                        <p style={styles.desc}>{item.desc}</p>
                      </div>
                      {item.badge && (
                        <span style={styles.badge(item.badgeColor)}>{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* Dynamic Content */}
        <main className="settings-main-content" style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
