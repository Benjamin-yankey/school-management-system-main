import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  GraduationCap,
  LogOut,
  Bell,
  Settings,
  Moon,
  Sun,
  Camera,
  ShieldCheck,
  Mail,
  MapPin,
  Briefcase,
  Clock3,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import "./Header.css";

const roleProfiles = {
  admin: {
    title: "Lead Administrator",
    summary:
      "Manage admissions, staffing, school operations, and platform activity from one organized control center.",
    workspace: "Administration Hub",
    location: "Main Campus",
    availability: "08:00 - 17:00 GMT",
    access: "Full platform access",
    status: "Online and monitoring",
  },
  teacher: {
    title: "Classroom Lead",
    summary:
      "Track lessons, attendance, and student progress from a single teaching workspace.",
    workspace: "Teaching Desk",
    location: "Academic Wing",
    availability: "Teaching hours active",
    access: "Academic tools access",
    status: "Ready for class",
  },
  student: {
    title: "Student Workspace",
    summary:
      "Stay connected to classes, assignments, and personal progress with one focused dashboard.",
    workspace: "Learning Center",
    location: "Student Portal",
    availability: "Available all day",
    access: "Personal learning access",
    status: "Learning session active",
  },
  parent: {
    title: "Family Overview",
    summary:
      "Follow attendance, progress, and school updates in one clear family-focused view.",
    workspace: "Parent Portal",
    location: "Family Access",
    availability: "Available on demand",
    access: "Student monitoring access",
    status: "Connected to updates",
  },
};

const createNotifications = (role, workspace) => {
  const notificationsByRole = {
    admin: [
      {
        id: "admissions-review",
        title: "Admissions approvals pending",
        description:
          "Three new student applications are waiting for approval in your administration queue.",
        time: "5 min ago",
        tag: "Approvals",
        channel: "status",
        icon: Bell,
        read: false,
      },
      {
        id: "daily-digest",
        title: "Daily admin digest prepared",
        description: `A fresh summary for ${workspace} is ready and linked to your account inbox.`,
        time: "18 min ago",
        tag: "Email Digest",
        channel: "email",
        icon: Mail,
        read: false,
      },
      {
        id: "security-check",
        title: "Security check completed",
        description:
          "All administrator sessions were verified successfully with no unusual activity detected.",
        time: "42 min ago",
        tag: "Security",
        channel: "status",
        icon: ShieldCheck,
        read: true,
      },
      {
        id: "attendance-reminder",
        title: "Attendance review closes soon",
        description:
          "Today's attendance submissions should be reviewed before the end of the day.",
        time: "Today",
        tag: "Reminder",
        channel: "status",
        icon: Clock3,
        read: false,
      },
    ],
    teacher: [
      {
        id: "lesson-update",
        title: "Lesson plan synced",
        description: "Your class materials were updated successfully for today.",
        time: "10 min ago",
        tag: "Classroom",
        channel: "status",
        icon: Bell,
        read: false,
      },
      {
        id: "teacher-digest",
        title: "Teaching digest sent",
        description: `Your latest ${workspace.toLowerCase()} summary is available in email.`,
        time: "30 min ago",
        tag: "Email Digest",
        channel: "email",
        icon: Mail,
        read: true,
      },
    ],
    student: [
      {
        id: "assignment-reminder",
        title: "Assignment deadline coming up",
        description: "A class assignment is due later today. Review your task list.",
        time: "25 min ago",
        tag: "Reminder",
        channel: "status",
        icon: Clock3,
        read: false,
      },
      {
        id: "student-digest",
        title: "Progress summary sent",
        description: "A learning summary was shared to your linked email account.",
        time: "1 hr ago",
        tag: "Email Digest",
        channel: "email",
        icon: Mail,
        read: true,
      },
    ],
    parent: [
      {
        id: "attendance-alert",
        title: "Attendance update available",
        description: "A new attendance status was posted for your child today.",
        time: "12 min ago",
        tag: "Family Update",
        channel: "status",
        icon: Bell,
        read: false,
      },
      {
        id: "parent-summary",
        title: "Parent summary delivered",
        description: "Your latest family report was sent to your email inbox.",
        time: "55 min ago",
        tag: "Email Digest",
        channel: "email",
        icon: Mail,
        read: true,
      },
    ],
  };

  return notificationsByRole[role] || notificationsByRole.student;
};

