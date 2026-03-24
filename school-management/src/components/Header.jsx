import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { GraduationCap, LogOut, Bell, Settings } from "lucide-react";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();

  const getRoleColor = (role) => {
    const colors = {
      admin: "#2563eb",
      teacher: "#10b981",
      student: "#8b5cf6",
      parent: "#f59e0b",
    };
    return colors[role] || "#6b7280";
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: "Administrator",
      teacher: "Teacher",
      student: "Student",
      parent: "Parent",
    };
    return labels[role] || "User";
  };

  const roleColor = getRoleColor(user?.role);
  const roleLabel = getRoleLabel(user?.role);

  return (
    <header className="dashboard-header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo and Title */}
          <div className={`header-brand ${user?.role}`}>
            <div className="header-logo">
              <GraduationCap />
            </div>
            <div className="header-title">
              <h1 className="header-app-name">SchoolSync Pro</h1>
              <p className="header-role-badge">{roleLabel} Dashboard</p>
            </div>
          </div>

          {/* Right Side - Notifications and User Menu */}
          <div className="header-actions">
            {/* Notifications */}
            <button className="notification-btn" title="Notifications">
              <Bell />
              <span className="notification-badge"></span>
            </button>

            {/* Settings */}
            <button className="settings-btn" title="Settings">
              <Settings />
            </button>

            {/* User Profile */}
            <div className="user-section">
              <div className="user-info">
                <div
                  className="user-avatar"
                  style={{ backgroundColor: roleColor }}
                >
                  {user?.avatar || "U"}
                </div>
                <div className="user-details">
                  <div className="user-name">{user?.name}</div>
                  <div className="user-role" style={{ color: roleColor }}>
                    {roleLabel}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button onClick={logout} className="logout-btn" title="Logout">
                <LogOut />
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
