import React, { useState, useEffect, useCallback, useRef } from "react";
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
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) {
    // NestJS can return message as string or string[]
    let msg =
      (Array.isArray(data?.message) ? data.message.join(", ") : data?.message) ||
      data?.error ||
      null;
    // 500s often have no useful body — give an actionable hint
    if (!msg && res.status === 500) {
      msg = "Internal server error (500). This usually means your admin account has no school assigned, or the backend message broker (Kafka) is unavailable. Check the server logs.";
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
          ? { background: "#FCEBEB", border: "1px solid #F09595", color: "#791F1F" }
          : { background: "#EAF3DE", border: "1px solid #C0DD97", color: "#27500A" }),
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "inherit", opacity: 0.6 }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function AdminRoleBadge({ role }) {
  const map = {
    teacher: { bg: "#E6F1FB", color: "#185FA5" },
    student: { bg: "#FAEEDA", color: "#854F0B" },
    parent:  { bg: "#EAF3DE", color: "#3B6D11" },
    admin:   { bg: "#EEEDFE", color: "#534AB7" },
  };
  const s = map[role?.toLowerCase()] || { bg: "#F1EFE8", color: "#5F5E5A" };
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "3px 9px", borderRadius: 99,
        fontSize: 11, fontWeight: 600, textTransform: "uppercase",
        background: s.bg, color: s.color,
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
        display: "inline-flex", alignItems: "center",
        padding: "3px 9px", borderRadius: 99,
        fontSize: 11, fontWeight: 600, textTransform: "uppercase",
        background: isActive ? "#EAF3DE" : "#FCEBEB",
        color:      isActive ? "#3B6D11" : "#A32D2D",
      }}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function AdminAvatar({ email, size = 36 }) {
  const initials = email ? email[0].toUpperCase() : "?";
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "#E6F1FB", color: "#185FA5",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 600, fontSize: size * 0.38, flexShrink: 0,
        border: "1.5px solid #B5D4F4",
      }}
    >
      {initials}
    </div>
  );
}

function AdminConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          borderRadius: 18, padding: "30px 32px",
          maxWidth: 420, width: "90%",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
        }}
      >
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{title}</p>
        <p style={{ color: "#5F5E5A", fontSize: 13, marginBottom: 20 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={css.btnGhost} onClick={onCancel} disabled={loading}>Cancel</button>
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
      <label style={{ fontSize: 12, fontWeight: 600, color: "#4a5568", display: "block", marginBottom: 5 }}>
        {label}
        {required && <span style={{ color: "#E24B4A", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "#B4B2A9", marginTop: 4 }}>{hint}</p>}
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
    <div style={{ background: "#FFF5F5", border: "1px solid #FEB2B2", borderRadius: 10, padding: "14px 16px", marginTop: 14 }}>
      <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Temporary Password Generated</p>
      <p style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 10 }}>
        Share this with the user. They will be prompted to change it on first login.
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", border: "1px solid #FEB2B2", borderRadius: 8, padding: "10px 14px" }}>
        <code style={{ fontSize: 15, letterSpacing: 2, fontWeight: 700 }}>{password}</code>
        <button style={css.btnSmall} onClick={copy}>{copied ? "Copied!" : "Copy"}</button>
      </div>
      <button style={{ ...css.btnGhost, marginTop: 10, fontSize: 12 }} onClick={onDismiss}>Dismiss</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS CARD
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ title, value, color, icon, loading }) {
  return (
    <div className="stat-card" style={{ ...css.card, borderLeft: `5px solid ${color}`, minWidth: 200 }}>
      <div className="stat-card-icon" style={{ fontSize: 24, marginBottom: 12 }}>{icon}</div>
      <div className="stat-card-title" style={css.cardSub}>{title}</div>
      <div className="stat-card-value" style={{ fontSize: 28, fontWeight: 800, color: "#1A202C", marginTop: 4 }}>
        {loading ? <AdminSpinner size={18} /> : (value?.toLocaleString() ?? "0")}
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
      <div style={{ textAlign: "center", padding: "24px 0", color: "#A0AEC0", fontSize: 13 }}>
        <AdminSpinner size={16} /> Loading recent users…
      </div>
    );
  }
  if (!users.length) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0", color: "#A0AEC0", fontSize: 13 }}>
        No users found in this school yet.
      </div>
    );
  }
  return (
    <table className="recent-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Role</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <AdminAvatar email={u.email} size={34} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1A202C" }}>
                    {u.firstName || u.lastName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : u.email}
                  </div>
                  {(u.firstName || u.lastName) && (
                    <div style={{ fontSize: 11, color: "#718096" }}>{u.email}</div>
                  )}
                </div>
              </div>
            </td>
            <td><AdminRoleBadge role={u.role} /></td>
            <td><AdminStatusBadge isActive={u.isActive} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE USER SECTION
