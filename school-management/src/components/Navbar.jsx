import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  purple900: "#1e0a3c",
  purple800: "#2d1257",
  purple600: "#5b2d8e",
  purple500: "#7c3aed",
  purple400: "#a855f7",
  purple100: "#ede9fe",
  purple50:  "#f5f3ff",
  blue600:   "#2563eb",
  blue500:   "#3b82f6",
  blue100:   "#dbeafe",
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
  red400:    "#f87171",
  red50:     "#fef2f2",
};

// ── Icons (inline SVG) ────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor", strokeWidth = 1.8, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

const BellIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const SearchIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MenuIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Menu item data ────────────────────────────────────────────────────────────
const MENU_SECTIONS = [
  {
    label: "Account",
    items: [
      {
        id: "profile",
        label: "My Profile",
        desc: "Photo, name, bio",
        icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      },
      {
        id: "account",
        label: "Account Settings",
        desc: "Email, password, username",
        icon: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z",
      },
      {
        id: "billing",
        label: "Billing & Plans",
        desc: "Subscription, invoices",
        icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3z",
      },
      {
        id: "team",
        label: "Team & Members",
        desc: "Invite people, manage roles",
        icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
      },
    ],
  },
  {
    label: "Preferences",
    items: [
      {
        id: "notifications",
        label: "Notifications",
        desc: "Alerts, emails, reminders",
        icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
        badge: "3",
      },
      {
        id: "appearance",
        label: "Appearance",
        desc: "Theme, density, font size",
        icon: "M12 3v1m0 16v1m8.66-13l-.87.5M4.21 17.5l-.87.5M20.66 17.5l-.87-.5M4.21 6.5l-.87-.5M21 12h-1M4 12H3 M12 7a5 5 0 1 0 0 10A5 5 0 0 0 12 7z",
      },
      {
        id: "language",
        label: "Language & Region",
        desc: "Locale, timezone, date format",
        icon: "M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
      },
      {
        id: "accessibility",
        label: "Accessibility",
        desc: "Motion, contrast, screen reader",
        icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4l3 3",
      },
    ],
  },
  {
    label: "Security",
    items: [
      {
        id: "privacy",
        label: "Privacy & Security",
        desc: "Two-factor, sessions, data",
        icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
      },
      {
        id: "connected",
        label: "Connected Apps",
        desc: "OAuth, integrations, tokens",
        icon: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
      },
      {
        id: "activity",
        label: "Activity Log",
        desc: "Login history, recent actions",
        icon: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        id: "help",
        label: "Help & Documentation",
        desc: "Guides, FAQs, tutorials",
        icon: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3 M12 17h.01",
      },
      {
        id: "feedback",
        label: "Send Feedback",
        desc: "Report bugs, suggest features",
        icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
      },
      {
        id: "shortcuts",
        label: "Keyboard Shortcuts",
        desc: "View all shortcuts",
        icon: "M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3z",
      },
      {
        id: "whats-new",
        label: "What's New",
        desc: "Changelog & release notes",
        icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
        badge: "New",
        badgeColor: C.blue500,
      },
    ],
  },
];

