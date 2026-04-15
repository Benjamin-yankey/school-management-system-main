import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import api from "../../lib/api";
import { NotificationSendModal } from "../../lib/NotificationService";
import DashboardLayout from "./DashboardLayout";
import "../Dashboard.css";
import "./DashboardStyles.css";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─────────────────────────────────────────────────────────────────────────────
// API HELPER
// ─────────────────────────────────────────────────────────────────────────────

async function adminRequest(method, path, body = null) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, config);
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    // NestJS can return message as string or string[]
    let msg =
      (Array.isArray(data?.message)
        ? data.message.join(", ")
        : data?.message) ||
      data?.error ||
      null;
    // 500s often have no useful body — give an actionable hint
    if (!msg && res.status === 500) {
      msg =
        "Internal server error (500). This usually means your admin account has no school assigned, or the backend message broker (Kafka) is unavailable. Check the server logs.";
    }
    throw new Error(msg || `Request failed with status ${res.status}`);
  }
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function AdminSpinner({ size = 14 }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: "2px solid currentColor",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
        marginRight: 6,
        verticalAlign: "middle",
      }}
    />
  );
}

function AdminAlert({ type, message, onClose }) {
  if (!message) return null;
  const isErr = type === "error";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        marginTop: 12,
        lineHeight: 1.5,
        ...(isErr
          ? {
              background: "#FCEBEB",
              border: "1px solid #F09595",
              color: "#791F1F",
            }
          : {
              background: "#EAF3DE",
              border: "1px solid #C0DD97",
              color: "#27500A",
            }),
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            color: "inherit",
            opacity: 0.6,
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function AdminRoleBadge({ role }) {
  const map = {
    teacher: { bg: "rgba(68, 138, 255, 0.1)", color: "#448aff" },
    student: { bg: "rgba(99, 102, 241, 0.1)", color: "#6366f1" },
    parent: { bg: "rgba(124, 77, 255, 0.1)", color: "#7c4dff" },
    admin: { bg: "rgba(92, 33, 243, 0.1)", color: "#5c21f3" },
  };
  const s = map[role?.toLowerCase()] || {
    bg: "var(--surface-muted)",
    color: "var(--text-secondary)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}44`,
      }}
    >
      {role || "—"}
    </span>
  );
}

function AdminStatusBadge({ isActive }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 9px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        background: isActive
          ? "rgba(14, 165, 233, 0.1)"
          : "rgba(100, 116, 139, 0.1)",
        color: isActive ? "#0ea5e9" : "#64748b",
        border: isActive
          ? "1px solid rgba(14, 165, 233, 0.2)"
          : "1px solid rgba(100, 116, 139, 0.2)",
      }}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function AdminAvatar({ email, name, size = 36 }) {
  const initials = name
    ? name
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : email
      ? email[0].toUpperCase()
      : "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--accent)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size * 0.38,
        flexShrink: 0,
        border: "1.5px solid var(--border)",
      }}
    >
      {initials}
    </div>
  );
}

function AdminConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          borderRadius: 18,
          padding: "30px 32px",
          maxWidth: 420,
          width: "90%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>
          {title}
        </p>
        <p style={{ color: "#5F5E5A", fontSize: 13, marginBottom: 20 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={css.btnGhost} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button style={css.btnDanger} onClick={onConfirm} disabled={loading}>
            {loading && <AdminSpinner />} Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminField({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--text-secondary)",
          display: "block",
          marginBottom: 5,
        }}
      >
        {label}
        {required && (
          <span style={{ color: "var(--danger)", marginLeft: 2 }}>*</span>
        )}
      </label>
      {children}
      {hint && (
        <p style={{ fontSize: 11, color: "#B4B2A9", marginTop: 4 }}>{hint}</p>
      )}
    </div>
  );
}

function AdminTempPasswordCard({ password, onDismiss }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      style={{
        background: "#FFF5F5",
        border: "1px solid #FEB2B2",
        borderRadius: 10,
        padding: "14px 16px",
        marginTop: 14,
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>
        Temporary Password Generated
      </p>
      <p style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 10 }}>
        Share this with the user. They will be prompted to change it on first
        login.
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          border: "1px solid #FEB2B2",
          borderRadius: 8,
          padding: "10px 14px",
        }}
      >
        <code style={{ fontSize: 15, letterSpacing: 2, fontWeight: 700 }}>
          {password}
        </code>
        <button style={css.btnSmall} onClick={copy}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <button
        style={{ ...css.btnGhost, marginTop: 10, fontSize: 12 }}
        onClick={onDismiss}
      >
        Dismiss
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS CARD
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ title, value, color, icon, loading }) {
  return (
    <div
      className="stat-card"
      style={{ ...css.card, borderLeft: `5px solid ${color}`, minWidth: 200 }}
    >
      <div
        className="stat-card-icon"
        style={{ fontSize: 24, marginBottom: 12 }}
      >
        {icon}
      </div>
      <div className="stat-card-title" style={css.cardSub}>
        {title}
      </div>
      <div
        className="stat-card-value"
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: "var(--text)",
          marginTop: 4,
        }}
      >
        {loading ? (
          <AdminSpinner size={18} />
        ) : (
          (value?.toLocaleString() ?? "0")
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECENT USERS TABLE
// ─────────────────────────────────────────────────────────────────────────────

function RecentUsersTable({ users = [], loading }) {
  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "24px 0",
          color: "#A0AEC0",
          fontSize: 13,
        }}
      >
        <AdminSpinner size={16} /> Loading recent users…
      </div>
    );
  }
  if (!users.length) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "24px 0",
          color: "var(--text-secondary)",
          fontSize: 13,
        }}
      >
        No users found in this school yet.
      </div>
    );
  }
  return (
    <div className="table-outer">
      <table className="recent-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const fullName =
              [u.firstName, u.middleName, u.lastName]
                .filter(Boolean)
                .join(" ") || u.name;
            return (
              <tr key={u.id}>
                <td>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <AdminAvatar email={u.email} name={fullName} size={34} />
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--text)",
                        }}
                      >
                        {fullName || u.email.split("@")[0]}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "var(--text-secondary)" }}
                      >
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <AdminRoleBadge role={u.role} />
                </td>
                <td>
                  <AdminStatusBadge isActive={u.isActive} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE USER SECTION
// ─────────────────────────────────────────────────────────────────────────────

