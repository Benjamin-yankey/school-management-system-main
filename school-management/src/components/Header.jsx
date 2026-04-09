import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { NotificationBell } from "../lib/NotificationService";
import {
  LogOut,
  Bell,
  Calendar,
  Settings,
  Monitor,
  Camera,
  CheckCircle2,
  XCircle,
  BellOff,
  Globe,
  Volume2,
  ShieldAlert,
  Info,
  ChevronRight,
  Building2,
  GraduationCap as SchoolIcon,
} from "lucide-react";
import "./Header.css";

const Header = () => {
  const { user, logout, updateProfile, activeAcademicYear, currentTerm } =
    useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState({
    sounds: true,
    privacy: false,
    language: "English (US)",
  });

  const fileInputRef = useRef(null);
  const settingsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const getRoleColor = (role) => {
    const colors = {
      admin: "#2563eb",
      teacher: "#10b981",
      student: "#8b5cf6",
      parent: "#f59e0b",
      superadmin: "#f43f5e",
    };
    return colors[role] || "#6b7280";
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: "Administrator",
      teacher: "Teacher",
      student: "Student",
      parent: "Parent",
      superadmin: "Super Admin",
    };
    return labels[role] || "User";
  };

  const roleColor = getRoleColor(user?.role);
  const roleLabel = getRoleLabel(user?.role);
  const avatarInitials =
    user?.name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "U";

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => updateProfile?.({ avatarUrl: reader.result });
    reader.readAsDataURL(file);
  };

  return (
    <header
      className={`app-dashboard-header ${user?.role || ""}`}
      style={{ "--role-color": roleColor }}
    >
      <div className="header-container">
        <div className="header-content">
          <div className="header-brand">
            <div className="school-logo-container">
              <div className="school-logo-icon">
                <img
                  src="/images/schoolLogo.jpeg"
                  alt="GEOZIIE Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "inherit",
                  }}
                />
              </div>
              <span className="school-logo-text">
                GEOZIIE INTERNATIONAL SCHOOL
              </span>
            </div>
            <div className="header-title">
              <p className="header-role-badge">{roleLabel} Portal</p>
              {activeAcademicYear ? (
                <div className="header-academic-year">
                  <Calendar size={14} />
                  <span>
                    {activeAcademicYear.year}{" "}
                    {currentTerm ? `— ${currentTerm.name}` : ""}
                  </span>
                </div>
              ) : (
                (user?.role === "admin" ||
                  user?.role === "administration" ||
                  user?.role === "superadmin") && (
                  <div className="header-academic-year warning">
                    <ShieldAlert size={14} />
                    <span>No Active Year</span>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="header-actions">
            <div className="header-toolbar">
              <div className="toolbar-item">
                <NotificationBell
                  token={localStorage.getItem("token")}
                  serviceUrl={
                    import.meta.env.VITE_NOTIFICATION_URL ||
                    "http://localhost:3000"
                  }
                  onOpenCenter={() => navigate("/notifications")}
                />
              </div>

              <div className="toolbar-item" ref={settingsRef}>
                <button
                  type="button"
                  className={`toolbar-btn ${isSettingsOpen ? "active" : ""}`}
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                >
                  <Settings size={20} />
                </button>
                {isSettingsOpen && (
                  <div className="toolbar-panel settings">
                    <div className="panel-header">
                      <h3>Settings & Preferences</h3>
                    </div>
                    <div className="panel-content scrolled">
                      <div className="setting-section-title">DISPLAY</div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <p>Appearance</p>
                          <span>
                            {isDarkMode ? "Dark" : "Light"} · Follows System
                          </span>
                        </div>
                        <Monitor size={18} style={{ opacity: 0.5 }} />
                      </div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <p>Language</p>
                          <span>System default</span>
                        </div>
                        <div className="setting-value">
                          <Globe size={14} /> {prefs.language}
                        </div>
                      </div>

                      <div className="setting-section-title">SYSTEM</div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <p>Sound Alerts</p>
                          <span>Action & notification chimes</span>
                        </div>
                        <button
                          className={`switch ${prefs.sounds ? "on" : ""}`}
                          onClick={() =>
                            setPrefs((p) => ({ ...p, sounds: !p.sounds }))
                          }
                        />
                      </div>
                      <div className="setting-row">
                        <div className="setting-info">
                          <p>Privacy Mode</p>
                          <span>Hide sensitive dashboard values</span>
                        </div>
                        <button
                          className={`switch ${prefs.privacy ? "on" : ""}`}
                          onClick={() =>
                            setPrefs((p) => ({ ...p, privacy: !p.privacy }))
                          }
                        />
                      </div>

                      <div className="setting-section-title">
                        ACCOUNT SECURITY
                      </div>
                      <div className="setting-row mini">
                        <div className="setting-info-row">
                          <CheckCircle2 size={14} color="#10b981" />
                          <p>Two-factor authentication enabled</p>
                        </div>
                        <ChevronRight size={14} color="#CBD5E0" />
                      </div>
                      <div className="setting-row mini">
                        <div className="setting-info-row">
                          <ShieldAlert size={14} color="#ED8936" />
                          <p>Active sessions (2 detected)</p>
                        </div>
                        <ChevronRight size={14} color="#CBD5E0" />
                      </div>

                      <div className="panel-footer">
                        <div className="footer-info">
                          <Info size={12} />
                          <span>v1.2.0 • Last login: Today, 09:42</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="toolbar-divider" />
            </div>

            <div className="user-section">
              <div className="user-info">
                <div className="user-avatar-wrapper">
                  <button
                    type="button"
                    className="user-avatar"
                    style={{ "--avatar-color": roleColor }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="P" />
                    ) : (
                      <span className="avatar-initials">{avatarInitials}</span>
                    )}
                    <span className="avatar-edit">
                      <Camera size={12} />
                    </span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </div>
                <div className="user-details">
                  <div className="user-name">{user?.name || "User"}</div>
                  <div className="user-role" style={{ color: roleColor }}>
                    {roleLabel}
                  </div>
                </div>
              </div>
              <button type="button" onClick={logout} className="logout-btn">
                <LogOut size={18} />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