// ── Styles ────────────────────────────────────────────────────────────────────
const getStyles = (isDark, isMobile = false) => ({
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: isDark ? C.gray900 : C.white,
    borderBottom: `1px solid ${isDark ? C.gray800 : C.gray200}`,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: isMobile ? "0 1rem" : "0 1.75rem",
    height: 70, // Slightly bigger
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.04)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
  },
  logoMark: {
    width: 36, // Bigger
    height: 36,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: "transparent",
  },
  logoText: {
    fontSize: isMobile ? 13 : 15,
    fontWeight: 800,
    color: isDark ? C.white : C.purple500,
    letterSpacing: "-0.01em",
    whiteSpace: isMobile ? "normal" : "nowrap",
    maxWidth: isMobile ? "120px" : "none",
    lineHeight: 1.2,
  },
  navLinks: {
    display: "flex",
    gap: "0.25rem",
    marginLeft: "2rem",
  },
  navLink: {
    fontSize: 14,
    color: isDark ? C.gray400 : C.gray600,
    textDecoration: "none",
    padding: "8px 14px",
    borderRadius: 10,
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
    background: "transparent",
    border: "none",
    fontFamily: "inherit",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12, // Increased spacing
  },
  iconBtn: {
    width: 40, // Bigger
    height: 40,
    borderRadius: "50%",
    border: `1px solid ${isDark ? C.gray800 : C.gray200}`,
    background: isDark ? C.gray800 : C.gray50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: isDark ? C.gray300 : C.gray600,
    position: "relative",
    transition: "border-color 0.15s, background 0.15s",
  },
  notifDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: C.red500,
    border: `2px solid ${isDark ? C.gray800 : C.white}`,
  },
  avatar: {
    width: 40, // Bigger
    height: 40,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${C.purple500}, ${C.blue500})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 700,
    color: C.white,
    cursor: "pointer",
    border: `2px solid transparent`,
    outline: `2px solid transparent`,
    transition: "outline 0.15s",
    userSelect: "none",
    overflow: "hidden",
  },
  // dropdown
  dropdown: {
    position: "absolute",
    top: "calc(100% + 12px)",
    right: isMobile ? -10 : 0,
    width: isMobile ? "90vw" : 320, // Bigger dropdown
    maxWidth: 320,
    background: isDark ? C.gray900 : C.white,
    border: `1px solid ${isDark ? C.gray800 : C.gray200}`,
    borderRadius: 16,
    boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.10)",
    overflow: "hidden",
    zIndex: 50,
    maxHeight: "80vh",
    overflowY: "auto",
  },
  userHeader: {
    padding: "18px 18px 16px",
    borderBottom: `1px solid ${isDark ? C.gray800 : C.gray100}`,
    background: isDark ? "#171427" : C.purple50,
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  bigAvatar: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: `linear-gradient(135deg, ${C.purple500}, ${C.blue500})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    color: C.white,
    flexShrink: 0,
    overflow: "hidden",
  },
  userName: {
    fontSize: 15,
    fontWeight: 600,
    color: isDark ? C.white : C.purple900,
    margin: 0,
  },
  userEmail: {
    fontSize: 13,
    color: isDark ? C.gray400 : C.gray600,
    margin: "2px 0 0",
  },
  roleBadge: {
    display: "inline-block",
    marginTop: 6,
    fontSize: 10,
    fontWeight: 700,
    color: isDark ? C.white : C.purple600,
    background: isDark ? C.purple600 : C.purple100,
    borderRadius: 20,
    padding: "2px 8px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  searchWrap: {
    padding: "12px 14px",
    borderBottom: `1px solid ${isDark ? C.gray800 : C.gray100}`,
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: isDark ? C.gray500 : C.gray400,
  },
  searchInput: {
    border: "none",
    outline: "none",
    fontSize: 13,
    color: isDark ? C.gray100 : C.gray900,
    background: "transparent",
    width: "100%",
    fontFamily: "inherit",
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: isDark ? C.gray500 : C.gray400,
    padding: "12px 16px 4px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    cursor: "pointer",
    transition: "background 0.12s",
    textDecoration: "none",
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: isDark ? "#2a1b41" : C.purple50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: isDark ? C.purple400 : C.purple500,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: isDark ? C.gray100 : C.gray900,
    margin: 0,
  },
  menuDesc: {
    fontSize: 11,
    color: isDark ? C.gray500 : C.gray400,
    margin: "2px 0 0",
  },
  badge: {
    marginLeft: "auto",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 20,
    background: isDark ? C.purple600 : C.purple100,
    color: isDark ? C.white : C.purple600,
    flexShrink: 0,
  },
  divider: {
    height: 1,
    background: isDark ? C.gray800 : C.gray100,
    margin: "4px 0",
  },
  signOut: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    cursor: "pointer",
    color: isDark ? C.red400 : C.red500,
    fontSize: 13,
    fontWeight: 500,
    transition: "background 0.12s",
  },
});

// ── Component ─────────────────────────────────────────────────────────────────
export default function Navbar() {
  const { user: authUser, logout } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 960);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const s = getStyles(isDarkMode, isMobile);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const displayName = authUser?.name || [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ") || "User";
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const displayEmail = authUser?.email || "user@geozii.com";
  const displayRole = authUser?.role || "user";

  const toggleNotifications = () => {
    navigate("/notifications");
  };

  const filtered = MENU_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items.filter(
      (item) =>
        !search ||
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((sec) => sec.items.length > 0);

  // Dynamic nav links based on role
  let navLinks = [];
  if (displayRole === "superadmin") {
    navLinks = [
      { name: "Global Dashboard", path: "/superadmin" },
    ];
  } else if (displayRole === "admin" || displayRole === "administration") {
    navLinks = [
      { name: "Admin Dashboard", path: "/admin/dashboard" },
    ];
  } else if (displayRole === "teacher") {
    navLinks = [
      { name: "Teacher Portal", path: "/teacher/dashboard" },
    ];
  } else if (displayRole === "student") {
    navLinks = [
      { name: "Dashboard", path: "/student/dashboard" },
      { name: "Assignments", path: "/student/assignments" },
      { name: "Grades", path: "/student/grades" },
      { name: "Timetable", path: "/student/timetable" },
    ];
  } else if (displayRole === "parent") {
    navLinks = [
      { name: "Parent Portal", path: "/parent/dashboard" },
    ];
  }

  const navigateTo = (path) => {
    navigate(path);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
    <nav style={s.nav}>
      {/* Left — logo + links */}
      <div style={{ display: "flex", alignItems: "center" }}>
        {isMobile && (
          <button
            style={{ ...s.iconBtn, marginRight: "12px", border: "none", background: "transparent", color: isDarkMode ? C.white : C.purple600 }}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        )}
        <div style={s.logo} onClick={() => navigate("/")}>
          <div style={s.logoMark}>
            <img src="/images/schoolLogo.jpeg" alt="GEOZIIE Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={s.logoText}>GEOZIIE INTERNATIONAL SCHOOL</span>
        </div>
        {!isMobile && (
          <div style={s.navLinks}>
            {navLinks.map((link) => {
            const isLinkActive = isActive(link.path);
            const isHovered = hoveredLink === link.name;
            return (
              <button
                key={link.name}
                style={{
                  ...s.navLink,
                  background: isLinkActive || isHovered ? (isDarkMode ? C.gray800 : C.purple50) : "transparent",
                  color: isLinkActive || isHovered ? (isDarkMode ? C.white : C.purple600) : (isDarkMode ? C.gray400 : C.gray600),
                  fontWeight: isLinkActive ? 600 : "normal",
                }}
                onClick={() => navigateTo(link.path)}
                onMouseEnter={() => setHoveredLink(link.name)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                {link.name}
              </button>
            );
          })}
          </div>
        )}
      </div>

      {/* Right — bell + profile */}
      <div style={s.right} ref={ref}>
        {/* Bell */}
        <button
          style={{
            ...s.iconBtn,
            borderColor: hovered === "bell" ? (isDarkMode ? C.purple500 : C.purple400) : (isDarkMode ? C.gray800 : C.gray200),
            background: hovered === "bell" ? (isDarkMode ? C.gray800 : C.purple50) : (isDarkMode ? C.gray800 : C.gray50),
          }}
          onMouseEnter={() => setHovered("bell")}
          onMouseLeave={() => setHovered(null)}
          onClick={toggleNotifications}
          title="Notifications"
        >
          <BellIcon />
          <span style={s.notifDot} />
        </button>

        {/* Profile avatar */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              ...s.avatar,
              outline: open ? `2px solid ${C.purple400}` : "2px solid transparent",
              outlineOffset: 2,
            }}
            onClick={() => setOpen((v) => !v)}
            title="Open profile menu"
            role="button"
            aria-haspopup="true"
            aria-expanded={open}
          >
            {authUser?.avatarUrl ? (
              <img src={authUser.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initials
            )}
          </div>

          {/* Dropdown */}
          {open && (
            <div style={s.dropdown}>
              {/* User header */}
              <div style={s.userHeader}>
                <div style={s.userRow}>
                  <div style={s.bigAvatar}>
                    {authUser?.avatarUrl ? (
                      <img src={authUser.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      initials
                    )}
                  </div>
                  <div>
                    <p style={s.userName}>{displayName}</p>
                    <p style={s.userEmail}>{displayEmail}</p>
                    <span style={s.roleBadge}>{displayRole}</span>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div style={s.searchWrap}>
                <SearchIcon />
                <input
                  style={s.searchInput}
                  placeholder="Search settings…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Sections */}
              {filtered.map((section) => (
                <div key={section.label}>
                  <div style={s.sectionLabel}>{section.label}</div>
                  {section.items.map((item) => (
                    <MenuItem
                      key={item.id}
                      item={item}
                      onClick={() => { 
                        setOpen(false); 
                        setSearch(""); 
                        const settingsTabs = ["profile", "account", "billing", "team", "notifications", "appearance", "language", "accessibility", "privacy", "connected", "activity", "help", "feedback", "shortcuts", "whats-new"];
                        if (settingsTabs.includes(item.id)) {
                          navigate(`/settings/${item.id}`);
                        }
                      }}
                    />
                  ))}
                </div>
              ))}

              {filtered.length === 0 && (
                <div style={{ padding: "20px 16px", textAlign: "center", color: isDarkMode ? C.gray500 : C.gray400, fontSize: 13 }}>
                  No results for "{search}"
                </div>
              )}

              {/* Sign out */}
              <div style={s.divider} />
              <SignOutRow onSignOut={() => { setOpen(false); logout(); }} />
            </div>
          )}
        </div>
      </div>
    </nav>
    
    {/* Mobile Sliding Menu Overlay */}
    {isMobile && mobileMenuOpen && (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: isDarkMode ? "rgba(17, 24, 39, 0.95)" : "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex", flexDirection: "column"
      }}>
        <div style={{ padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${isDarkMode ? C.gray800 : C.gray200}` }}>
          <div style={s.logo}>
            <div style={s.logoMark}>
              <img src="/images/schoolLogo.jpeg" alt="GEOZIIE Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <span style={{ ...s.logoText, display: "block", fontSize: 13, whiteSpace: "normal" }}>GEOZIIE INTERNATIONAL SCHOOL</span>
          </div>
          <button style={{ ...s.iconBtn, border: "none", background: "transparent" }} onClick={() => setMobileMenuOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <div style={{ padding: "2rem 1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          {navLinks.map((link) => (
            <button
              key={link.name}
              style={{
                ...s.navLink,
                fontSize: "1.1rem",
                padding: "16px",
                textAlign: "left",
                background: isActive(link.path) ? (isDarkMode ? C.gray800 : C.purple50) : "transparent",
                color: isActive(link.path) ? (isDarkMode ? C.white : C.purple600) : (isDarkMode ? C.gray300 : C.gray700),
                fontWeight: isActive(link.path) ? 600 : "normal",
              }}
              onClick={() => { setMobileMenuOpen(false); navigateTo(link.path); }}
            >
              {link.name}
            </button>
          ))}
        </div>
      </div>
    )}
    </>
  );
}