function CreateUserSection({ onCreated }) {
  const { classLevels, activeAcademicYear } = useAuth();
  const [form, setForm] = useState({
    email: "",
    role: "teacher",
    firstName: "",
    lastName: "",
    middleName: "",
    classLevelId: "",
    sectionId: "",
    dateOfBirth: "",
    areaOfInterest: "",
    phoneNumber: "",
  });
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [preflight, setPreflight] = useState(null); // null | "ok" | "no-school"

  // Check that this admin account has a school assigned before allowing user creation
  useEffect(() => {
    adminRequest("GET", "/administration/users")
      .then(() => setPreflight("ok"))
      .catch(() => setPreflight("no-school"));
  }, []);

  // Fetch sections when class changes
  useEffect(() => {
    if (form.classLevelId) {
      api
        .getClassSections(form.classLevelId)
        .then(setSections)
        .catch(console.error);
    } else {
      setSections([]);
    }
  }, [form.classLevelId]);

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email address.";

    // Academic validation
    if (
      (form.role === "student" || form.role === "teacher") &&
      !form.classLevelId
    ) {
      return `Please select a Class for the ${form.role}.`;
    }
    return null;
  };

  const [students, setStudents] = useState([]);
  const [userServiceStudents, setUserServiceStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Fetch students for the parent linking UI
  useEffect(() => {
    if (form.role === "parent") {
      // Fetch school-service students (enrolled)
      api
        .getStudentsPaginated({ limit: 1000 })
        .then((res) => {
          setStudents(res.data || []);
        })
        .catch(console.error);

      // Also fetch user-service students for fallback
      adminRequest("GET", "/administration/users")
        .then((res) => {
          const allUsers = Array.isArray(res) ? res : res?.data || [];
          const studentsOnly = allUsers.filter((u) => u.role === "student");
          setUserServiceStudents(studentsOnly);
        })
        .catch(console.error);
    }
  }, [form.role]);

  const toggleStudentSelection = (id) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const combinedStudents = [
    ...students,
    ...userServiceStudents
      .filter((u) => !students.some((s) => s.userId === u.id))
      .map((u) => ({
        id: u.id,
        studentId: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        isNotEnrolled: true,
      })),
  ];

  const filteredStudents = combinedStudents.filter(
    (s) =>
      s.firstName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.lastName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.studentId?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  const submit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    let userId = null;
    try {
      // 1. Create User
      const userRes = await adminRequest(
        "POST",
        "/administration/create-user",
        {
          email: form.email.trim(),
          role: form.role,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          middleName: form.middleName.trim(),
        },
      );
      userId = userRes.id;

      // 1b. Create student record in school-service for student users
      if (form.role === "student" && !form.classLevelId) {
        try {
          await api.createStudentFromUser(userId);
          linkMsg = " (student record created in school registry)";
        } catch (e) {
          console.error("Failed to create student record:", e);
        }
      }

      let linkMsg = "";
      // 2. Perform Academic Assignment or Linking
      if (form.role === "student") {
        await api.assignStudentToSection(userId, {
          classLevelId: form.classLevelId,
          academicYearId: activeAcademicYear?.id,
          sectionId: form.sectionId || undefined,
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          middleName: form.middleName.trim(),
          dateOfBirth: form.dateOfBirth,
          areaOfInterest: form.areaOfInterest,
          phoneNumber: form.phoneNumber,
        });
      } else if (form.role === "teacher" && form.sectionId) {
        await api.assignTeacherToSection(userId, form.sectionId);
      } else if (form.role === "parent" && selectedStudentIds.length > 0) {
        await api.bulkLinkStudents(userId, {
          studentIds: selectedStudentIds,
          relationship: "guardian", // Default relationship for bulk admin link
        });
        linkMsg = ` and linked to ${selectedStudentIds.length} student(s)`;
      }

      setSuccess(
        `User created${linkMsg}. A temporary password has been sent to ${form.email}.`,
      );
      setForm({
        email: "",
        role: "teacher",
        firstName: "",
        lastName: "",
        middleName: "",
        classLevelId: "",
        sectionId: "",
        dateOfBirth: "",
        areaOfInterest: "",
        phoneNumber: "",
      });
      setSelectedStudentIds([]);
      setStudentSearch("");
      onCreated?.();
    } catch (e) {
      const baseMsg = userId
        ? "User created, but assignment/linking failed: "
        : "";
      setError(baseMsg + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Show a warning banner if this admin has no schoolId — creation will always 500
  const preflightWarning =
    preflight === "no-school" ? (
      <div
        style={{
          background: "#FFF8E1",
          border: "1px solid #FFD54F",
          borderRadius: 9,
          padding: "12px 16px",
          marginBottom: 16,
          fontSize: 13,
          color: "#7C5800",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <strong>Account not linked to a school.</strong>
        </div>
        Your admin account has no school assignment in the database. User
        creation will fail until a superadmin assigns your account to a school
        via the Superadmin panel.
      </div>
    ) : null;

  const roleOptions = [
    {
      role: "teacher",
      icon: "T",
      bg: "#E6F1FB",
      color: "#185FA5",
      desc: "Manages sections, attendance & grades.",
    },
    {
      role: "student",
      icon: "S",
      bg: "#FAEEDA",
      color: "#854F0B",
      desc: "Access to their own academic portal.",
    },
    {
      role: "parent",
      icon: "P",
      bg: "#EAF3DE",
      color: "#3B6D11",
      desc: "Links to children and monitors progress.",
    },
  ];

  return (
    <div style={{ ...css.card, background: "var(--surface)" }}>
      <style>
        {`
          .create-user-names { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
          .create-user-roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 4px 0 18px; }
          .academic-section { 
            margin-top: 24px; 
            padding-top: 20px; 
            border-top: 1.5px dashed var(--border); 
            animation: fadeIn 0.3s ease-out;
          }
          .student-scroll-list {
            margin-top: 10px;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--surface);
          }
          .student-list-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            border-bottom: 1px solid var(--border);
            cursor: pointer;
            transition: background 0.15s;
          }
          .student-list-item:hover { background: var(--hover); }
          .student-list-item:last-child { border-bottom: none; }

          @media (max-width: 600px) {
            .create-user-names { grid-template-columns: 1fr; gap: 12px; }
            .create-user-roles { grid-template-columns: 1fr; }
          }
        `}
      </style>
      <div style={css.cardHeader}>
        <div style={css.iconWrap("#E6F1FB")}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#185FA5"
            strokeWidth="2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <div>
          <p style={css.cardTitle}>Create user</p>
          <p style={css.cardSub}>
            Add a teacher, student, or parent. They receive a temporary password
            via email.
          </p>
        </div>
      </div>
      <div style={css.divider} />

      {preflightWarning}

      <div className="create-user-names">
        <AdminField label="First Name" required>
          <input
            style={css.input}
            type="text"
            value={form.firstName}
            onChange={update("firstName")}
            placeholder="e.g. John"
          />
        </AdminField>
        <AdminField label="Middle Name">
          <input
            style={css.input}
            type="text"
            value={form.middleName}
            onChange={update("middleName")}
            placeholder="e.g. Quincy"
          />
        </AdminField>
        <AdminField label="Last Name" required>
          <input
            style={css.input}
            type="text"
            value={form.lastName}
            onChange={update("lastName")}
            placeholder="e.g. Doe"
          />
        </AdminField>
      </div>

      <div className="grid-2">
        <AdminField
          label="Email address"
          required
          hint="The user's login email."
        >
          <input
            style={css.input}
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="e.g. teacher@school.com"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </AdminField>
        <AdminField
          label="Role"
          required
          hint="Determines what this user can access."
        >
          <select style={css.input} value={form.role} onChange={update("role")}>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
        </AdminField>
      </div>

      <div className="create-user-roles">
        {roleOptions.map((r) => (
          <div
            key={r.role}
            onClick={() => setForm((f) => ({ ...f, role: r.role }))}
            style={{
              borderRadius: 10,
              padding: 12,
              cursor: "pointer",
              transition: "border 0.15s, background 0.15s",
              border:
                form.role === r.role
                  ? `1.5px solid ${r.color}`
                  : "1px solid #D3D1C7",
              background: form.role === r.role ? r.bg : "#FAFAFA",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: r.bg,
                color: r.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 6,
                border: `1px solid ${r.color}44`,
              }}
            >
              {r.icon}
            </div>
            <p
              style={{
                fontWeight: 600,
                fontSize: 12,
                color: r.color,
                marginBottom: 3,
              }}
            >
              {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
            </p>
            <p style={{ fontSize: 11, color: "#888780", lineHeight: 1.4 }}>
              {r.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Dynamic Academic Section */}
      {(form.role === "student" || form.role === "teacher") && (
        <div className="academic-section">
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background:
                  "var(--accent-secondary-transparent, rgba(68, 138, 255, 0.1))",
                color: "var(--accent-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
              School Placement & Info
            </h4>
          </div>

          <div className="grid-2">
            <AdminField label="Assign Class" required>
              <select
                style={css.input}
                value={form.classLevelId}
                onChange={update("classLevelId")}
              >
                <option value="">-- Choose Class --</option>
                {classLevels?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.level})
                  </option>
                ))}
              </select>
            </AdminField>
            <AdminField label="Assign Section">
              <select
                style={css.input}
                value={form.sectionId}
                onChange={update("sectionId")}
                disabled={!form.classLevelId}
              >
                <option value="">-- Choose Section (Optional) --</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name} (Cap: {s.capacity})
                  </option>
                ))}
              </select>
            </AdminField>
          </div>

          {form.role === "student" && (
            <div className="grid-3" style={{ marginTop: 10 }}>
              <AdminField label="Date of Birth">
                <input
                  style={css.input}
                  type="date"
                  value={form.dateOfBirth}
                  onChange={update("dateOfBirth")}
                />
              </AdminField>
              <AdminField label="Area of Interest">
                <input
                  style={css.input}
                  type="text"
                  value={form.areaOfInterest}
                  onChange={update("areaOfInterest")}
                  placeholder="e.g. Science, Arts"
                />
              </AdminField>
              <AdminField label="Phone/Contact">
                <input
                  style={css.input}
                  type="text"
                  value={form.phoneNumber}
                  onChange={update("phoneNumber")}
                  placeholder="e.g. +233..."
                />
              </AdminField>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Parent Linking Section */}
      {form.role === "parent" && (
        <div className="academic-section">
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "rgba(59, 109, 17, 0.1)",
                color: "#3B6D11",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
              Link Students to Parent
            </h4>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--accent-primary)",
                background: "var(--accent-primary-transparent)",
                padding: "2px 8px",
                borderRadius: 12,
              }}
            >
              {selectedStudentIds.length} Selected
            </span>
          </div>

          <input
            type="text"
            style={{ ...css.input, marginBottom: 8 }}
            placeholder="Search students by name, email, or ID..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          />

          <div className="student-scroll-list">
            {filteredStudents.length === 0 ? (
              students.length === 0 && userServiceStudents.length > 0 ? (
                <div
                  style={{
                    padding: 20,
                    textAlign: "center",
                    fontSize: 13,
                    color: "#e53e3e",
                  }}
                >
                  ⚠️ {userServiceStudents.length} student(s) exist but are not
                  enrolled. Showing from user registry.
                </div>
              ) : (
                <div
                  style={{
                    padding: 20,
                    textAlign: "center",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  No students found.
                </div>
              )
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                return (
                  <div
                    key={student.id}
                    className="student-list-item"
                    onClick={() => toggleStudentSelection(student.id)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ cursor: "pointer" }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {student.firstName} {student.lastName}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "var(--text-secondary)" }}
                      >
                        {student.email} • ID: {student.studentId}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <AdminAlert type="error" message={error} onClose={() => setError(null)} />

      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        <button style={css.btnPrimary} onClick={submit} disabled={loading}>
          {loading && <AdminSpinner />}
          {loading
            ? "Processing…"
            : `Create & Assign ${form.role.charAt(0).toUpperCase() + form.role.slice(1)}`}
        </button>
        <button
          style={css.btnGhost}
          onClick={() => {
            setForm({
              email: "",
              role: "teacher",
              firstName: "",
              lastName: "",
              middleName: "",
              classLevelId: "",
              sectionId: "",
              dateOfBirth: "",
              areaOfInterest: "",
              phoneNumber: "",
            });
            setError(null);
            setSuccess(null);
            setSelectedStudentIds([]);
            setStudentSearch("");
          }}
          disabled={loading}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS LIST SECTION
// ─────────────────────────────────────────────────────────────────────────────

function UsersListSection({ refreshTrigger, onSelectUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("email");

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilter(filter), 300);
    return () => clearTimeout(timer);
  }, [filter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminRequest("GET", "/administration/users");
      setUsers(
        Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [],
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]);

  const filtered = users
    .filter((u) => {
      const q = debouncedFilter.toLowerCase();
      const matchSearch =
        !q ||
        u.email?.toLowerCase().includes(q) ||
        u.id?.toLowerCase().includes(q) ||
        (u.firstName + " " + u.lastName).toLowerCase().includes(q);
      const matchRole = roleFilter === "all" || u.role === roleFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && u.isActive) ||
        (statusFilter === "inactive" && !u.isActive);
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "email")
        return (a.email || "").localeCompare(b.email || "");
      if (sortBy === "role") return (a.role || "").localeCompare(b.role || "");
      if (sortBy === "status") return Number(b.isActive) - Number(a.isActive);
      return 0;
    });

  const total = users.length;
  const active = users.filter((u) => u.isActive).length;
  const inactive = total - active;
  const teachers = users.filter((u) => u.role === "teacher").length;
  const students = users.filter((u) => u.role === "student").length;
  const parents = users.filter((u) => u.role === "parent").length;

  return (
    <div style={{ ...css.card, background: "var(--surface)" }}>
      <style>
        {`
          .user-list-header { display: flex; }
          .user-row { display: flex; align-items: center; gap: 16px; }
          .user-info-cell { flex: 2; display: flex; align-items: center; gap: 14px; }
          .user-meta-group { display: flex; align-items: center; gap: 14px; flex: 2; }
          .user-role-cell { flex: 1; }
          .user-status-cell { flex: 1; }
          .user-id-cell { flex: 2; text-align: right; }
          .user-action-cell { width: 70px; text-align: right; }

          @media (max-width: 768px) {
            .user-id-cell { display: none; }
            .user-list-header span:nth-child(4) { display: none; }
          }

          @media (max-width: 480px) {
            .user-list-header { display: none; }
            .user-row { 
              flex-direction: column; 
              align-items: flex-start; 
              gap: 12px;
              padding: 16px !important;
            }
            .user-info-cell { width: 100%; border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 4px; }
            .user-meta-group { display: flex; align-items: center; gap: 10px; width: 100%; justify-content: space-between; flex: none; }
            .user-role-cell, .user-status-cell { flex: none; }
            .user-id-cell { display: block; width: 100%; text-align: left; margin-top: 4px; }
            .user-id-cell code { font-size: 9px !important; word-break: break-all; }
            .user-action-cell { width: 100%; text-align: right; margin-top: 8px; }
            .user-action-cell button { width: 100%; padding: 10px !important; }
          }
        `}
      </style>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div style={css.cardHeader}>
          <div style={css.iconWrap("#EAF3DE")}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#3B6D11"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <p style={css.cardTitle}>School users</p>
            <p style={css.cardSub}>
              All accounts under this school. Click a row to select a user for
              actions.
            </p>
          </div>
        </div>
        <button style={css.btnGhost} onClick={fetchUsers} disabled={loading}>
          {loading ? (
            <>
              <AdminSpinner />
              Loading…
            </>
          ) : (
            "↻ Refresh"
          )}
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid-6" style={{ marginBottom: 16 }}>
        {[
          { label: "Total", value: total, color: "#444441" },
          { label: "Active", value: active, color: "#3B6D11" },
          { label: "Inactive", value: inactive, color: "#A32D2D" },
          { label: "Teachers", value: teachers, color: "#185FA5" },
          { label: "Students", value: students, color: "#854F0B" },
          { label: "Parents", value: parents, color: "#0F6E56" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#F7FAFC",
              borderRadius: 8,
              padding: "10px 12px",
              border: "1px solid #E2E8F0",
            }}
          >
            <p style={{ fontSize: 11, color: "#888780", marginBottom: 3 }}>
              {s.label}
            </p>
            <p style={{ fontSize: 20, fontWeight: 600, color: s.color }}>
              {loading ? "…" : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}
      >
        <input
          style={{ ...css.input, flex: 1, minWidth: 180 }}
          placeholder="Search by email or ID…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          style={{ ...css.input, width: 130 }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All roles</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
        <select
          style={{ ...css.input, width: 140 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          style={{ ...css.input, width: 130 }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="email">Sort: Email</option>
          <option value="role">Sort: Role</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      <AdminAlert type="error" message={error} onClose={() => setError(null)} />

      {/* Table header */}
      {filtered.length > 0 && (
        <div
          className="user-list-header"
          style={{
            alignItems: "center",
            padding: "6px 12px",
            fontSize: 10,
            fontWeight: 700,
            color: "#A0AEC0",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            marginBottom: 4,
          }}
        >
          <span style={{ flex: 2 }}>User</span>
          <span style={{ flex: 1 }}>Role</span>
          <span style={{ flex: 1 }}>Status</span>
          <span style={{ flex: 2, textAlign: "right" }}>ID</span>
          <span style={{ width: 70 }}></span>
        </div>
      )}

      {loading && users.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#A0AEC0",
            fontSize: 13,
            padding: "32px 0",
          }}
        >
          <AdminSpinner size={16} /> Loading users…
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "#A0AEC0",
            fontSize: 13,
            padding: "32px 0",
          }}
        >
          {users.length === 0
            ? "No users in this school yet."
            : "No users match your filters."}
        </div>
      )}

      {filtered.map((u) => {
        const fullName =
          [u.firstName, u.middleName, u.lastName].filter(Boolean).join(" ") ||
          u.name;
        return (
          <div
            key={u.id}
            onClick={() => onSelectUser(u)}
            className="user-row"
            style={{
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid var(--border)",
              marginBottom: 8,
              transition: "all 0.2s",
              cursor: "pointer",
              background: "var(--glass)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--surface-muted)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--glass)")
            }
          >
            <div className="user-info-cell">
              <AdminAvatar email={u.email} name={fullName} />
              <div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                >
                  {fullName || u.email.split("@")[0]}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    marginTop: 2,
                  }}
                >
                  {u.email}
                </p>
              </div>
            </div>

            <div className="user-meta-group">
              <div className="user-role-cell">
                <AdminRoleBadge role={u.role} />
              </div>
              <div className="user-status-cell">
                <AdminStatusBadge isActive={u.isActive} />
              </div>
            </div>

            <div className="user-id-cell">
              <code
                style={{ fontSize: 10, color: "#A0AEC0", letterSpacing: 0.5 }}
              >
                {u.id}
              </code>
            </div>

            <div className="user-action-cell">
              <button
                style={{
                  ...css.btnSmall,
                  background: "#E6F1FB",
                  color: "#185FA5",
                  border: "none",
                }}
              >
                Select
              </button>
            </div>
          </div>
        );
      })}

      {filtered.length > 0 && (
        <p
          style={{
            fontSize: 11,
            color: "#B4B2A9",
            marginTop: 10,
            textAlign: "right",
          }}
        >
          Showing {filtered.length} of {total} user{total !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER ACTIONS SECTION
// ─────────────────────────────────────────────────────────────────────────────

function UserActionsSection({ selectedUser, onClearUser, onActionDone }) {
  const { classLevels, activeAcademicYear } = useAuth();
  const [userId, setUserId] = useState("");
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingDeact, setLoadingDeact] = useState(false);
  const [loadingReact, setLoadingReact] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Teacher assignment state
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    if (selectedClassId) {
      setLoadingSections(true);
      api
        .getClassSections(selectedClassId)
        .then(setSections)
        .catch(console.error)
        .finally(() => setLoadingSections(false));
    } else {
      setSections([]);
    }
    setSelectedSectionId("");
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedUser) {
      setUserId(selectedUser.id);
      setFeedback(null);
      setResetResult(null);
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedUser]);

  const activeId = userId.trim();

  const doReset = async () => {
    setConfirm(null);
    setLoadingReset(true);
    setFeedback(null);
    setResetResult(null);
    try {
      const data = await adminRequest(
        "POST",
        `/administration/reset-password/${activeId}`,
      );
      if (data?.temporaryPassword) {
        setResetResult({ tempPassword: data.temporaryPassword });
      } else {
        setFeedback({
          type: "success",
          message:
            data?.message || "Password reset. A temporary password was sent.",
        });
      }
      onActionDone?.();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    } finally {
      setLoadingReset(false);
    }
  };

  const doDeactivate = async () => {
    setConfirm(null);
    setLoadingDeact(true);
    setFeedback(null);
    try {
      const data = await adminRequest(
        "PATCH",
        `/administration/deactivate/${activeId}`,
      );
      setFeedback({
        type: "success",
        message:
          data?.message || "User deactivated. They can no longer log in.",
      });
      onActionDone?.();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    } finally {
      setLoadingDeact(false);
    }
  };

  const doReactivate = async () => {
    setConfirm(null);
    setLoadingReact(true);
    setFeedback(null);
    try {
      const data = await adminRequest(
        "PATCH",
        `/administration/activate/${activeId}`,
      );
      setFeedback({
        type: "success",
        message: data?.message || "User reactivated successfully.",
      });
      onActionDone?.();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    } finally {
      setLoadingReact(false);
    }
  };

  const doAssignSection = async () => {
    if (!selectedSectionId) return;
    setLoadingAssign(true);
    setFeedback(null);
    try {
      await api.assignTeacherToSection(activeId, selectedSectionId);
      setFeedback({
        type: "success",
        message: "Teacher assigned to section successfully.",
      });
      setSelectedClassId("");
      setSelectedSectionId("");
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    } finally {
      setLoadingAssign(false);
    }
  };

  const doEnrollStudent = async () => {
    if (!selectedClassId || !activeAcademicYear) return;
    setLoadingAssign(true);
    setFeedback(null);
    try {
      await api.assignStudentToSection(activeId, {
        classLevelId: selectedClassId,
        academicYearId: activeAcademicYear.id,
        sectionId: selectedSectionId || undefined,
      });
      setFeedback({
        type: "success",
        message: "Student enrollment/section updated successfully.",
      });
      setSelectedClassId("");
      setSelectedSectionId("");
      onActionDone?.();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    } finally {
      setLoadingAssign(false);
    }
  };

  const isInactive = selectedUser ? selectedUser.isActive === false : false;
  const anyLoading = loadingReset || loadingDeact || loadingReact;

  return (
    <>
      <AdminConfirmModal
        open={confirm === "reset"}
        title="Reset this user's password?"
        message={`A new temporary password will be generated for ${selectedUser?.email || activeId}. They'll be asked to change it on next login.`}
        onConfirm={doReset}
        onCancel={() => setConfirm(null)}
        loading={loadingReset}
      />
      <AdminConfirmModal
        open={confirm === "deactivate"}
        title="Deactivate this user?"
        message={`${selectedUser?.email || activeId} will lose all access immediately.`}
        onConfirm={doDeactivate}
        onCancel={() => setConfirm(null)}
        loading={loadingDeact}
      />
      <AdminConfirmModal
        open={confirm === "reactivate"}
        title="Reactivate this user?"
        message={`${selectedUser?.email || activeId} will regain access to the system.`}
        onConfirm={doReactivate}
        onCancel={() => setConfirm(null)}
        loading={loadingReact}
      />

      <div style={css.card}>
        <div style={css.cardHeader}>
          <div style={css.iconWrap("#FAEEDA")}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#854F0B"
              strokeWidth="2.5"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p style={css.cardTitle}>User actions</p>
            <p style={css.cardSub}>
              Select a user from the list above or paste their UUID manually.
            </p>
          </div>
        </div>
        <div style={css.divider} />

        {selectedUser && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--surface-muted)",
              border: "1px solid var(--border)",
              borderRadius: 9,
              padding: "10px 14px",
              marginBottom: 16,
            }}
          >
            <AdminAvatar email={selectedUser.email} size={32} />
            <div style={{ flex: 1 }}>
              <p
                style={{ fontWeight: 600, fontSize: 13, color: "var(--text)" }}
              >
                {selectedUser.email}
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                <AdminRoleBadge role={selectedUser.role} />
                <AdminStatusBadge isActive={selectedUser.isActive} />
              </div>
            </div>
            <button
              style={css.btnGhost}
              onClick={() => {
                onClearUser();
                setUserId("");
              }}
            >
              Clear
            </button>
          </div>
        )}

        <AdminField
          label="User ID (UUID)"
          required
          hint="Paste from the users list, or click Select on a row above to auto-fill."
        >
          <input
            ref={inputRef}
            style={css.input}
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setFeedback(null);
              setResetResult(null);
            }}
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
          />
        </AdminField>

        {userId && !/^[0-9a-f-]{36}$/.test(userId.trim()) && (
          <p
            style={{
              fontSize: 12,
              color: "#E24B4A",
              marginTop: -8,
              marginBottom: 12,
            }}
          >
            This doesn't look like a valid UUID.
          </p>
        )}

        <div className="grid-3">
          {/* Reset Password */}
          <div
            style={{
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                Reset password
              </p>
              <p style={{ fontSize: 12, color: "#888780", lineHeight: 1.5 }}>
                Generates a new temporary password and emails it to the user.
              </p>
            </div>
            <button
              style={{ ...css.btnPrimary, width: "100%" }}
              onClick={() => setConfirm("reset")}
              disabled={!activeId || anyLoading}
            >
              {loadingReset && <AdminSpinner />}
              {loadingReset ? "Resetting…" : "Reset password"}
            </button>
          </div>

          {/* Deactivate */}
          <div
            style={{
              border: "1px solid #F7C1C1",
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  marginBottom: 4,
                  color: "#A32D2D",
                }}
              >
                Deactivate user
              </p>
              <p style={{ fontSize: 12, color: "#888780", lineHeight: 1.5 }}>
                Immediately revokes access. Data is preserved.
              </p>
            </div>
            <button
              style={{ ...css.btnDanger, width: "100%" }}
              onClick={() => setConfirm("deactivate")}
              disabled={!activeId || anyLoading || isInactive}
            >
              {loadingDeact && <AdminSpinner />}
              {loadingDeact ? "Deactivating…" : "Deactivate user"}
            </button>
          </div>

          {/* Reactivate */}
          <div
            style={{
              border: "1px solid #C0DD97",
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  marginBottom: 4,
                  color: "#3B6D11",
                }}
              >
                Reactivate user
              </p>
              <p style={{ fontSize: 12, color: "#888780", lineHeight: 1.5 }}>
                Restores system access for a previously deactivated user.
              </p>
            </div>
            <button
              style={{ ...css.btnSuccess, width: "100%" }}
              onClick={() => setConfirm("reactivate")}
              disabled={!activeId || anyLoading || !isInactive}
            >
              {loadingReact && <AdminSpinner />}
              {loadingReact ? "Reactivating…" : "Reactivate user"}
            </button>
          </div>
        </div>

        {/* Assign Teacher to Section - Only for teachers */}
        {selectedUser?.role === "teacher" && (
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: "var(--surface-muted)",
              borderRadius: 14,
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#E6F1FB",
                  color: "#185FA5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <polyline points="16 11 18 13 22 9" />
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, margin: 0, fontSize: 14 }}>
                  Assign to Section
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  Link this teacher to a specific class section.
                </p>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 16 }}>
              <AdminField label="Select Class" required>
                <select
                  style={css.input}
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  disabled={loadingAssign}
                >
                  <option value="">-- Choose Class --</option>
                  {classLevels?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.level})
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Select Section" required>
                <select
                  style={css.input}
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  disabled={
                    !selectedClassId || loadingSections || loadingAssign
                  }
                >
                  <option value="">
                    {loadingSections ? "Loading..." : "-- Choose Section --"}
                  </option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name} (Cap: {s.capacity})
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

            <button
              style={{
                ...css.btnPrimary,
                width: "100%",
                opacity: !selectedSectionId ? 0.6 : 1,
              }}
              onClick={doAssignSection}
              disabled={!selectedSectionId || loadingAssign}
            >
              {loadingAssign && <AdminSpinner />}
              {loadingAssign ? "Assigning..." : "Confirm Section Assignment"}
            </button>
          </div>
        )}

        {/* Enroll student in section - Only for students */}
        {selectedUser?.role === "student" && (
          <div
            style={{
              marginTop: 24,
              padding: 20,
              background: "var(--surface-muted)",
              borderRadius: 14,
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "#FAEEDA",
                  color: "#854F0B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" />
                  <line x1="22" y1="11" x2="16" y2="11" />
                </svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, margin: 0, fontSize: 14 }}>
                  Enroll in Class/Section
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  Assign this student to a specific class and section for{" "}
                  {activeAcademicYear?.year || "active year"}.
                </p>
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 16 }}>
              <AdminField label="Academic Year" required disabled>
                <input
                  style={{ ...css.input, background: "#f8f9fa" }}
                  value={activeAcademicYear?.year || "None Active"}
                  disabled
                  readOnly
                />
              </AdminField>
              <AdminField label="Select Class" required>
                <select
                  style={css.input}
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  disabled={loadingAssign || !activeAcademicYear}
                >
                  <option value="">-- Choose Class --</option>
                  {classLevels?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.level})
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Select Section (Optional)">
                <select
                  style={css.input}
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  disabled={
                    !selectedClassId || loadingSections || loadingAssign
                  }
                >
                  <option value="">
                    {loadingSections ? "Loading..." : "-- Choose Section --"}
                  </option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name} (Cap: {s.capacity})
                    </option>
                  ))}
                </select>
              </AdminField>
            </div>

            <button
              style={{
                ...css.btnPrimary,
                width: "100%",
                opacity: !selectedClassId || !activeAcademicYear ? 0.6 : 1,
              }}
              onClick={doEnrollStudent}
              disabled={
                !selectedClassId || !activeAcademicYear || loadingAssign
              }
            >
              {loadingAssign && <AdminSpinner />}
              {loadingAssign ? "Enrolling..." : "Confirm Enrollment & Section"}
            </button>
            {!activeAcademicYear && (
              <p style={{ color: "#e53e3e", fontSize: 11, marginTop: 10 }}>
                Cannot enroll students without an active academic year defined.
              </p>
            )}
          </div>
        )}

        {feedback && (
          <AdminAlert
            type={feedback.type}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        )}
        {resetResult?.tempPassword && (
          <AdminTempPasswordCard
            password={resetResult.tempPassword}
            onDismiss={() => setResetResult(null)}
          />
        )}
      </div>
    </>
  );
}