// ─────────────────────────────────────────────────────────────────────────────

function CreateUserSection({ onCreated }) {
  const [form, setForm]         = useState({ email: "", role: "teacher" });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null);
  const [error, setError]       = useState(null);
  const [preflight, setPreflight] = useState(null); // null | "ok" | "no-school"

  // Check that this admin account has a school assigned before allowing user creation
  useEffect(() => {
    adminRequest("GET", "/administration/users")
      .then(() => setPreflight("ok"))
      .catch(() => setPreflight("no-school"));
  }, []);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null); setSuccess(null); setLoading(true);
    try {
      const data = await adminRequest("POST", "/administration/create-user", {
        email: form.email.trim(),
        role:  form.role,
      });
      setSuccess(`User created. A temporary password has been sent to ${data.email || form.email}.`);
      setForm({ email: "", role: "teacher" });
      onCreated?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Show a warning banner if this admin has no schoolId — creation will always 500
  const preflightWarning = preflight === "no-school" ? (
    <div style={{ background: "#FFF8E1", border: "1px solid #FFD54F", borderRadius: 9, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#7C5800" }}>
      ⚠️ <strong>Account not linked to a school.</strong> Your admin account has no school assignment in the database.
      User creation will fail until a superadmin assigns your account to a school via the Superadmin panel.
    </div>
  ) : null;

  const roleOptions = [
    { role: "teacher", icon: "T", bg: "#E6F1FB", color: "#185FA5", desc: "Manages sections, attendance & grades." },
    { role: "student", icon: "S", bg: "#FAEEDA", color: "#854F0B", desc: "Access to their own academic portal." },
    { role: "parent",  icon: "P", bg: "#EAF3DE", color: "#3B6D11", desc: "Links to children and monitors progress." },
  ];

  return (
    <div style={css.card}>
      <div style={css.cardHeader}>
        <div style={css.iconWrap("#E6F1FB")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <div>
          <p style={css.cardTitle}>Create user</p>
          <p style={css.cardSub}>Add a teacher, student, or parent. They receive a temporary password via email.</p>
        </div>
      </div>
      <div style={css.divider} />

      {preflightWarning}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <AdminField label="Email address" required hint="The user's login email.">
          <input
            style={css.input}
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="e.g. teacher@school.com"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </AdminField>
        <AdminField label="Role" required hint="Determines what this user can access.">
          <select style={css.input} value={form.role} onChange={update("role")}>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
        </AdminField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "4px 0 18px" }}>
        {roleOptions.map((r) => (
          <div
            key={r.role}
            onClick={() => setForm((f) => ({ ...f, role: r.role }))}
            style={{
              borderRadius: 10, padding: 12, cursor: "pointer",
              transition: "border 0.15s, background 0.15s",
              border: form.role === r.role ? `1.5px solid ${r.color}` : "1px solid #D3D1C7",
              background: form.role === r.role ? r.bg : "#FAFAFA",
            }}
          >
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: r.bg, color: r.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, marginBottom: 6, border: `1px solid ${r.color}44` }}>
              {r.icon}
            </div>
            <p style={{ fontWeight: 600, fontSize: 12, color: r.color, marginBottom: 3 }}>
              {r.role.charAt(0).toUpperCase() + r.role.slice(1)}
            </p>
            <p style={{ fontSize: 11, color: "#888780", lineHeight: 1.4 }}>{r.desc}</p>
          </div>
        ))}
      </div>

      <AdminAlert type="error"   message={error}   onClose={() => setError(null)} />
      <AdminAlert type="success" message={success} onClose={() => setSuccess(null)} />

      <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <button style={css.btnPrimary} onClick={submit} disabled={loading}>
          {loading && <AdminSpinner />}
          {loading ? "Creating…" : "Create user"}
        </button>
        <button
          style={css.btnGhost}
          onClick={() => { setForm({ email: "", role: "teacher" }); setError(null); setSuccess(null); }}
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
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [filter, setFilter]           = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const [roleFilter, setRoleFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy]           = useState("email");

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilter(filter), 300);
    return () => clearTimeout(timer);
  }, [filter]);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await adminRequest("GET", "/administration/users");
      setUsers(Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers, refreshTrigger]);

  const filtered = users
    .filter((u) => {
      const q = debouncedFilter.toLowerCase();
      const matchSearch = !q || u.email?.toLowerCase().includes(q) || 
                          u.id?.toLowerCase().includes(q) ||
                          (u.firstName + " " + u.lastName).toLowerCase().includes(q);
      const matchRole   = roleFilter === "all" || u.role === roleFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active"   &&  u.isActive) ||
        (statusFilter === "inactive" && !u.isActive);
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "email")  return (a.email || "").localeCompare(b.email || "");
      if (sortBy === "role")   return (a.role  || "").localeCompare(b.role  || "");
      if (sortBy === "status") return Number(b.isActive) - Number(a.isActive);
      return 0;
    });

  const total    = users.length;
  const active   = users.filter((u) => u.isActive).length;
  const inactive = total - active;
  const teachers = users.filter((u) => u.role === "teacher").length;
  const students = users.filter((u) => u.role === "student").length;
  const parents  = users.filter((u) => u.role === "parent").length;

  return (
    <div style={css.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={css.cardHeader}>
          <div style={css.iconWrap("#EAF3DE")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <p style={css.cardTitle}>School users</p>
            <p style={css.cardSub}>All accounts under this school. Click a row to select a user for actions.</p>
          </div>
        </div>
        <button style={css.btnGhost} onClick={fetchUsers} disabled={loading}>
          {loading ? <><AdminSpinner />Loading…</> : "↻ Refresh"}
        </button>
      </div>

      {/* Mini stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Total",    value: total,    color: "#444441" },
          { label: "Active",   value: active,   color: "#3B6D11" },
          { label: "Inactive", value: inactive, color: "#A32D2D" },
          { label: "Teachers", value: teachers, color: "#185FA5" },
          { label: "Students", value: students, color: "#854F0B" },
          { label: "Parents",  value: parents,  color: "#0F6E56" },
        ].map((s) => (
          <div key={s.label} style={{ background: "#F7FAFC", borderRadius: 8, padding: "10px 12px", border: "1px solid #E2E8F0" }}>
            <p style={{ fontSize: 11, color: "#888780", marginBottom: 3 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 600, color: s.color }}>{loading ? "…" : s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          style={{ ...css.input, flex: 1, minWidth: 180 }}
          placeholder="Search by email or ID…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select style={{ ...css.input, width: 130 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
        <select style={{ ...css.input, width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select style={{ ...css.input, width: 130 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="email">Sort: Email</option>
          <option value="role">Sort: Role</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      <AdminAlert type="error" message={error} onClose={() => setError(null)} />

      {/* Table header */}
      {filtered.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", padding: "6px 12px", fontSize: 10, fontWeight: 700, color: "#A0AEC0", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>
          <span style={{ flex: 2 }}>User</span>
          <span style={{ flex: 1 }}>Role</span>
          <span style={{ flex: 1 }}>Status</span>
          <span style={{ flex: 2, textAlign: "right" }}>ID</span>
          <span style={{ width: 70 }}></span>
        </div>
      )}

      {loading && users.length === 0 && (
        <div style={{ textAlign: "center", color: "#A0AEC0", fontSize: 13, padding: "32px 0" }}>
          <AdminSpinner size={16} /> Loading users…
        </div>
      )}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: "center", color: "#A0AEC0", fontSize: 13, padding: "32px 0" }}>
          {users.length === 0 ? "No users in this school yet." : "No users match your filters."}
        </div>
      )}

      {filtered.map((u) => {
        const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim();
        return (
          <div
            key={u.id}
            onClick={() => onSelectUser(u)}
            style={{ 
              display: "flex", alignItems: "center", padding: "12px 16px", 
              borderRadius: 12, border: "1px solid rgba(237, 242, 247, 0.8)", 
              marginBottom: 8, transition: "all 0.2s", cursor: "pointer",
              background: "rgba(255, 255, 255, 0.4)" 
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(102, 126, 234, 0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 2 }}>
              <AdminAvatar email={u.email} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1A202C" }}>
                  {fullName || u.email}
                </p>
                {fullName && (
                  <p style={{ fontSize: 11, color: "#718096", marginTop: 2 }}>{u.email}</p>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}><AdminRoleBadge role={u.role} /></div>
            <div style={{ flex: 1 }}><AdminStatusBadge isActive={u.isActive} /></div>
            <div style={{ flex: 2, textAlign: "right" }}>
              <code style={{ fontSize: 10, color: "#A0AEC0", letterSpacing: 0.5 }}>{u.id}</code>
            </div>
            <div style={{ width: 70, textAlign: "right" }}>
              <button 
                style={{ ...css.btnSmall, background: "#E6F1FB", color: "#185FA5", border: "none" }}
              >
                Select
              </button>
            </div>
          </div>
        );
      })}

      {filtered.length > 0 && (
        <p style={{ fontSize: 11, color: "#B4B2A9", marginTop: 10, textAlign: "right" }}>
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
  const [userId, setUserId]             = useState("");
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingDeact, setLoadingDeact] = useState(false);
  const [loadingReact, setLoadingReact] = useState(false);
  const [resetResult, setResetResult]   = useState(null);
  const [confirm, setConfirm]           = useState(null);
  const [feedback, setFeedback]         = useState(null);
  const inputRef = useRef(null);

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
    setConfirm(null); setLoadingReset(true); setFeedback(null); setResetResult(null);
    try {
      const data = await adminRequest("POST", `/administration/reset-password/${activeId}`);
      if (data?.temporaryPassword) {
        setResetResult({ tempPassword: data.temporaryPassword });
      } else {
        setFeedback({ type: "success", message: data?.message || "Password reset. A temporary password was sent." });
      }
      onActionDone?.();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    } finally { setLoadingReset(false); }
  };

  const doDeactivate = async () => {
    setConfirm(null); setLoadingDeact(true); setFeedback(null);
    try {
      const data = await adminRequest("PATCH", `/administration/deactivate/${activeId}`);
      setFeedback({ type: "success", message: data?.message || "User deactivated. They can no longer log in." });
      onActionDone?.();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    } finally { setLoadingDeact(false); }
  };

  const doReactivate = async () => {
    setConfirm(null); setLoadingReact(true); setFeedback(null);
    try {
      const data = await adminRequest("PATCH", `/administration/activate/${activeId}`);
      setFeedback({ type: "success", message: data?.message || "User reactivated successfully." });
      onActionDone?.();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    } finally { setLoadingReact(false); }
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
          </div>
          <div>
            <p style={css.cardTitle}>User actions</p>
            <p style={css.cardSub}>Select a user from the list above or paste their UUID manually.</p>
          </div>
        </div>
        <div style={css.divider} />

        {selectedUser && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F7FAFC", border: "1px solid #E2E8F0", borderRadius: 9, padding: "10px 14px", marginBottom: 16 }}>
            <AdminAvatar email={selectedUser.email} size={32} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 13 }}>{selectedUser.email}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                <AdminRoleBadge role={selectedUser.role} />
                <AdminStatusBadge isActive={selectedUser.isActive} />
              </div>
            </div>
            <button style={css.btnGhost} onClick={() => { onClearUser(); setUserId(""); }}>Clear</button>
          </div>
        )}

        <AdminField label="User ID (UUID)" required hint="Paste from the users list, or click Select on a row above to auto-fill.">
          <input
            ref={inputRef}
            style={css.input}
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setFeedback(null); setResetResult(null); }}
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
          />
        </AdminField>

        {userId && !/^[0-9a-f-]{36}$/.test(userId.trim()) && (
          <p style={{ fontSize: 12, color: "#E24B4A", marginTop: -8, marginBottom: 12 }}>
            This doesn't look like a valid UUID.
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {/* Reset Password */}
          <div style={{ border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Reset password</p>
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
          <div style={{ border: "1px solid #F7C1C1", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: "#A32D2D" }}>Deactivate user</p>
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
          <div style={{ border: "1px solid #C0DD97", borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: "#3B6D11" }}>Reactivate user</p>
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

        {feedback && (
          <AdminAlert type={feedback.type} message={feedback.message} onClose={() => setFeedback(null)} />
        )}
        {resetResult?.tempPassword && (
          <AdminTempPasswordCard password={resetResult.tempPassword} onDismiss={() => setResetResult(null)} />
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMINISTRATION VIEW (full-page)
// ─────────────────────────────────────────────────────────────────────────────

function AdministrationView({ onBack }) {
  const [refreshKey, setRefreshKey]     = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "100%", padding: "0 0 40px", color: "#2C2C2A" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#2C2C2A", margin: 0 }}>Administration</h1>
          <p style={{ fontSize: 13, color: "#888780", marginTop: 4, lineHeight: 1.5 }}>
            Manage teacher, student, and parent accounts for this school. All changes are applied immediately.
          </p>
        </div>
        <button style={css.btnGhost} onClick={onBack}>← Back to Dashboard</button>
      </div>

      <CreateUserSection onCreated={triggerRefresh} />
      <UsersListSection refreshTrigger={refreshKey} onSelectUser={(u) => setSelectedUser(u)} />
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
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(232, 230, 223, 0.4)",
    borderRadius: 16,
    padding: "24px",
    marginBottom: 20,
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.03)",
  },
  cardHeader: { display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 },
  iconWrap: (bg) => ({
    width: 40, height: 40, borderRadius: 12,
    background: bg,
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  }),
  cardTitle: { fontSize: 16, fontWeight: 700, color: "#1A202C", margin: 0, marginBottom: 4 },
  cardSub:   { fontSize: 13, color: "#718096", margin: 0, lineHeight: 1.6 },
  divider:   { height: 1, background: "rgba(226, 232, 240, 0.6)", margin: "0 0 20px" },
  input: {
    width: "100%", padding: "12px 16px",
    border: "1.5px solid rgba(226, 232, 240, 0.8)", borderRadius: 10,
    fontSize: 14, color: "#2D3748", background: "rgba(255, 255, 255, 0.6)",
    outline: "none", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    boxSizing: "border-box",
  },
  btnPrimary: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
    cursor: "pointer", border: "none",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.25)",
    transition: "transform 0.2s, opacity 0.2s, box-shadow 0.2s",
  },
  btnDanger: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
    cursor: "pointer", border: "none",
    background: "linear-gradient(135deg, #f56565 0%, #c53030 100%)",
    color: "#fff",
    transition: "transform 0.2s, opacity 0.2s",
  },
  btnSuccess: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
    cursor: "pointer", border: "none",
    background: "linear-gradient(135deg, #48bb78 0%, #2f855a 100%)",
    color: "#fff",
    transition: "transform 0.2s, opacity 0.2s",
  },
  btnGhost: {
    display: "inline-flex", alignItems: "center",
    padding: "10px 18px", borderRadius: 10, fontSize: 14, fontWeight: 500,
    cursor: "pointer", background: "rgba(255, 255, 255, 0.4)",
    border: "1px solid rgba(226, 232, 240, 0.8)", color: "#4A5568",
    transition: "all 0.2s scale 0.1s",
    backdropFilter: "blur(4px)",
  },
  btnSmall: {
    padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
    cursor: "pointer", border: "1px solid rgba(226, 232, 240, 0.8)",
    background: "rgba(237, 242, 247, 0.6)", color: "#4A5568",
    transition: "background 0.2s",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [users, setUsers]             = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError]   = useState(null);

  useEffect(() => {
    if (currentView !== "dashboard") return;
    setStatsLoading(true);
    setStatsError(null);
    adminRequest("GET", "/administration/users")
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((e) => setStatsError(e.message))
      .finally(() => setStatsLoading(false));
  }, [currentView]);

  if (currentView === "administration") {
    return (
      <div className="dashboard admin-dashboard-container">
        <style>
          {`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            .admin-dashboard-container { animation: fadeIn 0.4s ease-out; }
            
            /* Mobile Responsiveness */
            @media (max-width: 860px) {
              .dashboard { padding: 12px !important; }
              .grid-stats { grid-template-columns: 1fr !important; gap: 12px !important; }
              .grid-main { grid-template-columns: 1fr !important; gap: 20px !important; }
              .administration-content { grid-template-columns: 1fr !important; gap: 24px !important; }
              
              .modal-content { width: 95% !important; margin: 10px !important; padding: 20px !important; border-radius: 20px !important; }
              .form-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
              
              .table-outer { overflow-x: auto !important; -webkit-overflow-scrolling: touch; border-radius: 12px; }
              .user-table { min-width: 700px; }
              
              .card-header { flex-direction: column !important; align-items: stretch !important; gap: 14px; }
              .header-actions { width: 100%; flex-direction: column; gap: 8px; }
              .search-input { width: 100% !important; }
              
              .dashboard-header h2 { font-size: 1.5rem !important; }
            }
            .table-outer::-webkit-scrollbar { height: 5px; }
            .table-outer::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
          `}
        </style>
        <AdministrationView onBack={() => setCurrentView("dashboard")} />
      </div>
    );
  }

  const teachers = users.filter((u) => u.role === "teacher").length;
  const students = users.filter((u) => u.role === "student").length;
  const parents  = users.filter((u) => u.role === "parent").length;
  const inactive = users.filter((u) => !u.isActive).length;

  const statCards = [
    { title: "Students",        value: students, color: "#667eea", icon: "👥" },
    { title: "Teachers",        value: teachers, color: "#48bb78", icon: "👨‍🏫" },
    { title: "Parents",         value: parents,  color: "#ed8936", icon: "👪" },
    { title: "Inactive Users",  value: inactive, color: "#f56565", icon: "⚠️" },
  ];

  const recentUsers = [...users].slice(0, 8);

  return (
    <div className="dashboard admin-dashboard-container">
      <style>
        {`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .admin-dashboard-container { animation: fadeIn 0.4s ease-out; }
          
          @media (max-width: 860px) {
            .dashboard { padding: 12px !important; }
            .grid-stats { grid-template-columns: 1fr !important; }
            .grid-main { grid-template-columns: 1fr !important; }
            .table-outer { overflow-x: auto !important; }
            .user-table { min-width: 700px; }
            .dashboard-header h2 { font-size: 1.5rem !important; }
          }
        `}
      </style>

      <div className="dashboard-header">
        <h2>School Administration Dashboard</h2>
        <div className="dashboard-sub">
          Manage all user accounts and permissions for your school.
        </div>
      </div>

      {/* Quick Action */}
      <div style={{ marginBottom: 24 }}>
        <button
          style={{ ...css.btnPrimary, padding: "12px 22px", fontSize: 14, gap: 8 }}
          onClick={() => setCurrentView("administration")}
        >
          👤 Manage Users & Accounts
        </button>
      </div>

      {statsError && (
        <AdminAlert type="error" message={`Failed to load stats: ${statsError}`} onClose={() => setStatsError(null)} />
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        {statCards.map((s) => (
          <StatCard key={s.title} {...s} loading={statsLoading} />
        ))}
      </div>

      {/* Recent Users Panel */}
      <div className="panels">
        <section className="panel recent-registrations">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Recent User Accounts</h3>
            <button style={css.btnGhost} onClick={() => setCurrentView("administration")}>
              View All →
            </button>
          </div>
          <RecentUsersTable users={recentUsers} loading={statsLoading} />
        </section>

        {/* Summary Panel */}
        <section className="panel attendance-panel">
          <h3>Account Summary</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            {[
              { label: "Total Users",    value: users.length,  color: "#667eea", icon: "👥" },
              { label: "Active Users",   value: users.filter(u => u.isActive).length, color: "#48bb78", icon: "✅" },
              { label: "Inactive Users", value: inactive,      color: "#f56565", icon: "🚫" },
              { label: "Teachers",       value: teachers,      color: "#ed8936", icon: "👨‍🏫" },
              { label: "Students",       value: students,      color: "#667eea", icon: "📚" },
              { label: "Parents",        value: parents,       color: "#0F6E56", icon: "👪" },
            ].map((item) => (
              <div
                key={item.label}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F7FAFC", borderRadius: 9, border: "1px solid #EDF2F7" }}
              >
                <span style={{ fontSize: 13, color: "#5F5E5A" }}>{item.icon} {item.label}</span>
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
    </div>
  );
}
