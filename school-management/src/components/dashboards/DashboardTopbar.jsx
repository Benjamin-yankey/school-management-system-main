// DashboardTopbar.jsx — Slim top bar with theme toggle, help, notifications, and profile

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

const C = {
  purple500: "#7c3aed",
  purple400: "#a855f7",
  purple100: "#ede9fe",
  purple50:  "#f5f3ff",
  blue500:   "#3b82f6",
  white:     "#ffffff",
  gray50:    "#f9fafb",
  gray100:   "#f3f4f6",
  gray200:   "#e5e7eb",
  gray300:   "#d1d5db",
  gray400:   "#9ca3af",
  gray500:   "#6b7280",
  gray600:   "#4b5563",
  gray800:   "#1f2937",
  gray900:   "#111827",
  red500:    "#ef4444",
};

// ── Icons ──
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

/**
 * @param {Object} props
 * @param {function} props.onMenuToggle — Called when hamburger is clicked (mobile)
 * @param {string} [props.pageTitle] — Optional page title
 */
export default function DashboardTopbar({ onMenuToggle, pageTitle, sidebarWidth = 260 }) {
  const { user: authUser, logout } = useAuth();
  const { isDarkMode, setThemeMode, themeMode, formatTime, formatDate } = useTheme();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [now, setNow] = useState(new Date());

  // Update clock every 10 seconds (sufficient for H:mm display)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const displayName = authUser?.name || [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ") || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const displayRole = authUser?.role || "user";

  const toggleTheme = () => {
    if (isDarkMode) {
      setThemeMode("light");
    } else {
      setThemeMode("dark");
    }
  };

  const s = {
    topbar: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      background: isDarkMode ? C.gray900 : C.white,
      borderBottom: `1px solid ${isDarkMode ? C.gray800 : C.gray200}`,
      padding: "0 24px",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginLeft: sidebarWidth,
      boxShadow: isDarkMode ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.04)",
      transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease",
    },
    left: {
      display: "flex",
      alignItems: "center",
      gap: 16,
    },
    menuBtn: {
      display: "none",
      width: 40,
      height: 40,
      borderRadius: 10,
      border: "none",
      background: "transparent",
      color: isDarkMode ? C.gray300 : C.gray600,
      cursor: "pointer",
      alignItems: "center",
      justifyContent: "center",
      transition: "background 0.15s",
    },
    pageTitle: {
      fontSize: 16,
      fontWeight: 700,
      color: isDarkMode ? C.white : C.gray900,
      letterSpacing: "-0.01em",
    },
    right: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: "50%",
      border: `1px solid ${isDarkMode ? C.gray800 : C.gray200}`,
      background: isDarkMode ? C.gray800 : C.gray50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: isDarkMode ? C.gray300 : C.gray600,
      position: "relative",
      transition: "all 0.15s ease",
    },
    themeLabel: {
      fontSize: 11,
      fontWeight: 600,
      color: isDarkMode ? C.gray400 : C.gray500,
      display: "none", // Hidden on small screens, can be shown on larger
    },
    notifDot: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 7,
      height: 7,
      borderRadius: "50%",
      background: C.red500,
      border: `2px solid ${isDarkMode ? C.gray800 : C.white}`,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${C.purple500}, ${C.blue500})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 700,
      color: C.white,
      cursor: "pointer",
      overflow: "hidden",
      border: profileOpen ? `2px solid ${C.purple400}` : "2px solid transparent",
      transition: "border 0.15s",
    },
    dropdown: {
      position: "absolute",
      top: "calc(100% + 8px)",
      right: 0,
      width: 220,
      background: isDarkMode ? C.gray900 : C.white,
      border: `1px solid ${isDarkMode ? C.gray800 : C.gray200}`,
      borderRadius: 12,
      boxShadow: isDarkMode ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.10)",
      overflow: "hidden",
      zIndex: 50,
    },
    dropdownItem: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 16px",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 500,
      color: isDarkMode ? C.gray300 : C.gray600,
      border: "none",
      background: "transparent",
      width: "100%",
      textAlign: "left",
      fontFamily: "inherit",
      transition: "background 0.12s",
    },
  };

  return (
    <div style={s.topbar} className="dash-topbar">
      <style>{`
        @media (max-width: 900px) {
          .dash-topbar {
            margin-left: 0 !important;
            padding: 0 16px !important;
          }
          .dash-topbar-menu-btn {
            display: flex !important;
          }
          @media (max-width: 640px) {
            .topbar-clock {
              display: none !important;
            }
          }
        }
      `}</style>

      {/* Left */}
      <div style={s.left}>
        <button
          className="dash-topbar-menu-btn"
          style={s.menuBtn}
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>
        {pageTitle && <span style={s.pageTitle}>{pageTitle}</span>}
      </div>

      {/* Right */}
      <div style={s.right}>
        {/* Localization Clock */}
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          alignItems: "flex-end", 
          marginRight: 12,
          paddingRight: 12,
          borderRight: `1px solid ${isDarkMode ? C.gray800 : C.gray200}`,
          userSelect: "none"
        }} className="topbar-clock">
          <div style={{ 
            fontSize: 13, 
            fontWeight: 700, 
            color: isDarkMode ? C.white : C.gray900,
            fontFamily: "monospace",
            letterSpacing: "0.05em"
          }}>
            {formatTime(now, { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ 
            fontSize: 9, 
            fontWeight: 600, 
            color: isDarkMode ? C.gray400 : C.gray500,
            textTransform: "uppercase",
            letterSpacing: "0.02em"
          }}>
            {formatDate(now, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          className="dash-topbar-theme-toggle"
          style={s.iconBtn}
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? "#374151" : "#e5e7eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDarkMode ? C.gray800 : C.gray50;
          }}
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* Help */}
        <button
          className="dash-topbar-help"
          style={s.iconBtn}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('toggleSupportChat', { detail: { open: true } }));
          }}
          title="Open Support Chat"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? "#374151" : "#e5e7eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDarkMode ? C.gray800 : C.gray50;
          }}
        >
          <HelpIcon />
        </button>

        {/* Notifications */}
        <button
          style={s.iconBtn}
          onClick={() => navigate("/notifications")}
          title="Notifications"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDarkMode ? "#374151" : "#e5e7eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDarkMode ? C.gray800 : C.gray50;
          }}
        >
          <BellIcon />
          <span style={s.notifDot} />
        </button>

        {/* Profile */}
        <div style={{ position: "relative" }} ref={profileRef}>
          <div
            className="dash-topbar-profile-trigger"
            style={s.avatar}
            onClick={() => setProfileOpen((v) => !v)}
            title="Profile menu"
            role="button"
          >
            {authUser?.avatarUrl ? (
              <img src={authUser.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initials
            )}
          </div>

          {profileOpen && (
            <div style={s.dropdown}>
              {/* User info */}
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${isDarkMode ? C.gray800 : C.gray200}` }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: isDarkMode ? C.white : C.gray900 }}>{displayName}</div>
                <div style={{ fontSize: 11, color: isDarkMode ? C.gray400 : C.gray500, marginTop: 2 }}>
                  {displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}
                </div>
              </div>

              {/* Menu items */}
              <button
                style={s.dropdownItem}
                onClick={() => { setProfileOpen(false); navigate("/settings/profile"); }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? C.gray800 : C.gray100}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                My Profile
              </button>
              <button
                style={s.dropdownItem}
                onClick={() => { setProfileOpen(false); navigate("/settings/account"); }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? C.gray800 : C.gray100}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Settings
              </button>

              <div style={{ height: 1, background: isDarkMode ? C.gray800 : C.gray200, margin: "4px 0" }} />

              <button
                style={{ ...s.dropdownItem, color: C.red500 }}
                onClick={() => { setProfileOpen(false); logout(); }}
                onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? "#3f1a1a" : "#fef2f2"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