function SectionCard({
  section,
  teachers = [],
  onDelete,
  onAssign,
  onUnassign,
  isAssigning,
  refreshKey = 0,
}) {
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listTeachersForSection(section.id);
      console.log("Raw API response:", data, "section ID:", section.id);

      if (!data || data.length === 0) {
        setAssignedTeachers([]);
        setLoading(false);
        return;
      }

      const results = [];

      for (const a of data) {
        const teacherId = a.teacherUserId || a.userId || a.id;

        // Check for full teacher info in the response first
        let teacherName = null;
        let teacherEmail = null;

        if (a.firstName || a.lastName) {
          teacherName = `${a.firstName || ""} ${a.lastName || ""}`.trim();
        }

        if (a.email) {
          teacherEmail = a.email;
        }

        // If no name in response, look in local teachers list
        if (!teacherName) {
          // Find teacher in the passed teachers prop
          const t = teachers.find((ts) => ts.id === teacherId);
          if (t) {
            teacherName = `${t.firstName || ""} ${t.lastName || ""}`.trim();
            teacherEmail = t.email;
          } else {
            // Try to find by email in teachers list
            const teacherByEmail = teachers.find(
              (ts) => ts.email === (a.email || ""),
            );
            if (teacherByEmail) {
              teacherName =
                `${teacherByEmail.firstName || ""} ${teacherByEmail.lastName || ""}`.trim();
              teacherEmail = teacherByEmail.email;
            }
          }
        }

        // If still no name, show truncated ID
        if (!teacherName) {
          teacherName = teacherId
            ? `Teacher (${String(teacherId).slice(0, 8)})`
            : "Unassigned";
        }

        results.push({
          id: a.id || teacherId,
          userId: teacherId,
          name: teacherName,
          email: teacherEmail || "",
        });
      }

      setAssignedTeachers(results);
      console.log("Processed results:", results);
    } catch (e) {
      console.error("Error fetching assignments:", e);
      setAssignedTeachers([]);
    } finally {
      setLoading(false);
    }
  }, [section.id, teachers]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments, isAssigning, section.id, refreshKey]);

  return (
    <div
      style={{
        background: "var(--surface-muted)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "16px",
        position: "relative",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div>
          <p
            style={{
              fontWeight: 800,
              fontSize: 15,
              margin: 0,
              color: "var(--text)",
            }}
          >
            Section {section.name}
          </p>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              margin: "4px 0 0",
            }}
          >
            Max Capacity: {section.capacity}
          </p>
        </div>
        <button
          onClick={onDelete}
          style={{
            background: "#FCEBEB",
            border: "1px solid #F09595",
            color: "#A32D2D",
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
            fontSize: 10,
          }}
          title="Delete Section"
        >
          Delete
        </button>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Assigned Personnel
        </p>

        {loading && assignedTeachers.length === 0 ? (
          <p
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              fontStyle: "italic",
            }}
          >
            Loading assignments...
          </p>
        ) : assignedTeachers.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {assignedTeachers.map((at) => (
              <div
                key={at.userId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#fff",
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "#E6F1FB",
                    color: "#185FA5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {(at.name || "T")[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>
                    {at.name}
                  </p>
                  <p
                    style={{
                      fontSize: 9,
                      color: "var(--text-secondary)",
                      margin: 0,
                    }}
                  >
                    {at.email}
                  </p>
                </div>
                <button
                  onClick={() => onUnassign(at.userId)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#E24B4A",
                    cursor: "pointer",
                    padding: 4,
                  }}
                  title="Unassign Teacher"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p
            style={{
              fontSize: 11,
              color: "var(--text-secondary)",
              fontStyle: "italic",
            }}
          >
            No teachers assigned.
          </p>
        )}

        {!isAssigning && (
          <button
            onClick={onAssign}
            style={{
              ...css.btnGhost,
              width: "100%",
              fontSize: 11,
              padding: "8px",
              marginTop: 12,
              borderStyle: "dashed",
              borderColor: "var(--accent)",
            }}
          >
            + Assign Teacher
          </button>
        )}
      </div>
    </div>
  );
}