const Header = () => {
  const { user, logout, updateProfile } = useAuth();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    statusUpdates: true,
  });
  const fileInputRef = useRef(null);
  const notificationMenuRef = useRef(null);
  const settingsMenuRef = useRef(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem("schoolsync_theme");
    const storedPreferences = localStorage.getItem(
      "schoolsync_header_preferences",
    );
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = storedTheme || (prefersDark ? "dark" : "light");
    setIsDarkMode(theme === "dark");
    document.body.setAttribute("data-theme", theme);

    if (storedPreferences) {
      try {
        setPreferences((prev) => ({
          ...prev,
          ...JSON.parse(storedPreferences),
        }));
      } catch (error) {
        console.error("Unable to load header preferences", error);
      }
    }
  }, []);

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
  const profile = roleProfiles[user?.role] || roleProfiles.student;
  const showProfileShowcase =
    user?.role === "admin" && location.pathname === "/admin/dashboard";
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const themeLabel = isDarkMode ? "Dark interface" : "Light interface";
  const avatarInitials =
    user?.avatar ||
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "U";

  const profileHighlights = [
    {
      icon: ShieldCheck,
      label: "Access Level",
      value: profile.access,
    },
    {
      icon: Briefcase,
      label: "Workspace",
      value: profile.workspace,
    },
    {
      icon: MapPin,
      label: "Coverage",
      value: profile.location,
    },
    {
      icon: Clock3,
      label: "Availability",
      value: profile.availability,
    },
  ];
  const visibleNotifications = notifications.filter((notification) => {
    if (notification.channel === "email" && !preferences.emailAlerts) {
      return false;
    }

    if (notification.channel === "status" && !preferences.statusUpdates) {
      return false;
    }

    return true;
  });
  const unreadCount = visibleNotifications.filter(
    (notification) => !notification.read,
  ).length;

  useEffect(() => {
    setNotifications(createNotifications(user?.role, profile.workspace));
  }, [profile.workspace, user?.role]);

  useEffect(() => {
    localStorage.setItem(
      "schoolsync_header_preferences",
      JSON.stringify(preferences),
    );
  }, [preferences]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationMenuRef.current &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }

      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target)
      ) {
        setIsSettingsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleThemeToggle = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      const theme = next ? "dark" : "light";
      document.body.setAttribute("data-theme", theme);
      localStorage.setItem("schoolsync_theme", theme);
      return next;
    });
  };

  const handleNotificationsToggle = () => {
    setIsNotificationsOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsSettingsOpen(false);
      }
      return next;
    });
  };

  const handleSettingsToggle = () => {
    setIsSettingsOpen((prev) => {
      const next = !prev;
      if (next) {
        setIsNotificationsOpen(false);
      }
      return next;
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (updateProfile) {
        updateProfile({ avatarUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllNotificationsRead = () => {
    const visibleIds = new Set(
      visibleNotifications.map((notification) => notification.id),
    );

    setNotifications((prev) =>
      prev.map((notification) =>
        visibleIds.has(notification.id)
          ? { ...notification, read: true }
          : notification,
      ),
    );
  };

  return (
    <header
      className={`app-dashboard-header ${user?.role || ""} ${
        showProfileShowcase ? "expanded" : ""
      }`}
      style={{ "--role-color": roleColor }}
    >
      <div className="header-container">
        <div className="header-content">
          <div className={`header-brand ${user?.role}`}>
            <div className="school-logo-container">
              <img src="/images/schoolLogo.jpeg" alt="School Logo" className="school-logo-img" />
              <span className="school-logo-text">GEOZIIE INTERNATIONAL SCHOOL</span>
            </div>
            <div className="header-title">
              <p className="header-role-badge">{roleLabel} Dashboard</p>
              {showProfileShowcase && (
                <p className="header-supporting-copy">
                  {profile.workspace} for school-wide oversight, approvals, and
                  day-to-day operations.
                </p>
              )}
            </div>
          </div>

          <div className="header-actions">
            <div className="header-toolbar">
              <div className="toolbar-menu" ref={notificationMenuRef}>
                <button
                  type="button"
                  className={`notification-btn ${
                    isNotificationsOpen ? "is-active" : ""
                  }`}
                  title="Notifications"
                  aria-expanded={isNotificationsOpen}
                  aria-haspopup="dialog"
                  onClick={handleNotificationsToggle}
                >
                  <Bell />
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div
                    className="toolbar-panel notification-panel"
                    role="dialog"
                    aria-label="Notifications"
                  >
                    <div className="toolbar-panel-header">
                      <div>
                        <h3>Notifications</h3>
                        <p>
                          {unreadCount > 0
                            ? `${unreadCount} unread update${
                                unreadCount === 1 ? "" : "s"
                              } in ${profile.workspace}.`
                            : `You're all caught up in ${profile.workspace}.`}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="panel-action-btn"
                        onClick={markAllNotificationsRead}
                        disabled={!unreadCount}
                      >
                        Mark all read
                      </button>
                    </div>

                    <div className="toolbar-panel-body">
                      {visibleNotifications.length > 0 ? (
                        visibleNotifications.map((notification) => {
                          const Icon = notification.icon;

                          return (
                            <button
                              type="button"
                              key={notification.id}
                              className={`notification-card ${
                                notification.read ? "read" : "unread"
                              }`}
                              onClick={() =>
                                markNotificationRead(notification.id)
                              }
                            >
                              <div className="notification-card-icon">
                                <Icon />
                              </div>
                              <div className="notification-card-copy">
                                <div className="notification-card-head">
                                  <strong className="notification-card-title">
                                    {notification.title}
                                  </strong>
                                  <span className="notification-card-time">
                                    {notification.time}
                                  </span>
                                </div>
                                <p>{notification.description}</p>
                                <span className="notification-card-type">
                                  {notification.tag}
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="toolbar-empty-state">
                          Notification preferences are muted right now. Turn
                          alerts back on in settings to see updates here.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="toolbar-menu" ref={settingsMenuRef}>
                <button
                  type="button"
                  className={`settings-btn ${
                    isSettingsOpen ? "is-active" : ""
                  }`}
                  title="Settings"
                  aria-expanded={isSettingsOpen}
                  aria-haspopup="dialog"
                  onClick={handleSettingsToggle}
                >
                  <Settings />
                </button>

                {isSettingsOpen && (
                  <div
                    className="toolbar-panel settings-panel"
                    role="dialog"
                    aria-label="Workspace settings"
                  >
                    <div className="toolbar-panel-header">
                      <div>
                        <h3>Workspace Settings</h3>
                        <p>
                          Customize how your dashboard looks, alerts you, and
                          presents your profile.
                        </p>
                      </div>
                    </div>

                    <div className="settings-panel-body">
                      <div className="settings-list">
                        <div className="settings-item">
                          <div className="settings-copy">
                            <strong>Theme appearance</strong>
                            <p>
                              Switch between light and dark modes for the entire
                              dashboard instantly.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="settings-cta"
                            onClick={handleThemeToggle}
                          >
                            {themeLabel}
                          </button>
                        </div>

                        <div className="settings-item">
                          <div className="settings-copy">
                            <strong>Email alerts</strong>
                            <p>
                              Show digest-style updates and inbox reminders in
                              your notification center.
                            </p>
                          </div>
                          <button
                            type="button"
                            className={`settings-switch ${
                              preferences.emailAlerts ? "active" : ""
                            }`}
                            onClick={() => togglePreference("emailAlerts")}
                            aria-pressed={preferences.emailAlerts}
                          >
                            <span className="settings-switch-thumb" />
                            <span className="settings-switch-label">
                              {preferences.emailAlerts ? "On" : "Off"}
                            </span>
                          </button>
                        </div>

                        <div className="settings-item">
                          <div className="settings-copy">
                            <strong>System status updates</strong>
                            <p>
                              Keep live operational reminders visible inside the
                              notification center.
                            </p>
                          </div>
                          <button
                            type="button"
                            className={`settings-switch ${
                              preferences.statusUpdates ? "active" : ""
                            }`}
                            onClick={() => togglePreference("statusUpdates")}
                            aria-pressed={preferences.statusUpdates}
                          >
                            <span className="settings-switch-thumb" />
                            <span className="settings-switch-label">
                              {preferences.statusUpdates ? "On" : "Off"}
                            </span>
                          </button>
                        </div>

                        <div className="settings-item">
                          <div className="settings-copy">
                            <strong>Profile photo</strong>
                            <p>
                              Upload a fresh image for your header card and admin
                              profile showcase.
                            </p>
                          </div>
                          <button
                            type="button"
                            className="settings-cta secondary"
                            onClick={handleAvatarClick}
                          >
                            Update photo
                          </button>
                        </div>
                      </div>

                      <div className="settings-summary-card">
                        <div className="settings-summary-row">
                          <span>Role access</span>
                          <strong>{profile.access}</strong>
                        </div>
                        <div className="settings-summary-row">
                          <span>Workspace</span>
                          <strong>{profile.workspace}</strong>
                        </div>
                        <div className="settings-summary-row">
                          <span>Unread alerts</span>
                          <strong>{unreadCount}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="theme-toggle"
                onClick={handleThemeToggle}
                title={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
                aria-pressed={isDarkMode}
              >
                {isDarkMode ? <Sun /> : <Moon />}
              </button>
            </div>

            <div className="user-section">
              <div className="user-info">
                <div className="user-avatar-wrapper">
                  <button
                    type="button"
                    className={`user-avatar ${
                      user?.avatarUrl ? "has-image" : ""
                    }`}
                    style={{ "--avatar-color": roleColor }}
                    onClick={handleAvatarClick}
                    title="Upload profile image"
                    aria-label="Upload profile image"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user?.name || "User"} profile`}
                      />
                    ) : (
                      <span className="avatar-initials">{avatarInitials}</span>
                    )}
                    <span className="avatar-edit" aria-hidden="true">
                      <Camera />
                    </span>
                  </button>
                </div>
                <div className="user-details">
                  <div className="user-name">{user?.name}</div>
                  <div className="user-role" style={{ color: roleColor }}>
                    {roleLabel}
                  </div>
                  <div className="user-meta">{profile.workspace}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="logout-btn"
                title="Logout"
              >
                <LogOut />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {showProfileShowcase && (
          <div className="header-profile-showcase">
            <section className="profile-spotlight">
              <div className="profile-identity">
                <div className="profile-avatar-panel">
                  <button
                    type="button"
                    className={`user-avatar profile-avatar-large ${
                      user?.avatarUrl ? "has-image" : ""
                    }`}
                    style={{ "--avatar-color": roleColor }}
                    onClick={handleAvatarClick}
                    title="Upload profile image"
                    aria-label="Upload profile image"
                  >
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={`${user?.name || "User"} profile`}
                      />
                    ) : (
                      <span className="avatar-initials">{avatarInitials}</span>
                    )}
                    <span className="avatar-edit" aria-hidden="true">
                      <Camera />
                    </span>
                  </button>
                  <span className="profile-avatar-hint">
                    Click the avatar to update your admin profile photo.
                  </span>
                </div>

                <div className="profile-identity-copy">
                  <div className="profile-label-row">
                    <span className="profile-label">
                      <Sparkles />
                      Admin Profile
                    </span>
                    <span className="profile-status-pill">
                      <BadgeCheck />
                      Verified Workspace
                    </span>
                  </div>
                  <h2>{user?.name || "Administrator"}</h2>
                  <p className="profile-role-title">{profile.title}</p>
                  <p className="profile-summary">{profile.summary}</p>
                  <div className="profile-tag-row">
                    <span className="profile-tag">SchoolSync control center</span>
                    <span className="profile-tag">Secure active session</span>
                    <span className="profile-tag">{profile.access}</span>
                  </div>
                </div>
              </div>

              <div className="profile-detail-grid">
                {profileHighlights.map((detail) => {
                  const Icon = detail.icon;

                  return (
                    <article className="profile-detail-card" key={detail.label}>
                      <div className="profile-detail-icon">
                        <Icon />
                      </div>
                      <div>
                        <span className="profile-detail-label">
                          {detail.label}
                        </span>
                        <strong className="profile-detail-value">
                          {detail.value}
                        </strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <aside className="profile-side-card">
              <div className="profile-side-header">
                <span className="profile-side-kicker">Daily Overview</span>
                <h3>{todayLabel}</h3>
                <p>
                  Review the essentials, keep the workspace personalized, and
                  move through admin tasks with fewer clicks.
                </p>
              </div>

              <div className="profile-side-list">
                <div className="profile-side-item">
                  <span>Dashboard theme</span>
                  <strong>{themeLabel}</strong>
                </div>
                <div className="profile-side-item">
                  <span>Status</span>
                  <strong>{profile.status}</strong>
                </div>
                <div className="profile-side-item">
                  <span>Work email</span>
                  <strong>{user?.email || "No email available"}</strong>
                </div>
              </div>

              <div className="profile-side-note">
                <Mail />
                <span>
                  Notifications, settings, and sign-out remain available in the
                  top action bar for quick admin access.
                </span>
              </div>
            </aside>
          </div>
        )}

        <input
          ref={fileInputRef}
          className="avatar-input"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
        />
      </div>
    </header>
  );
};

export default Header;