function MenuItem({ item, onClick }) {
  const { isDarkMode } = useTheme();
  const s = getStyles(isDarkMode);
  const [hov, setHov] = useState(false);
  const badgeColor = item.badgeColor || (isDarkMode ? C.white : C.purple600);
  const badgeBg = item.badgeColor ? (isDarkMode ? C.blue600 : C.blue100) : (isDarkMode ? C.purple600 : C.purple100);

  return (
    <div
      style={{
        ...s.menuItem,
        background: hov ? (isDarkMode ? C.gray800 : C.purple50) : "transparent",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      role="menuitem"
    >
      <div style={{ ...s.menuIcon, background: hov ? (isDarkMode ? "#3c265e" : C.purple100) : (isDarkMode ? "#2a1b41" : C.purple50) }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? C.purple400 : C.purple500} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          {item.icon.split(" M").map((segment, i) => (
            <path key={i} d={i === 0 ? segment : "M" + segment} />
          ))}
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={s.menuLabel}>{item.label}</p>
        <p style={s.menuDesc}>{item.desc}</p>
      </div>
      {item.badge && (
        <span style={{ ...s.badge, background: badgeBg, color: badgeColor }}>
          {item.badge}
        </span>
      )}
    </div>
  );
}

function SignOutRow({ onSignOut }) {
  const { isDarkMode } = useTheme();
  const s = getStyles(isDarkMode);
  const [hov, setHov] = useState(false);
  
  return (
    <div
      style={{ ...s.signOut, background: hov ? (isDarkMode ? "#3f1a1a" : C.red50) : "transparent" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onSignOut}
      role="menuitem"
    >
      <div style={{ ...s.menuIcon, background: hov ? (isDarkMode ? "#5c1b1b" : "#fee2e2") : (isDarkMode ? C.gray800 : C.gray100), color: isDarkMode ? C.red400 : C.red500 }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </div>
      <span>Sign out</span>
    </div>
  );
}