function ClassSectionsList({ classLevelId, onRefresh, refreshKey = 0 }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);
  const [sections, setSections] = useState([]);

  // Combined refresh key from prop or internal state
  const currentRefreshKey = refreshKey || internalRefreshKey;

  // Create Section State
  const [showAdd, setShowAdd] = useState(false);
  const [newSection, setNewSection] = useState({ name: "", capacity: 30 });
  const [adding, setAdding] = useState(false);

  // Teacher Assignment State
  const [teachers, setTeachers] = useState([]);
  const [assigningTo, setAssigningTo] = useState(null); // sectionId
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const fetchSections = useCallback(() => {
    if (!classLevelId) return;
    setLoading(true);
    api
      .getClassSections(classLevelId)
      .then(setSections)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [classLevelId]);

  useEffect(() => {
    fetchSections();
    fetchTeachers();
  }, [fetchSections, currentRefreshKey]);

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const data = await api.getTeachers();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!activeAcademicYear) {
      setError("Active academic year required to create sections.");
      return;
    }
    setAdding(true);
    try {
      await api.createSection(classLevelId, {
        ...newSection,
        academicYearId: activeAcademicYear.id,
      });
      setNewSection({ name: "", capacity: 30 });
      setShowAdd(false);
      fetchSections();
    } catch (e) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this section? This cannot be undone.")) return;
    try {
      await api.deleteSection(id);
      fetchSections();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAssign = async () => {
    if (!selectedTeacherId || !assigningTo) return;
    setAdding(true);
    try {
      await api.assignTeacherToSection(selectedTeacherId, assigningTo);
      setAssigningTo(null);
      setSelectedTeacherId("");
      fetchSections(); // Refresh sections
      fetchTeachers(); // Refresh teachers list too
      // Wait and then refresh
      setInternalRefreshKey((prev) => prev + 1);
      alert("Teacher assigned successfully.");
    } catch (e) {
      alert(e.message);
    } finally {
      setAdding(false);
    }
  };

  const handleUnassign = async (teacherUserId, sectionId) => {
    if (!window.confirm("Unassign this teacher from the section?")) return;
    try {
      await api.unassignTeacherFromSection(teacherUserId, sectionId);
      fetchSections();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading && !sections.length)
    return (
      <div style={{ padding: "10px 0" }}>
        <AdminSpinner /> Loading sections...
      </div>
    );

  return (
    <div style={{ marginTop: 15 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h4 style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
          Class Sections
        </h4>
        <button
          onClick={() => setShowAdd(!showAdd)}
          style={{ ...css.btnSmall, padding: "4px 10px", fontSize: 11 }}
        >
          {showAdd ? "Cancel" : "+ Add Section"}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          style={{
            background: "#f8fafc",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
            border: "1px solid #e2e8f0",
          }}
        >
          <div className="grid-2" style={{ gap: 10 }}>
            <AdminField label="Section Name (e.g. A)">
              <input
                style={{ ...css.input, padding: "8px 12px" }}
                value={newSection.name}
                onChange={(e) =>
                  setNewSection({ ...newSection, name: e.target.value })
                }
                required
                placeholder="A"
              />
            </AdminField>
            <AdminField label="Capacity">
              <input
                type="number"
                style={{ ...css.input, padding: "8px 12px" }}
                value={newSection.capacity}
                onChange={(e) =>
                  setNewSection({
                    ...newSection,
                    capacity: parseInt(e.target.value),
                  })
                }
                required
              />
            </AdminField>
          </div>
          <button
            type="submit"
            style={{ ...css.btnPrimary, width: "100%", marginTop: 5 }}
            disabled={adding}
          >
            {adding ? "Creating..." : "Create Section"}
          </button>
        </form>
      )}

      {error && (
        <div style={{ padding: "10px 0", color: "#e53e3e", fontSize: 12 }}>
          {error}
        </div>
      )}

      {!sections.length && !loading && (
        <div
          style={{
            padding: "10px 0",
            color: "var(--text-secondary)",
            fontStyle: "italic",
            fontSize: 12,
          }}
        >
          No sections defined.
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {sections.map((s) => (
          <SectionCard
            key={s.id}
            section={s}
            teachers={teachers}
            onDelete={() => handleDelete(s.id)}
            onAssign={() => {
              setAssigningTo(s.id);
              fetchTeachers();
            }}
            onUnassign={(tid) => handleUnassign(tid, s.id)}
            isAssigning={assigningTo === s.id}
            refreshKey={refreshKey}
          />
        ))}
      </div>
    </div>
  );
}
function AcademicOverviewSection({ onBack }) {
  const { activeAcademicYear, currentTerm, classLevels, refreshActiveYear } =
    useAuth();
  const [expandedClass, setExpandedClass] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [terms, setTerms] = useState([]);
  const [termsLoading, setTermsLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // New Management states
  const [allYears, setAllYears] = useState([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [newYearName, setNewYearName] = useState("");
  const [editingYearId, setEditingYearId] = useState(null);
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedYearForTerm, setSelectedYearForTerm] = useState(null);
  const [newTermData, setNewTermData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
  });

  // Class Level Management
  const [showClassModal, setShowClassModal] = useState(false);
  const [classFormData, setClassFormData] = useState({
    name: "",
    level: "primary",
    order: 1,
  });
  const [editingClassId, setEditingClassId] = useState(null);

  const [error, setError] = useState("");

  const fetchAllYears = useCallback(async () => {
    setYearsLoading(true);
    try {
      const years = await api.getAcademicYears();
      const yearsWithTerms = await Promise.all(
        years.map(async (y) => {
          const t = await api.getAcademicTerms(y.id);
          return { ...y, terms: t };
        }),
      );
      setAllYears(yearsWithTerms);
    } catch (err) {
      console.error(err);
    } finally {
      setYearsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllYears();
    if (activeAcademicYear?.id) {
      setTermsLoading(true);
      api
        .getAcademicTerms(activeAcademicYear.id)
        .then(setTerms)
        .catch(console.error)
        .finally(() => setTermsLoading(false));
    }
  }, [activeAcademicYear, fetchAllYears]);

  const handleSaveYear = async (e) => {
    e.preventDefault();
    try {
      if (editingYearId) {
        await api.updateAcademicYear(editingYearId, { year: newYearName });
      } else {
        await api.createAcademicYear({ year: newYearName });
      }
      setNewYearName("");
      setEditingYearId(null);
      setShowYearModal(false);
      fetchAllYears();
      refreshActiveYear();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteYear = async (id) => {
    if (
      !window.confirm(
        "Delete this academic session? This will delete all terms and sections associated with it!",
      )
    )
      return;
    try {
      await api.deleteAcademicYear(id);
      fetchAllYears();
      refreshActiveYear();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleActivateYear = async (id) => {
    try {
      await api.setActiveAcademicYear(id);
      fetchAllYears();
      refreshActiveYear();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    try {
      await api.createAcademicTerm({
        ...newTermData,
        academicYearId: selectedYearForTerm.id,
      });
      setNewTermData({
        name: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
      });
      setShowTermModal(false);
      fetchAllYears();
      refreshActiveYear();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleActivateTerm = async (id) => {
    try {
      await api.setActiveAcademicTerm(id);
      fetchAllYears();
      refreshActiveYear();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await api.seedClassLevels();
      await refreshActiveYear();
    } catch (err) {
      console.error("Failed to seed classes:", err);
    } finally {
      setSeeding(false);
    }
  };

  const handleSaveClassLevel = async (e) => {
    e.preventDefault();
    try {
      if (editingClassId) {
        await api.updateClassLevel(editingClassId, classFormData);
      } else {
        await api.createClassLevel(classFormData);
      }
      setShowClassModal(false);
      setEditingClassId(null);
      setClassFormData({ name: "", level: "primary", order: 1 });
      refreshActiveYear();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClassLevel = async (id) => {
    if (
      !window.confirm(
        "Delete this class level? This will also delete all its sections!",
      )
    )
      return;
    try {
      await api.deleteClassLevel(id);
      refreshActiveYear();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <style>
        {`
          .academic-table thead { display: table-header-group; }
          .academic-table tr { display: table-row; }
          .academic-table td, .academic-table th { display: table-cell; }

          @media (max-width: 600px) {
            .academic-table thead { display: none; }
            .academic-table tr { 
              display: flex; 
              flex-direction: column; 
              gap: 8px;
              padding: 16px 0;
              border-bottom: 1px solid var(--border);
            }
            .academic-table td { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              padding: 4px 0 !important;
            }
            .academic-table td::before {
              content: attr(data-label);
              font-weight: 700;
              color: var(--text-secondary);
              font-size: 11px;
              text-transform: uppercase;
            }
            .academic-table td:first-of-type { 
              font-size: 16px; 
              border-bottom: 1px solid var(--border);
              padding-bottom: 8px !important;
              margin-bottom: 4px;
            }
            .academic-table td:first-of-type::before { display: none; }
          }
        `}
      </style>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Academic Management
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            View academic years, terms, and the school's class structure.
          </p>
        </div>
        <button style={css.btnGhost} onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      {/* 1. Academic Year & Terms */}
      <div style={css.card}>
        <div style={css.cardHeader}>
          <div style={css.iconWrap("#FAEEDA")}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#854F0B"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <p style={css.cardTitle}>Academic Years & Sessions</p>
            <p style={css.cardSub}>
              Manage institutional sessions and their active status.
            </p>
          </div>
          <button
            onClick={() => setShowYearModal(true)}
            style={{
              ...css.btnSmall,
              marginLeft: "auto",
              background: "var(--accent)",
              color: "#fff",
            }}
          >
            + New Session
          </button>
        </div>
        <div style={css.divider} />

        {yearsLoading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <AdminSpinner size={24} />
          </div>
        ) : !allYears.length ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            <p style={{ marginBottom: 16 }}>
              No academic sessions have been defined yet.
            </p>
            <button
              onClick={() => setShowYearModal(true)}
              style={{
                ...css.btnSmall,
                padding: "10px 20px",
                background: "var(--accent)",
                color: "#fff",
              }}
            >
              Create First Session
            </button>
          </div>
        ) : (
          <div className="table-outer">
            <table
              className="academic-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border)",
                    textAlign: "left",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 8px",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    Session
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    Terms
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "12px 8px",
                      color: "var(--text-secondary)",
                      fontWeight: 600,
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {allYears.map((y) => (
                  <tr
                    key={y.id}
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <td
                      data-label="Session"
                      style={{ padding: "12px 8px", fontWeight: 700 }}
                    >
                      {y.year}
                    </td>
                    <td data-label="Terms" style={{ padding: "12px 8px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        {y.terms?.map((t) => (
                          <span
                            key={t.id}
                            onClick={() => handleActivateTerm(t.id)}
                            style={{
                              fontSize: 10,
                              padding: "2px 8px",
                              borderRadius: 4,
                              cursor: "pointer",
                              background: t.isCurrent
                                ? "var(--accent)"
                                : "var(--surface-muted)",
                              color: t.isCurrent
                                ? "#fff"
                                : "var(--text-secondary)",
                              fontWeight: 700,
                              border: "1px solid var(--border)",
                            }}
                            title={
                              t.isCurrent
                                ? "Current Term"
                                : "Click to set as current"
                            }
                          >
                            {t.name}
                          </span>
                        ))}
                        <button
                          onClick={() => {
                            setSelectedYearForTerm(y);
                            setShowTermModal(true);
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: "1px dashed var(--border)",
                            background: "none",
                            cursor: "pointer",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td data-label="Status" style={{ padding: "12px 8px" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: y.isActive ? "#dcfce7" : "#f1f5f9",
                          color: y.isActive ? "#15803d" : "#64748b",
                        }}
                      >
                        {y.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td data-label="Actions" style={{ padding: "12px 8px" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        {!y.isActive && (
                          <button
                            onClick={() => handleActivateYear(y.id)}
                            style={{
                              ...css.btnSmall,
                              fontSize: 11,
                              padding: "4px 8px",
                              background: "var(--accent)",
                              color: "#fff",
                              border: "none",
                            }}
                          >
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingYearId(y.id);
                            setNewYearName(y.year);
                            setShowYearModal(true);
                          }}
                          style={{
                            ...css.btnSmall,
                            fontSize: 11,
                            padding: "4px 8px",
                          }}
                        >
                          Edit
                        </button>
                        {!y.isActive && (
                          <button
                            onClick={() => handleDeleteYear(y.id)}
                            style={{
                              ...css.btnSmall,
                              fontSize: 11,
                              padding: "4px 8px",
                              color: "#e53e3e",
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Class Levels & Sections */}
      <div style={css.card}>
        <div style={css.cardHeader}>
          <div style={css.iconWrap("#E6F1FB")}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#185FA5"
              strokeWidth="2"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <p style={css.cardTitle}>Class Levels & Sections</p>
            <p style={css.cardSub}>
              View established classes and their respective sections.
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              onClick={handleSeed}
              style={{
                ...css.btnSmall,
                background: "var(--surface-muted)",
                border: "1px solid var(--border)",
              }}
              disabled={seeding}
            >
              {seeding ? "Seeding..." : "Seed Default"}
            </button>
            <button
              onClick={() => {
                setEditingClassId(null);
                setClassFormData({
                  name: "",
                  level: "primary",
                  order: classLevels.length + 1,
                });
                setShowClassModal(true);
              }}
              style={{
                ...css.btnSmall,
                background: "var(--accent)",
                color: "#fff",
              }}
            >
              + New Class Level
            </button>
          </div>
        </div>
        <div style={css.divider} />

        {!classLevels?.length ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            <p style={{ marginBottom: 16 }}>
              No class levels found. Define the school structure to proceed.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {classLevels.map((cls) => (
              <div
                key={cls.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  onClick={() =>
                    setExpandedClass(expandedClass === cls.id ? null : cls.id)
                  }
                  style={{
                    padding: "14px 18px",
                    background: "var(--glass)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-muted)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--glass)")
                  }
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "var(--accent)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        fontSize: 12,
                      }}
                    >
                      {cls.order}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0, fontSize: 14 }}>
                        {cls.name}
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--text-secondary)",
                          margin: 0,
                          textTransform: "capitalize",
                        }}
                      >
                        Level: {cls.level}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClassId(cls.id);
                        setClassFormData({
                          name: cls.name,
                          level: cls.level,
                          order: cls.order,
                        });
                        setShowClassModal(true);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClassLevel(cls.id);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e53e3e",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                    <div
                      style={{
                        transform:
                          expandedClass === cls.id ? "rotate(90deg)" : "none",
                        transition: "transform 0.2s",
                        marginLeft: 10,
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </div>
                </div>
                {expandedClass === cls.id && (
                  <div
                    style={{
                      padding: "0 18px 18px",
                      borderTop: "1px solid var(--border)",
                    }}
                  >
                    <ClassSectionsList
                      classLevelId={cls.id}
                      refreshKey={refreshKey}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showClassModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 3000,
            padding: 20,
          }}
        >
          <div
            style={{ ...css.card, width: "100%", maxWidth: 400, padding: 30 }}
          >
            <h3 style={{ margin: "0 0 8px" }}>
              {editingClassId ? "Edit" : "New"} Class Level
            </h3>
            <p style={{ ...css.cardSub, marginBottom: 20 }}>
              Define the grade or level name.
            </p>
            <form onSubmit={handleSaveClassLevel}>
              <AdminField label="Class Name" required>
                <input
                  required
                  style={css.input}
                  placeholder="e.g. Primary 1"
                  value={classFormData.name}
                  onChange={(e) =>
                    setClassFormData({ ...classFormData, name: e.target.value })
                  }
                />
              </AdminField>
              <AdminField label="Category/Level" required>
                <select
                  style={css.input}
                  value={classFormData.level}
                  onChange={(e) =>
                    setClassFormData({
                      ...classFormData,
                      level: e.target.value,
                    })
                  }
                >
                  <option value="preschool">Preschool</option>
                  <option value="primary">Primary</option>
                  <option value="jhs">JHS</option>
                  <option value="shs">SHS</option>
                </select>
              </AdminField>
              <AdminField label="Display Order" required>
                <input
                  type="number"
                  required
                  style={css.input}
                  value={classFormData.order}
                  onChange={(e) =>
                    setClassFormData({
                      ...classFormData,
                      order: parseInt(e.target.value),
                    })
                  }
                />
              </AdminField>
              {error && (
                <p style={{ color: "red", fontSize: 12, marginTop: 8 }}>
                  {error}
                </p>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowClassModal(false);
                    setError("");
                  }}
                  style={{ ...css.btnGhost, flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...css.btnGhost,
                    flex: 1,
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {editingClassId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showYearModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 3000,
            padding: 20,
          }}
        >
          <div
            style={{ ...css.card, width: "100%", maxWidth: 400, padding: 30 }}
          >
            <h3 style={{ margin: "0 0 8px" }}>
              {editingYearId ? "Edit" : "New"} Academic Session
            </h3>
            <p style={{ ...css.cardSub, marginBottom: 20 }}>
              Define the session year (e.g., 2025/2026)
            </p>
            <form onSubmit={handleSaveYear}>
              <AdminField label="Session Format (YYYY/YYYY)" required>
                <input
                  required
                  style={css.input}
                  placeholder="2025/2026"
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                />
              </AdminField>
              {error && (
                <p style={{ color: "red", fontSize: 12, marginTop: 8 }}>
                  {error}
                </p>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowYearModal(false);
                    setEditingYearId(null);
                    setNewYearName("");
                    setError("");
                  }}
                  style={{ ...css.btnGhost, flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...css.btnGhost,
                    flex: 1,
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  {editingYearId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTermModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 3000,
            padding: 20,
          }}
        >
          <div
            style={{ ...css.card, width: "100%", maxWidth: 450, padding: 30 }}
          >
            <h3 style={{ margin: "0 0 8px" }}>
              Add Term to {selectedYearForTerm?.year}
            </h3>
            <p style={{ ...css.cardSub, marginBottom: 20 }}>
              Define a new academic period
            </p>
            <form onSubmit={handleCreateTerm}>
              <AdminField label="Term Name" required>
                <input
                  required
                  style={css.input}
                  placeholder="e.g. Term 1"
                  value={newTermData.name}
                  onChange={(e) =>
                    setNewTermData({ ...newTermData, name: e.target.value })
                  }
                />
              </AdminField>
              <div className="grid-2" style={{ marginTop: 12 }}>
                <AdminField label="Start Date" required>
                  <input
                    type="date"
                    required
                    style={css.input}
                    value={newTermData.startDate}
                    onChange={(e) =>
                      setNewTermData({
                        ...newTermData,
                        startDate: e.target.value,
                      })
                    }
                  />
                </AdminField>
                <AdminField label="End Date" required>
                  <input
                    type="date"
                    required
                    style={css.input}
                    value={newTermData.endDate}
                    onChange={(e) =>
                      setNewTermData({
                        ...newTermData,
                        endDate: e.target.value,
                      })
                    }
                  />
                </AdminField>
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 12,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={newTermData.isCurrent}
                  onChange={(e) =>
                    setNewTermData({
                      ...newTermData,
                      isCurrent: e.target.checked,
                    })
                  }
                />
                Set as Current Term
              </label>
              {error && (
                <p style={{ color: "red", fontSize: 12, marginTop: 8 }}>
                  {error}
                </p>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowTermModal(false);
                    setError("");
                  }}
                  style={{ ...css.btnGhost, flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...css.btnGhost,
                    flex: 1,
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                  }}
                >
                  Add Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT ENROLLMENT COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function EnrollmentSection({ onBack }) {
  const { classLevels, activeAcademicYear } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [parentUserId, setParentUserId] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = () => {
    setLoadingApplicants(true);
    setError(null);
    api
      .getAcceptedApplicants()
      .then((data) => setApplicants(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingApplicants(false));
  };

  useEffect(() => {
    if (selectedClassId) {
      setLoadingSections(true);
      api
        .getClassSections(selectedClassId)
        .then(setSections)
        .catch(console.error)
        .finally(() => setLoadingSections(false));
    } else {
      setSections([]);
    }
    setSelectedSectionId("");
  }, [selectedClassId]);

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedApplicant || !selectedClassId || !activeAcademicYear) return;

    setIsEnrolling(true);
    setFeedback(null);

    const enrollmentData = {
      applicantId: selectedApplicant.id,
      classLevelId: selectedClassId,
      academicYearId: activeAcademicYear.id,
      ...(selectedSectionId && { sectionId: selectedSectionId }),
      ...(parentUserId && { parentUserId }),
    };

    try {
      await api.enrollStudent(enrollmentData);
      const name = [
        selectedApplicant.firstName,
        selectedApplicant.middleName,
        selectedApplicant.lastName,
      ]
        .filter(Boolean)
        .join(" ");
      setFeedback({
        type: "success",
        message: `Successfully enrolled ${name || "Student"}!`,
      });
      // Clear form
      setSelectedApplicant(null);
      setSelectedClassId("");
      setSelectedSectionId("");
      setParentUserId("");
      // Refresh list
      fetchApplicants();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Enrollment failed.",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Student Enrollment
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            Process accepted applicants and enroll them into classes for the
            active academic year.
          </p>
        </div>
        <button style={css.btnGhost} onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      {!activeAcademicYear && (
        <div
          style={{
            background: "#FFF8E1",
            border: "1px solid #FFD54F",
            borderRadius: 9,
            padding: "16px",
            marginBottom: 20,
            fontSize: 13,
            color: "#7C5800",
          }}
        >
          ⚠️ <strong>Enrollment Blocked:</strong> No active academic year found.
          Students cannot be enrolled without an active academic year.
        </div>
      )}

      {feedback && (
        <AdminAlert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="grid-2">
        {/* Left Column: Applicant List */}
        <div style={css.card}>
          <div style={css.cardHeader}>
            <div style={css.iconWrap("#E6F1FB")}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#185FA5"
                strokeWidth="2.5"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <p style={css.cardTitle}>Accepted Applicants</p>
              <p style={css.cardSub}>
                Select an applicant to begin enrollment.
              </p>
            </div>
          </div>
          <div style={css.divider} />

          {loadingApplicants ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <AdminSpinner /> Loading applicants...
            </div>
          ) : error ? (
            <div
              style={{
                color: "#e53e3e",
                fontSize: 13,
                textAlign: "center",
                padding: "10px",
              }}
            >
              {error}
            </div>
          ) : applicants.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "30px",
                color: "var(--text-secondary)",
                fontSize: 14,
              }}
            >
              No accepted applicants pending enrollment.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: "500px",
                overflowY: "auto",
                paddingRight: "4px",
              }}
            >
              {applicants.map((app) => {
                const name = [app.firstName, app.middleName, app.lastName]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApplicant(app)}
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      border: `1px solid ${selectedApplicant?.id === app.id ? "var(--accent)" : "var(--border)"}`,
                      background:
                        selectedApplicant?.id === app.id
                          ? "rgba(102, 126, 234, 0.05)"
                          : "var(--surface-muted)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {name || "Unknown Applicant"}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          background: "#C0DD97",
                          color: "#3B6D11",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Accepted
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginTop: 4,
                      }}
                    >
                      ID: {app.id.substring(0, 8)}... | Applied:{" "}
                      {formatDate(
                        app.createdAt ||
                          app.applicationDate ||
                          app.submittedAt ||
                          Date.now()
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Enrollment Form */}
        <div
          style={{
            ...css.card,
            opacity: !selectedApplicant || !activeAcademicYear ? 0.6 : 1,
            pointerEvents:
              !selectedApplicant || !activeAcademicYear ? "none" : "auto",
          }}
        >
          <div style={css.cardHeader}>
            <div style={css.iconWrap("#FAEEDA")}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#854F0B"
                strokeWidth="2.5"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <div>
              <p style={css.cardTitle}>Enroll Student</p>
              <p style={css.cardSub}>
                {selectedApplicant
                  ? `Enrolling ${[selectedApplicant.firstName, selectedApplicant.middleName, selectedApplicant.lastName].filter(Boolean).join(" ") || "selected applicant"}`
                  : "Select an applicant first"}
              </p>
            </div>
          </div>
          <div style={css.divider} />

          <form
            onSubmit={handleEnroll}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <AdminField label="Academic Year" required disabled>
              <input
                style={{
                  ...css.input,
                  background: "var(--surface-muted)",
                  color: "var(--text-secondary)",
                }}
                value={activeAcademicYear?.year || "None Active"}
                readOnly
                disabled
              />
            </AdminField>

            <AdminField label="Class Level" required>
              <select
                style={css.input}
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                required
              >
                <option value="">-- Choose Class --</option>
                {classLevels?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.level})
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label="Section (Optional)">
              <select
                style={css.input}
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                disabled={!selectedClassId || loadingSections}
              >
                <option value="">
                  {loadingSections ? "Loading..." : "-- Choose Section --"}
                </option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name} (Cap: {s.capacity})
                  </option>
                ))}
              </select>
              {selectedSectionId && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--text-secondary)",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  Note: Enrollment will fail with 400 if section is full.
                </span>
              )}
            </AdminField>

            <AdminField label="Parent User ID (Optional)">
              <input
                style={css.input}
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                value={parentUserId}
                onChange={(e) => setParentUserId(e.target.value)}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  marginTop: 4,
                  display: "block",
                }}
              >
                UUID of an existing parent account to auto-link.
              </span>
            </AdminField>

            <button
              type="submit"
              style={{ ...css.btnPrimary, width: "100%", marginTop: "10px" }}
              disabled={isEnrolling || !selectedClassId}
            >
              {isEnrolling && <AdminSpinner />}
              {isEnrolling ? "Enrolling Student..." : "Complete Enrollment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN FEE MODAL
// ─────────────────────────────────────────────────────────────────────────────

function AdminFeeModal({ open, student, currentTerm, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    category: "tuition",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      setFormData({ name: "", category: "tuition", amount: "" });
      setError(null);
    }
  }, [open]);

  if (!open || !student) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentTerm) {
      setError("No active academic term found. Cannot create fee.");
      return;
    }

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.createFee({
        name: formData.name.trim(),
        category: formData.category,
        amount: amountNum,
        studentId: student.id,
        academicTermId: currentTerm.id,
      });
      onSuccess();
    } catch (err) {
      setError(err.message || "Failed to create fee.");
    } finally {
      setLoading(false);
    }
  };

  const nameStr =
    `${student.firstName || ""} ${student.lastName || ""}`.trim() ||
    student.name ||
    "Student";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.2s",
      }}
    >
      <div
        style={{
          ...css.card,
          width: 450,
          maxWidth: "90%",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 24,
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          &times;
        </button>
        <h2
          style={{
            marginTop: 0,
            fontSize: 18,
            color: "var(--text)",
            marginBottom: 8,
          }}
        >
          Assess Fee
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          Create a new fee for <strong>{nameStr}</strong> (
          {student.studentId || student.id.substring(0, 8)}).
        </p>

        {error && (
          <div style={{ ...css.alertError, marginBottom: 16 }}>{error}</div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <AdminField label="Fee Name" required>
            <input
              type="text"
              style={css.input}
              placeholder="e.g. Tuition Fee — Term 1"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </AdminField>

          <AdminField label="Category" required>
            <select
              style={css.input}
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              <option value="tuition">Tuition</option>
              <option value="registration">Registration</option>
              <option value="exam">Exam</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </AdminField>

          <AdminField label="Amount ($)" required>
            <input
              type="number"
              step="0.01"
              min="0"
              style={css.input}
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              required
            />
          </AdminField>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 8,
            }}
          >
            <button
              type="button"
              style={css.btnGhost}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" style={css.btnPrimary} disabled={loading}>
              {loading ? "Saving..." : "Create Fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT DIRECTORY COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function StudentDirectorySection({ onBack }) {
  const { classLevels, activeAcademicYear, currentTerm } = useAuth();

  const [studentsData, setStudentsData] = useState({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [limit, setLimit] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState(null);

  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [selectedFeeStudent, setSelectedFeeStudent] = useState(null);

  useEffect(() => {
    fetchStudents(currentPage, limit, selectedClassId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, limit, selectedClassId, activeAcademicYear]);

  const fetchStudents = (page, lmt, classLevelId) => {
    setLoading(true);
    setError(null);
    const params = {
      page,
      limit: lmt,
      ...(activeAcademicYear && { academicYearId: activeAcademicYear.id }),
      ...(classLevelId && { classLevelId }),
    };

    api
      .getStudentsPaginated(params)
      .then((res) => {
        if (res && res.data) {
          setStudentsData({
            data: res.data,
            total: res.total || 0,
            page: res.page || 1,
            limit: res.limit || 20,
          });
        } else if (Array.isArray(res)) {
          setStudentsData({
            data: res,
            total: res.length,
            page: 1,
            limit: res.length,
          });
        } else {
          setStudentsData({ data: [], total: 0, page: 1, limit: 20 });
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(studentsData.total / limit);
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handleOpenFeeModal = (student) => {
    setSelectedFeeStudent(student);
    setFeeModalOpen(true);
  };

  const handleFeeSuccess = () => {
    setFeeModalOpen(false);
    setSelectedFeeStudent(null);
    setSuccessMessage("Fee successfully assessed to the student.");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Student Directory
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 4,
            }}
          >
            Browse and filter all enrolled students in the active academic year.
          </p>
        </div>
        <button style={css.btnGhost} onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ ...css.card, marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-end",
            marginBottom: 16,
          }}
        >
          <AdminField label="Filter by Class">
            <select
              style={{ ...css.input, minWidth: 200 }}
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Classes</option>
              {classLevels?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level})
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="Items per page">
            <select
              style={{ ...css.input, width: 100 }}
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </AdminField>
        </div>

        {error && (
          <div style={{ color: "#e53e3e", marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}
        {successMessage && (
          <div style={{ marginBottom: 16 }}>
            <AdminAlert type="success" message={successMessage} />
          </div>
        )}

        <div className="table-outer">
          <table className="user-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email / Contact</th>
                <th>Class Information</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: "40px 0" }}
                  >
                    <AdminSpinner />
                  </td>
                </tr>
              ) : studentsData.data.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                studentsData.data.map((student) => {
                  const {
                    id,
                    studentId,
                    firstName,
                    lastName,
                    email,
                    phone,
                    status,
                    isActive,
                    enrollments,
                  } = student;
                  const name =
                    `${firstName || ""} ${lastName || ""}`.trim() ||
                    student.name ||
                    "Unknown";

                  let classInfo = "Unassigned";
                  if (enrollments && enrollments.length > 0) {
                    const currentEnr = enrollments[0];
                    classInfo = `${currentEnr.classLevel?.name || "Unknown Class"}`;
                    if (currentEnr.section)
                      classInfo += ` - Section ${currentEnr.section.name || ""}`;
                  } else if (student.classLevel) {
                    classInfo = student.classLevel.name || "";
                  }

                  return (
                    <tr key={id}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>
                        {studentId || id.substring(0, 8)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text)" }}>
                          {name}
                        </div>
                      </td>
                      <td
                        style={{ fontSize: 12, color: "var(--text-secondary)" }}
                      >
                        {email || phone || "N/A"}
                      </td>
                      <td
                        style={{ fontSize: 13, color: "var(--text-secondary)" }}
                      >
                        {classInfo}
                      </td>
                      <td>
                        <AdminStatusBadge
                          isActive={
                            isActive === true ||
                            status === "active" ||
                            status === "Active"
                          }
                        />
                      </td>
                      <td>
                        <button
                          style={{
                            ...css.btnGhost,
                            padding: "4px 8px",
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#667eea",
                            borderColor: "rgba(102, 126, 234, 0.3)",
                          }}
                          onClick={() => handleOpenFeeModal(student)}
                          title="Assess Fee"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          Charge Fee
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && studentsData.total > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid var(--border)",
            }}
          >
            <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Showing {(currentPage - 1) * limit + 1} to{" "}
              {Math.min(currentPage * limit, studentsData.total)} of{" "}
              {studentsData.total} students
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                style={{
                  ...css.btnGhost,
                  padding: "6px 12px",
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <button
                style={{
                  ...css.btnGhost,
                  padding: "6px 12px",
                  opacity: currentPage * limit >= studentsData.total ? 0.5 : 1,
                }}
                onClick={handleNextPage}
                disabled={currentPage * limit >= studentsData.total}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMOTIONS SECTION
// ─────────────────────────────────────────────────────────────────────────────

function PromotionsSection({ onBack }) {
  const { classLevels, activeAcademicYear } = useAuth();

  const [activeTab, setActiveTab] = useState("bulk");
  const [academicYears, setAcademicYears] = useState([]);

  // Bulk State
  const [bulkClassId, setBulkClassId] = useState("");
  const [bulkToYearId, setBulkToYearId] = useState("");
  const [bulkPreview, setBulkPreview] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState(null);
  const [bulkSuccess, setBulkSuccess] = useState(null);

  // Manual State
  const [manualClassId, setManualClassId] = useState(""); // For filtering students
  const [manualStudents, setManualStudents] = useState([]);
  const [manualSelectedStudentId, setManualSelectedStudentId] = useState("");
  const [manualToYearId, setManualToYearId] = useState("");
  const [manualToClassId, setManualToClassId] = useState("");
  const [manualSectionId, setManualSectionId] = useState("");
  const [manualSections, setManualSections] = useState([]);
  const [manualIsRepeating, setManualIsRepeating] = useState(false);

  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState(null);
  const [manualSuccess, setManualSuccess] = useState(null);

  // Fetch Academic Years on Mount
  useEffect(() => {
    api
      .getAcademicYears()
      .then((res) => {
        setAcademicYears(Array.isArray(res) ? res : res.data || []);
      })
      .catch(console.error);
  }, []);

  // Fetch Manual Students when manualClassId changes
  useEffect(() => {
    if (!manualClassId) {
      setManualStudents([]);
      setManualSelectedStudentId("");
      return;
    }
    const params = { limit: 1000, classLevelId: manualClassId };
    if (activeAcademicYear) params.academicYearId = activeAcademicYear.id;

    api
      .getStudentsPaginated(params)
      .then((res) => {
        setManualStudents(Array.isArray(res) ? res : res.data || []);
      })
      .catch(console.error);
  }, [manualClassId, activeAcademicYear]);

  // Fetch specific sections when manualToClassId changes
  useEffect(() => {
    if (!manualToClassId) {
      setManualSections([]);
      setManualSectionId("");
      return;
    }
    api
      .getClassSections(manualToClassId)
      .then((data) => {
        setManualSections(Array.isArray(data) ? data : []);
      })
      .catch(console.error);
  }, [manualToClassId]);

  // Handle Bulk Preview
  const handleBulkPreview = async () => {
    if (!bulkClassId || !activeAcademicYear) {
      setBulkError("Please select a class. Active Academic Year must be set.");
      return;
    }
    setBulkError(null);
    setBulkSuccess(null);
    setBulkLoading(true);
    setBulkPreview(null);

    try {
      const res = await api.getPromotionPreview(
        bulkClassId,
        activeAcademicYear.id,
      );
      setBulkPreview(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      setBulkError(err.message || "Failed to fetch promotion preview.");
    } finally {
      setBulkLoading(false);
    }
  };

  // Handle Bulk Execute
  const handleBulkExecute = async () => {
    if (!bulkClassId || !bulkToYearId || !activeAcademicYear) {
      setBulkError("Class and Target Academic Year must be selected.");
      return;
    }
    setBulkError(null);
    setBulkLoading(true);

    try {
      await api.bulkPromoteClass({
        classLevelId: bulkClassId,
        fromAcademicYearId: activeAcademicYear.id,
        toAcademicYearId: bulkToYearId,
      });
      setBulkSuccess("Bulk promotion executed successfully.");
      setBulkPreview(null); // Clear preview after success
    } catch (err) {
      setBulkError(err.message || "Failed to execute bulk promotion.");
    } finally {
      setBulkLoading(false);
    }
  };

  // Handle Manual Execute
  const handleManualExecute = async (e) => {
    e.preventDefault();
    if (
      !manualSelectedStudentId ||
      !manualToYearId ||
      !manualToClassId ||
      !activeAcademicYear
    ) {
      setManualError("Please fill out all required fields.");
      return;
    }
    setManualError(null);
    setManualLoading(true);

    try {
      await api.manualPromoteStudent({
        studentId: manualSelectedStudentId,
        fromAcademicYearId: activeAcademicYear.id,
        toAcademicYearId: manualToYearId,
        classLevelId: manualToClassId,
        sectionId: manualSectionId || undefined,
        isRepeating: manualIsRepeating,
      });
      setManualSuccess("Manual promotion recorded successfully.");

      // Reset some fields
      setManualSelectedStudentId("");
      setManualIsRepeating(false);
    } catch (err) {
      setManualError(err.message || "Failed to execute manual promotion.");
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Student Promotions
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 4,
            }}
          >
            Manage end-of-year class promotions or manual student repetitions.
          </p>
        </div>
        <button style={css.btnGhost} onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ ...css.card, marginBottom: 20 }}>
        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border)",
            marginBottom: 24,
          }}
        >
          <button
            style={{
              padding: "12px 24px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "bulk"
                  ? "2px solid #667eea"
                  : "2px solid transparent",
              color: activeTab === "bulk" ? "#667eea" : "var(--text-secondary)",
              fontWeight: activeTab === "bulk" ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => setActiveTab("bulk")}
          >
            Bulk Class Promotion
          </button>
          <button
            style={{
              padding: "12px 24px",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "manual"
                  ? "2px solid #667eea"
                  : "2px solid transparent",
              color:
                activeTab === "manual" ? "#667eea" : "var(--text-secondary)",
              fontWeight: activeTab === "manual" ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onClick={() => setActiveTab("manual")}
          >
            Manual Override / Repeat
          </button>
        </div>

        {/* Bulk Tab Content */}
        {activeTab === "bulk" && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            {bulkError && (
              <div style={{ marginBottom: 16 }}>
                <AdminAlert type="error" message={bulkError} />
              </div>
            )}
            {bulkSuccess && (
              <div style={{ marginBottom: 16 }}>
                <AdminAlert type="success" message={bulkSuccess} />
              </div>
            )}

            {!activeAcademicYear && (
              <div style={{ marginBottom: 16 }}>
                <AdminAlert
                  type="error"
                  message="No active academic year is set. Promotions cannot be processed."
                />
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: 16,
                flexWrap: "wrap",
                alignItems: "flex-end",
                marginBottom: 24,
              }}
            >
              <AdminField label="Current Class Level" required>
                <select
                  style={{ ...css.input, minWidth: "200px" }}
                  value={bulkClassId}
                  onChange={(e) => setBulkClassId(e.target.value)}
                >
                  <option value="">-- Select Class to Promote --</option>
                  {classLevels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </AdminField>
              <AdminField label="Target Academic Year" required>
                <select
                  style={{ ...css.input, minWidth: "200px" }}
                  value={bulkToYearId}
                  onChange={(e) => setBulkToYearId(e.target.value)}
                >
                  <option value="">-- Select Next Year --</option>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.year}
                    </option>
                  ))}
                </select>
              </AdminField>
              <button
                style={{ ...css.btnGhost, padding: "10px 20px" }}
                onClick={handleBulkPreview}
                disabled={bulkLoading || !activeAcademicYear}
              >
                {bulkLoading ? "Loading..." : "Preview Promotion"}
              </button>
            </div>

            {bulkPreview && (
              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  background: "var(--bg-secondary)",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: 16,
                    color: "var(--text)",
                    fontWeight: 600,
                  }}
                >
                  Preview Results
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    marginBottom: 16,
                  }}
                >
                  {bulkPreview.length} students found in this class eligible for
                  promotion.
                </p>
                <div
                  className="table-outer"
                  style={{
                    maxHeight: 300,
                    overflowY: "auto",
                    marginBottom: 16,
                  }}
                >
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPreview.map((student, idx) => (
                        <tr key={student.id || idx}>
                          <td style={{ fontWeight: 500, color: "var(--text)" }}>
                            {student.firstName || student.name}{" "}
                            {student.lastName || ""}
                          </td>
                          <td style={{ color: "#48bb78", fontSize: 13 }}>
                            Ready to Promote
                          </td>
                        </tr>
                      ))}
                      {bulkPreview.length === 0 && (
                        <tr>
                          <td
                            colSpan={2}
                            style={{
                              textAlign: "center",
                              padding: "20px 0",
                              color: "var(--text-secondary)",
                            }}
                          >
                            No active students found in this class.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    style={{ ...css.btnPrimary, padding: "12px 24px" }}
                    onClick={handleBulkExecute}
                    disabled={
                      bulkLoading || bulkPreview.length === 0 || !bulkToYearId
                    }
                  >
                    {bulkLoading ? "Processing..." : "Execute Bulk Promotion"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Tab Content */}
        {activeTab === "manual" && (
          <div style={{ animation: "fadeIn 0.3s ease-out" }}>
            {manualError && (
              <div style={{ marginBottom: 16 }}>
                <AdminAlert type="error" message={manualError} />
              </div>
            )}
            {manualSuccess && (
              <div style={{ marginBottom: 16 }}>
                <AdminAlert type="success" message={manualSuccess} />
              </div>
            )}

            {!activeAcademicYear && (
              <div style={{ marginBottom: 16 }}>
                <AdminAlert
                  type="error"
                  message="No active academic year is set. Promotions cannot be processed."
                />
              </div>
            )}

            <form onSubmit={handleManualExecute}>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                  marginBottom: 20,
                }}
              >
                {/* Find Student Area */}
                <div
                  style={{
                    flex: 1,
                    minWidth: "280px",
                    padding: 16,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    background: "var(--bg-secondary)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: 14,
                      color: "var(--text)",
                    }}
                  >
                    1. Select Student
                  </h3>
                  <AdminField label="Filter by Current Class">
                    <select
                      style={css.input}
                      value={manualClassId}
                      onChange={(e) => setManualClassId(e.target.value)}
                    >
                      <option value="">-- Select Class --</option>
                      {classLevels.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Student" required>
                    <select
                      style={css.input}
                      value={manualSelectedStudentId}
                      onChange={(e) =>
                        setManualSelectedStudentId(e.target.value)
                      }
                      required
                      disabled={!manualClassId}
                    >
                      <option value="">
                        {manualClassId
                          ? "-- Select Student --"
                          : "Select Class first"}
                      </option>
                      {manualStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} ({s.studentId})
                        </option>
                      ))}
                    </select>
                  </AdminField>
                </div>

                {/* Target Promotion Area */}
                <div
                  style={{
                    flex: 1,
                    minWidth: "280px",
                    padding: 16,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    background: "var(--bg-secondary)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 16px 0",
                      fontSize: 14,
                      color: "var(--text)",
                    }}
                  >
                    2. Promotion Target
                  </h3>
                  <AdminField label="Target Academic Year" required>
                    <select
                      style={css.input}
                      value={manualToYearId}
                      onChange={(e) => setManualToYearId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Year --</option>
                      {academicYears.map((y) => (
                        <option key={y.id} value={y.id}>
                          {y.year}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Target Class Level" required>
                    <select
                      style={css.input}
                      value={manualToClassId}
                      onChange={(e) => setManualToClassId(e.target.value)}
                      required
                    >
                      <option value="">-- Select Target Class --</option>
                      {classLevels.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <AdminField label="Assign Section (Optional)">
                    <select
                      style={css.input}
                      value={manualSectionId}
                      onChange={(e) => setManualSectionId(e.target.value)}
                      disabled={!manualToClassId}
                    >
                      <option value="">-- Unassigned --</option>
                      {manualSections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </AdminField>
                  <div style={{ marginTop: 12 }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 14,
                        color: "var(--text)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={manualIsRepeating}
                        onChange={(e) => setManualIsRepeating(e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      Student is repeating the class
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  style={{ ...css.btnPrimary, padding: "12px 24px" }}
                  disabled={manualLoading || !activeAcademicYear}
                >
                  {manualLoading ? "Processing..." : "Execute Manual Promotion"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARENT ASSOCIATIONS VIEW
// ─────────────────────────────────────────────────────────────────────────────

function ParentAssociationsSection({ onBack }) {
  const [associations, setAssociations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAssociations();
  }, []);

  const fetchAssociations = () => {
    setLoading(true);
    api
      .getAllParentAssociations()
      .then((res) => setAssociations(Array.isArray(res) ? res : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const filteredAssoc = associations.filter(
    (assoc) =>
      assoc.parentName?.toLowerCase().includes(search.toLowerCase()) ||
      assoc.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      assoc.parentEmail?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ animation: "fadeIn 0.4s ease-out" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Parent Associations
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 4,
            }}
          >
            Audit and manage links between parents/guardians and their enrolled
            students.
          </p>
        </div>
        <button style={css.btnGhost} onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ ...css.card, marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "flex-end",
            marginBottom: 16,
          }}
        >
          <AdminField label="Search Associations">
            <input
              style={{ ...css.input, minWidth: 250 }}
              placeholder="Search by parent or student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </AdminField>
          <button
            style={{ ...css.btnGhost, height: 44, marginTop: "auto" }}
            onClick={fetchAssociations}
            disabled={loading}
          >
            {loading ? <AdminSpinner size={14} /> : "Refresh"}
          </button>
        </div>

        {error && (
          <div style={{ color: "#e53e3e", marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        <div className="table-outer">
          <table className="user-table">
            <thead>
              <tr>
                <th>Parent/Guardian</th>
                <th>Linked Student</th>
                <th>Relationship</th>
                <th>Linked Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", padding: "40px 0" }}
                  >
                    <AdminSpinner />
                  </td>
                </tr>
              ) : filteredAssoc.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      textAlign: "center",
                      padding: "40px 0",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No parent-student associations found.
                  </td>
                </tr>
              ) : (
                filteredAssoc.map((assoc) => (
                  <tr key={assoc.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>
                        {assoc.parentName}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "var(--text-secondary)" }}
                      >
                        {assoc.parentEmail}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text)" }}>
                        {assoc.studentName}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "var(--text-secondary)" }}
                      >
                        ID: {assoc.studentId}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11,
                          background: "rgba(124, 77, 255, 0.1)",
                          color: "#7c4dff",
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontWeight: 600,
                          textTransform: "capitalize",
                          border: "1px solid rgba(124, 77, 255, 0.2)",
                        }}
                      >
                        {assoc.relationship || "Guardian"}
                      </span>
                    </td>
                    <td
                      style={{ fontSize: 13, color: "var(--text-secondary)" }}
                    >
                      {new Date(assoc.linkedDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMINISTRATION VIEW (full-page)
// ─────────────────────────────────────────────────────────────────────────────

function AdministrationView({ onBack }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        maxWidth: "100%",
        padding: "0 0 40px",
        color: "var(--text)",
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div
        className="admin-view-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Administration
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            Manage teacher, student, and parent accounts.
          </p>
        </div>
        <button
          style={{ ...css.btnGhost, padding: "10px 16px" }}
          onClick={onBack}
        >
          ← Back
        </button>
      </div>

      <CreateUserSection onCreated={triggerRefresh} />
      <UsersListSection
        refreshTrigger={refreshKey}
        onSelectUser={(u) => setSelectedUser(u)}
      />
      <UserActionsSection
        selectedUser={selectedUser}
        onClearUser={() => setSelectedUser(null)}
        onActionDone={triggerRefresh}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS-IN-JS TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const css = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "var(--card-padding, 24px)",
    marginBottom: 20,
    boxShadow: "var(--card-shadow)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 20,
  },
  iconWrap: (bg) => ({
    width: 40,
    height: 40,
    borderRadius: 12,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  }),
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "var(--text)",
    margin: 0,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
    color: "var(--text-secondary)",
    margin: 0,
    lineHeight: 1.6,
  },
  divider: { height: 1, background: "var(--border)", margin: "0 0 20px" },
  input: {
    width: "100%",
    padding: "12px 16px",
    border: "1.5px solid var(--border)",
    borderRadius: 10,
    fontSize: 14,
    color: "var(--text)",
    background: "var(--input-bg)",
    outline: "none",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxSizing: "border-box",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background:
      "linear-gradient(135deg, var(--accent) 0%, var(--accent-blue) 100%)",
    color: "#fff",
    boxShadow: "0 8px 25px -5px rgba(124, 77, 255, 0.35)",
    transition: "transform 0.2s, opacity 0.2s, box-shadow 0.2s",
  },
  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "linear-gradient(135deg, #f56565 0%, #c53030 100%)",
    color: "#fff",
    transition: "transform 0.2s, opacity 0.2s",
  },
  btnSuccess: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "linear-gradient(135deg, #48bb78 0%, #2f855a 100%)",
    color: "#fff",
    transition: "transform 0.2s, opacity 0.2s",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    background: "var(--glass)",
    border: "1px solid var(--border)",
    color: "var(--text-secondary)",
    transition: "all 0.2s scale 0.1s",
    backdropFilter: "blur(4px)",
  },
  btnSmall: {
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid var(--border)",
    background: "var(--surface-muted)",
    color: "var(--text-secondary)",
    transition: "background 0.2s",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN NAV ITEMS for Sidebar
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_SIDEBAR_ICON = (d) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((p, i) => <path key={i} d={p} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);

const ADMIN_NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: ADMIN_SIDEBAR_ICON(
      "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
    ),
  },
  {
    id: "administration",
    label: "Manage Users",
    icon: ADMIN_SIDEBAR_ICON([
      "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
      "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      "M16 11l2 2 4-4",
    ]),
  },
  {
    id: "academic",
    label: "Academic Year & Classes",
    icon: ADMIN_SIDEBAR_ICON([
      "M22 10v6M2 10l10-5 10 5-10 5z",
      "M6 12v5c3 3 9 3 12 0v-5",
    ]),
  },
  {
    id: "enrollment",
    label: "Student Enrollment",
    icon: ADMIN_SIDEBAR_ICON([
      "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
      "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      "M19 8v6",
      "M22 11h-6",
    ]),
  },
  {
    id: "students",
    label: "Student Directory",
    icon: ADMIN_SIDEBAR_ICON([
      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
      "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      "M23 21v-2a4 4 0 0 0-3-3.87",
      "M16 3.13a4 4 0 0 1 0 7.75",
    ]),
  },
  {
    id: "promotions",
    label: "Student Promotions",
    icon: ADMIN_SIDEBAR_ICON([
      "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z",
      "M13 2v7h7",
      "M16 16l-4-4-4 4",
      "M12 12v8",
    ]),
  },
  {
    id: "parent-associations",
    label: "Parent Associations",
    icon: ADMIN_SIDEBAR_ICON([
      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2",
      "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
      "M23 21v-2a4 4 0 0 0-3-3.87",
      "M16 3.13a4 4 0 0 1 0 7.75",
    ]),
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: ADMIN_SIDEBAR_ICON([
      "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9",
      "M13.73 21a2 2 0 0 1-3.46 0",
    ]),
    action: "/notifications",
  },
];

export default function AdminDashboard() {
  const { activeAcademicYear, user } = useAuth();
  const { formatDate, formatTime } = useTheme();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const token = localStorage.getItem("token");

  const broadcastAction = {
    label: "Broadcast Notification",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
    ),
    onClick: () => setShowNotifModal(true),
  };

  useEffect(() => {
    if (currentView !== "dashboard") return;
    setStatsLoading(true);
    setStatsError(null);
    adminRequest("GET", "/administration/users")
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((e) => setStatsError(e.message))
      .finally(() => setStatsLoading(false));
  }, [currentView]);

  const recentUsers = [...users].slice(0, 5);

  // Derive counts for summary stats
  const teachers = users.filter((u) => u.role === "teacher").length;
  const students = users.filter((u) => u.role === "student").length;
  const parents = users.filter((u) => u.role === "parent").length;
  const inactive = users.filter((u) => !u.isActive).length;

  const statCards = [
    {
      title: "Total Users",
      value: users.length,
      color: "#6366f1",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: "Teachers",
      value: teachers,
      color: "#7c4dff",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      ),
    },
    {
      title: "Students",
      value: students,
      color: "#448aff",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      title: "Parents",
      value: parents,
      color: "#818cf8",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
  ];

  // Determine view-specific content and title
  let viewContent = null;
  let viewTitle = "Administrator Console";

  switch (currentView) {
    case "administration":
      viewTitle = "Manage Users";
      viewContent = <AdministrationView onBack={() => setCurrentView("dashboard")} />;
      break;
    case "academic":
      viewTitle = "Academic Year & Classes";
      viewContent = <AcademicOverviewSection onBack={() => setCurrentView("dashboard")} />;
      break;
    case "enrollment":
      viewTitle = "Student Enrollment";
      viewContent = <EnrollmentSection onBack={() => setCurrentView("dashboard")} />;
      break;
    case "students":
      viewTitle = "Student Directory";
      viewContent = <StudentDirectorySection onBack={() => setCurrentView("dashboard")} />;
      break;
    case "promotions":
      viewTitle = "Student Promotions";
      viewContent = <PromotionsSection onBack={() => setCurrentView("dashboard")} />;
      break;
    case "parent-associations":
      viewTitle = "Parent Associations";
      viewContent = <ParentAssociationsSection onBack={() => setCurrentView("dashboard")} users={users} />;
      break;
    default:
      // Main Dashboard View
      viewContent = (
        <>
          <div className="dashboard-header">
            <div className="dashboard-sub">
              Manage all user accounts and permissions for your school.
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {statCards.map((s) => (
              <StatCard key={s.title} {...s} loading={statsLoading} />
            ))}
          </div>

          {/* Recent Users Panel */}
          <div className="panels admin-panels-grid">
            <section className="panel recent-registrations">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ margin: 0 }}>Recent User Accounts</h3>
                <button
                  style={css.btnGhost}
                  onClick={() => setCurrentView("administration")}
                >
                  View All →
                </button>
              </div>
              <RecentUsersTable users={recentUsers} loading={statsLoading} />
            </section>

            {/* Summary Panel */}
            <section className="panel attendance-panel">
              <h3>Account Summary</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginTop: 8,
                }}
              >
                {[
                  {
                    label: "Total Users",
                    value: users.length,
                    color: "#6366f1",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    ),
                  },
                  {
                    label: "Active Users",
                    value: users.filter((u) => u.isActive).length,
                    color: "#7c4dff",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ),
                  },
                  {
                    label: "Inactive Users",
                    value: inactive,
                    color: "#312e81",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                      </svg>
                    ),
                  },
                  {
                    label: "Teachers",
                    value: teachers,
                    color: "#448aff",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <polyline points="16 11 18 13 22 9" />
                      </svg>
                    ),
                  },
                  {
                    label: "Students",
                    value: students,
                    color: "#6366f1",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Parents",
                    value: parents,
                    color: "#818cf8",
                    icon: (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="summary-stat-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 14px",
                      background: "var(--surface-muted)",
                      borderRadius: 9,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
                      {item.icon} {item.label}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: item.color }}>
                      {statsLoading ? "…" : item.value}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <button
                  style={{ ...css.btnPrimary, width: "100%" }}
                  onClick={() => setCurrentView("administration")}
                >
                  Open Administration Panel
                </button>
              </div>
            </section>
          </div>
        </>
      );
  }

  return (
    <DashboardLayout
      navItems={ADMIN_NAV_ITEMS}
      activeItem={currentView}
      onNavigate={setCurrentView}
      pageTitle={viewTitle}
      portalLabel="GIS Admin Hub v2.5"
      primaryAction={broadcastAction}
    >
      <div className="dashboard admin-dashboard-container">
        {/* Modal - defined once at the top level */}
        <NotificationSendModal
          isOpen={showNotifModal}
          onClose={() => setShowNotifModal(false)}
          token={token}
          serviceUrl={API_BASE}
          userRole={user?.role || "admin"}
        />
        <style>
          {`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .admin-dashboard-container { 
            animation: fadeIn 0.4s ease-out; 
            padding: 24px !important; 
            box-sizing: border-box;
          }
          .admin-panels-grid {
            display: grid;
            grid-template-columns: 1.6fr 1fr;
            gap: 20px;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 24px;
          }
          .admin-panels-grid .recent-registrations,
          .admin-panels-grid .attendance-panel {
            grid-column: span 1 !important;
            width: 100%;
          }
          @media (max-width: 1200px) {
            .stats-grid {
               grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 1024px) {
            .admin-panels-grid {
              grid-template-columns: 1fr;
            }
            .admin-panels-grid .recent-registrations,
            .admin-panels-grid .attendance-panel {
              grid-column: span 1 !important;
            }
          }
          @media (max-width: 768px) {
            .admin-dashboard-container { padding: 16px !important; }
            .user-table { min-width: 600px; }
            .stats-grid {
               grid-template-columns: 1fr;
               gap: 12px;
            }
          }
          @media (max-width: 480px) {
            .admin-dashboard-container { padding: 12px !important; }
            .dashboard-header h2 { font-size: 1.2rem !important; }
          }
        `}
        </style>

        {viewContent}
      </div>
    </DashboardLayout>
  );
}
