import React, { useState, useEffect, useCallback, useRef } from "react";
import api from "../../lib/api";
import {
  formatNumber,
  formatDate,
  getStatusColor,
} from "../../lib/dashboardData";
import QuickActions from "../QuickActions";
import Notifications from "../Notifications";
import UpcomingEvents from "../UpcomingEvents";
import TopPerformers from "../TopPerformers";
import "../Dashboard.css";
import "./DashboardStyles.css";

// ─────────────────────────────────────────────────────────────────────────────
// ADMINISTRATION COMPONENTS & LOGIC
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function adminRequest(baseUrl, token, method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const res = await fetch(`${baseUrl}${path}`, config);

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const msg =
      data?.message ||
      (Array.isArray(data?.message) ? data.message.join(", ") : null) ||
      `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

function AdminField({ label, required, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={adminCss.label}>
        {label}
        {required && <span style={{ color: "#E24B4A", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={adminCss.hint}>{hint}</p>}
    </div>
  );
}

function AdminAlert({ type, message, onClose }) {
  if (!message) return null;
  const isErr = type === "error";
  return (
    <div style={{ ...adminCss.alert, ...(isErr ? adminCss.alertErr : adminCss.alertOk) }}>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button onClick={onClose} style={adminCss.alertClose}>
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
    <span style={{ ...adminCss.badge, background: s.bg, color: s.color }}>
      {role || "—"}
    </span>
  );
}

function AdminStatusBadge({ isActive }) {
  return (
    <span
      style={{
        ...adminCss.badge,
        background: isActive ? "#EAF3DE" : "#FCEBEB",
        color:      isActive ? "#3B6D11" : "#A32D2D",
      }}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function AdminSpinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
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

function AdminAvatar({ email, size = 36 }) {
  const initials = email ? email[0].toUpperCase() : "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#E6F1FB",
        color: "#185FA5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size * 0.38,
        flexShrink: 0,
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
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div style={adminCss.modal}>
        <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{title}</p>
        <p style={{ color: "#5F5E5A", fontSize: 13, marginBottom: 20 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button style={adminCss.btnGhost} onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button style={adminCss.btnDanger} onClick={onConfirm} disabled={loading}>
            {loading && <AdminSpinner />} Confirm
          </button>
        </div>
      </div>
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
    <div style={adminCss.tempCard}>
      <p style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>
        Temporary Password Generated
      </p>
      <p style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 10 }}>
        Share this with the user. They will be prompted to change it on first login.
      </p>
      <div style={adminCss.tempBox}>
        <code style={{ fontSize: 15, letterSpacing: 2, fontWeight: 700 }}>
          {password}
        </code>
        <button style={adminCss.btnSmall} onClick={copy}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <button
        style={{ ...adminCss.btnGhost, marginTop: 10, fontSize: 12 }}
        onClick={onDismiss}
      >
        Dismiss
      </button>
    </div>
  );
}

function CreateUserSection({ baseUrl, token, onCreated }) {
  const [form, setForm]       = useState({ email: "", role: "teacher" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (!form.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Enter a valid email address.";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const data = await adminRequest(baseUrl, token, "POST", "/administration/create-user", {
        email: form.email.trim(),
        role:  form.role,
      });
      setSuccess(
        `User created successfully. A temporary password has been sent to ${data.email || form.email}.`
      );
      setForm({ email: "", role: "teacher" });
      onCreated?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={adminCss.card}>
      <div style={adminCss.cardHeader}>
        <div style={adminCss.cardIconWrap("#E6F1FB")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="19" y1="8" x2="19" y2="14"/>
            <line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
        </div>
        <div>
          <p style={adminCss.cardTitle}>Create user</p>
          <p style={adminCss.cardSubtitle}>
            Add a teacher, student, or parent account. They receive a temporary password via email.
          </p>
        </div>
      </div>

      <div style={adminCss.divider} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <AdminField label="Email address" required hint="The user's login email.">
          <input
            style={adminCss.input}
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="e.g. teacher@springfield.com"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </AdminField>

        <AdminField
          label="Role"
          required
          hint="Determines what this user can access."
        >
          <select style={adminCss.input} value={form.role} onChange={update("role")}>
            <option value="teacher">Teacher — can manage sections & view students</option>
            <option value="student">Student — access student portal</option>
            <option value="parent">Parent — can link and view children</option>
          </select>
        </AdminField>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
          margin: "4px 0 18px",
        }}
      >
        {[
          {
            role: "teacher",
            desc: "Assigned to sections, views enrolled students, manages attendance & grades.",
            icon: "T",
            bg: "#E6F1FB",
            color: "#185FA5",
          },
          {
            role: "student",
            desc: "Views their own record, enrollment history, and assigned class.",
            icon: "S",
            bg: "#FAEEDA",
            color: "#854F0B",
          },
          {
            role: "parent",
            desc: "Links to one or more students, monitors their child's school status.",
            icon: "P",
            bg: "#EAF3DE",
            color: "#3B6D11",
          },
        ].map((r) => (
          <div
            key={r.role}
            onClick={() => setForm((f) => ({ ...f, role: r.role }))}
            style={{
              ...adminCss.roleCard,
              border:
                form.role === r.role
                  ? `1.5px solid ${r.color}`
                  : "1px solid #D3D1C7",
              background: form.role === r.role ? r.bg : "#FAFAFA",
              cursor: "pointer",
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
        <button style={adminCss.btnPrimary} onClick={submit} disabled={loading}>
          {loading && <AdminSpinner />}
          {loading ? "Creating…" : "Create user"}
        </button>
        <button
          style={adminCss.btnGhost}
          onClick={() => { setForm({ email: "", role: "teacher" }); setError(null); setSuccess(null); }}
          disabled={loading}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function UsersListSection({ baseUrl, token, refreshTrigger, onSelectUser }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [filter, setFilter]   = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy]   = useState("email");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminRequest(baseUrl, token, "GET", "/administration/users");
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setUsers(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers, refreshTrigger]);

  const filtered = users
    .filter((u) => {
      const q = filter.toLowerCase();
      const matchSearch = !q || u.email?.toLowerCase().includes(q) || u.id?.toLowerCase().includes(q);
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
    <div style={adminCss.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={adminCss.cardHeader}>
          <div style={adminCss.cardIconWrap("#EAF3DE")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B6D11" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <p style={adminCss.cardTitle}>School users</p>
            <p style={adminCss.cardSubtitle}>All accounts under this school. Click a row to select a user for actions.</p>
          </div>
        </div>
        <button style={adminCss.btnGhost} onClick={fetchUsers} disabled={loading}>
          {loading ? <><AdminSpinner />Loading…</> : "↻ Refresh"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Total",     value: total,    color: "#444441" },
          { label: "Active",    value: active,   color: "#3B6D11" },
          { label: "Inactive",  value: inactive, color: "#A32D2D" },
          { label: "Teachers",  value: teachers, color: "#185FA5" },
          { label: "Students",  value: students, color: "#854F0B" },
          { label: "Parents",   value: parents,  color: "#0F6E56" },
        ].map((s) => (
          <div key={s.label} style={adminCss.statCard}>
            <p style={{ fontSize: 11, color: "#888780", marginBottom: 3 }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 600, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input
          style={{ ...adminCss.input, flex: 1, minWidth: 180 }}
          placeholder="Search by email or ID…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select style={{ ...adminCss.input, width: 130 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
        <select style={{ ...adminCss.input, width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select style={{ ...adminCss.input, width: 130 }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="email">Sort: Email</option>
          <option value="role">Sort: Role</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      <AdminAlert type="error" message={error} onClose={() => setError(null)} />

      {filtered.length > 0 && (
        <div style={adminCss.tableHeader}>
          <span style={{ flex: 2 }}>User</span>
          <span style={{ flex: 1 }}>Role</span>
          <span style={{ flex: 1 }}>Status</span>
          <span style={{ flex: 2, textAlign: "right" }}>ID</span>
          <span style={{ width: 70 }}></span>
        </div>
      )}

      {loading && users.length === 0 && (
        <div style={adminCss.emptyState}>
          <AdminSpinner /> Loading users…
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={adminCss.emptyState}>
          {users.length === 0 ? "No users in this school yet." : "No users match your filters."}
        </div>
      )}

      {filtered.map((u) => (
        <div
          key={u.id}
          style={adminCss.userRow}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F8F7F4")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 2 }}>
            <AdminAvatar email={u.email} />
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A" }}>{u.email}</p>
              {u.firstName && (
                <p style={{ fontSize: 11, color: "#888780", marginTop: 1 }}>
                  {u.firstName} {u.lastName}
                </p>
              )}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <AdminRoleBadge role={u.role} />
          </div>
          <div style={{ flex: 1 }}>
            <AdminStatusBadge isActive={u.isActive} />
          </div>
          <div style={{ flex: 2, textAlign: "right" }}>
            <code style={{ fontSize: 10, color: "#B4B2A9" }}>{u.id}</code>
          </div>
          <div style={{ width: 70, textAlign: "right" }}>
            <button
              style={{ ...adminCss.btnSmall, background: "#E6F1FB", color: "#185FA5", border: "none" }}
              onClick={() => onSelectUser(u)}
            >
              Select
            </button>
          </div>
        </div>
      ))}

      {filtered.length > 0 && (
        <p style={{ fontSize: 11, color: "#B4B2A9", marginTop: 10, textAlign: "right" }}>
          Showing {filtered.length} of {total} user{total !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

function UserActionsSection({ baseUrl, token, selectedUser, onClearUser, onActionDone }) {
  const [userId, setUserId]           = useState("");
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingDeact, setLoadingDeact] = useState(false);
  const [resetResult, setResetResult] = useState(null);
  const [confirm, setConfirm]         = useState(null);
  const [feedback, setFeedback]       = useState(null);
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
    setConfirm(null);
    setLoadingReset(true);
    setFeedback(null);
    setResetResult(null);
    try {
      const data = await adminRequest(baseUrl, token, "POST", `/administration/reset-password/${activeId}`);
      if (data?.temporaryPassword) {
        setResetResult({ tempPassword: data.temporaryPassword });
      } else {
        setFeedback({ type: "success", message: data?.message || "Password reset. A temporary password was sent to the user." });
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
      const data = await adminRequest(baseUrl, token, "PATCH", `/administration/deactivate/${activeId}`);
      setFeedback({ type: "success", message: data?.message || "User deactivated successfully. They can no longer log in." });
      onActionDone?.();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    } finally {
      setLoadingDeact(false);
    }
  };

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
        message={`${selectedUser?.email || activeId} will lose all access immediately. This can be reversed by a superadmin.`}
        onConfirm={doDeactivate}
        onCancel={() => setConfirm(null)}
        loading={loadingDeact}
      />

      <div style={adminCss.card}>
        <div style={adminCss.cardHeader}>
          <div style={adminCss.cardIconWrap("#FAEEDA")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#854F0B" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
            </svg>
          </div>
          <div>
            <p style={adminCss.cardTitle}>User actions</p>
            <p style={adminCss.cardSubtitle}>
              Select a user from the list above or paste their UUID manually. Actions are irreversible
              without superadmin access.
            </p>
          </div>
        </div>

        <div style={adminCss.divider} />

        {selectedUser && (
          <div style={adminCss.selectedUserBanner}>
            <AdminAvatar email={selectedUser.email} size={32} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 13 }}>{selectedUser.email}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                <AdminRoleBadge role={selectedUser.role} />
                <AdminStatusBadge isActive={selectedUser.isActive} />
              </div>
            </div>
            <button style={adminCss.btnGhost} onClick={() => { onClearUser(); setUserId(""); }}>
              Clear
            </button>
          </div>
        )}

        <AdminField label="User ID (UUID)" required hint="Paste from the users list or select a row above to auto-fill.">
          <input
            ref={inputRef}
            style={adminCss.input}
            value={userId}
            onChange={(e) => { setUserId(e.target.value); setFeedback(null); setResetResult(null); }}
            placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
          />
        </AdminField>

        {userId && !/^[0-9a-f-]{36}$/.test(userId.trim()) && (
          <p style={{ fontSize: 12, color: "#E24B4A", marginTop: -8, marginBottom: 12 }}>
            This doesn't look like a valid UUID. Double-check the value.
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={adminCss.actionCard}>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Reset password</p>
              <p style={{ fontSize: 12, color: "#888780", lineHeight: 1.5 }}>
                Generates a new temporary password and sends it to the user's email. The user must
                change it on next login.
              </p>
            </div>
            <button
              style={{ ...adminCss.btnPrimary, width: "100%" }}
              onClick={() => setConfirm("reset")}
              disabled={!activeId || loadingReset || loadingDeact}
            >
              {loadingReset && <AdminSpinner />}
              {loadingReset ? "Resetting…" : "Reset password"}
            </button>
            <p style={{ fontSize: 11, color: "#B4B2A9", marginTop: 8 }}>
              Endpoint: POST /administration/reset-password/:userId
            </p>
          </div>

          <div style={{ ...adminCss.actionCard, borderColor: "#F7C1C1" }}>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: "#A32D2D" }}>
                Deactivate user
              </p>
              <p style={{ fontSize: 12, color: "#888780", lineHeight: 1.5 }}>
                Immediately revokes this user's access to the system. Their data is preserved. Only
                a superadmin can reactivate.
              </p>
            </div>
            <button
              style={{ ...adminCss.btnDanger, width: "100%" }}
              onClick={() => setConfirm("deactivate")}
              disabled={!activeId || loadingReset || loadingDeact}
            >
              {loadingDeact && <AdminSpinner />}
              {loadingDeact ? "Deactivating…" : "Deactivate user"}
            </button>
            <p style={{ fontSize: 11, color: "#B4B2A9", marginTop: 8 }}>
              Endpoint: PATCH /administration/deactivate/:userId
            </p>
          </div>
        </div>

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

function AdministrationSection({ token, baseUrl = DEFAULT_BASE_URL, onBack }) {
  const [refreshKey, setRefreshKey]     = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <div style={adminCss.page}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={adminCss.pageHeader}>
        <div>
          <h1 style={adminCss.pageTitle}>Administration</h1>
          <p style={adminCss.pageDesc}>
            Manage teacher, student, and parent accounts for this school.
            All changes are applied immediately.
          </p>
        </div>
        <button style={adminCss.btnGhost} onClick={onBack}>
          ← Back to Dashboard
        </button>
      </div>

      <CreateUserSection
        baseUrl={baseUrl}
        token={token}
        onCreated={triggerRefresh}
      />

      <UsersListSection
        baseUrl={baseUrl}
        token={token}
        refreshTrigger={refreshKey}
        onSelectUser={(u) => setSelectedUser(u)}
      />

      <UserActionsSection
        baseUrl={baseUrl}
        token={token}
        selectedUser={selectedUser}
        onClearUser={() => setSelectedUser(null)}
        onActionDone={triggerRefresh}
      />
    </div>
  );
}

const adminCss = {
  page: {
    fontFamily: "'Inter', sans-serif",
    maxWidth: "100%",
    padding: "0 0 40px",
    color: "#2C2C2A",
  },
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
    flexWrap: "wrap",
    gap: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: "#2C2C2A",
    margin: 0,
  },
  pageDesc: {
    fontSize: 13,
    color: "#888780",
    marginTop: 4,
    lineHeight: 1.5,
  },
  card: {
    background: "#fff",
    border: "1px solid #E8E6DF",
    borderRadius: 14,
    padding: "22px 24px",
    marginBottom: 20,
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  cardIconWrap: (bg) => ({
    width: 36,
    height: 36,
    borderRadius: 9,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#2C2C2A",
    margin: 0,
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#888780",
    margin: 0,
    lineHeight: 1.5,
  },
  divider: {
    height: 1,
    background: "#F1EFE8",
    margin: "0 0 18px",
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#4a5568",
    display: "block",
    marginBottom: 5,
  },
  hint: {
    fontSize: 11,
    color: "#B4B2A9",
    marginTop: 4,
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #E2E8F0",
    borderRadius: 8,
    fontSize: 13,
    color: "#2C2C2A",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.15s",
  },
  alert: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 13,
    marginTop: 12,
    lineHeight: 1.5,
  },
  alertErr: {
    background: "#FCEBEB",
    border: "1px solid #F09595",
    color: "#791F1F",
  },
  alertOk: {
    background: "#EAF3DE",
    border: "1px solid #C0DD97",
    color: "#27500A",
  },
  alertClose: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    color: "inherit",
    opacity: 0.6,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 9px",
    borderRadius: 99,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
  },
  statCard: {
    background: "#F7FAFC",
    borderRadius: 8,
    padding: "10px 12px",
    border: "1px solid #E2E8F0",
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    padding: "6px 12px",
    fontSize: 10,
    fontWeight: 700,
    color: "#A0AEC0",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 9,
    border: "1px solid #EDF2F7",
    marginBottom: 6,
    transition: "background 0.1s",
  },
  emptyState: {
    textAlign: "center",
    color: "#A0AEC0",
    fontSize: 13,
    padding: "32px 0",
  },
  roleCard: {
    borderRadius: 10,
    padding: "12px",
    transition: "border 0.15s, background 0.15s",
  },
  actionCard: {
    border: "1px solid #E2E8F0",
    borderRadius: 10,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  selectedUserBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#F7FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: 9,
    padding: "10px 14px",
    marginBottom: 16,
  },
  tempCard: {
    background: "#FFF5F5",
    border: "1px solid #FEB2B2",
    borderRadius: 10,
    padding: "14px 16px",
    marginTop: 14,
  },
  tempBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#fff",
    border: "1px solid #FEB2B2",
    borderRadius: 8,
    padding: "10px 14px",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 18px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "#667eea",
    color: "#fff",
    transition: "opacity 0.15s",
  },
  btnDanger: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 18px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    background: "#F56565",
    color: "#fff",
    transition: "opacity 0.15s",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    background: "transparent",
    border: "1px solid #E2E8F0",
    color: "#4A5568",
    transition: "background 0.15s",
  },
  btnSmall: {
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    border: "1px solid #E2E8F0",
    background: "#EDF2F7",
    color: "#4A5568",
  },
  modal: {
    background: "#fff",
    borderRadius: 14,
    padding: "24px 28px",
    maxWidth: 400,
    width: "90%",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// END ADMINISTRATION COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function StatCard({ title, value, change, color, icon, trend }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-title">{title}</div>
      <div className="stat-card-value">{formatNumber(value)}</div>
      {typeof change !== "undefined" && (
        <div
          className={`stat-card-change ${
            change >= 0 ? "positive" : "negative"
          }`}
        >
          {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}

function RecentTable({ rows = [] }) {
  return (
    <table className="recent-table">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Class</th>
          <th>Registration Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((student) => (
          <tr key={student.id}>
            <td>
              <div className="student-info">
                <div className="student-avatar">{student.avatar}</div>
                <span className="student-name">{student.name}</span>
              </div>
            </td>
            <td>{student.className}</td>
            <td>{formatDate(student.date)}</td>
            <td>
              <span
                className="status-badge"
                style={{
                  backgroundColor: `${getStatusColor(student.status)}20`,
                  color: getStatusColor(student.status),
                }}
              >
                {student.status}
              </span>
            </td>
            <td>
              <button className="view-btn">View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Student Form Modal Component
function StudentFormModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    class: "",
    phone: "",
    enrollmentDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      name: "",
      email: "",
      class: "",
      phone: "",
      enrollmentDate: "",
    });
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      email: "",
      class: "",
      phone: "",
      enrollmentDate: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Student</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter student's full name"
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter student's email"
            />
          </div>

          <div className="form-group">
            <label>Class/Grade:</label>
            <select
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a class</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label>Enrollment Date:</label>
            <input
              type="date"
              name="enrollmentDate"
              value={formData.enrollmentDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit">Add Student</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add this after StudentFormModal component
function CreateClassModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    className: "",
    gradeLevel: "",
    section: "",
    teacher: "",
    subject: "",
    room: "",
    schedule: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      className: "",
      gradeLevel: "",
      section: "",
      teacher: "",
      subject: "",
      room: "",
      schedule: "",
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      className: "",
      gradeLevel: "",
      section: "",
      teacher: "",
      subject: "",
      room: "",
      schedule: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Class</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Class Name:</label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleInputChange}
              required
              placeholder="e.g., Mathematics, Science, English"
            />
          </div>

          <div className="form-group">
            <label>Grade Level:</label>
            <select
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              required
            >
              <option value="">Select grade level</option>
              <option value="Kindergarten">Kindergarten</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div className="form-group">
            <label>Section:</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              required
              placeholder="e.g., A, B, C, D"
            />
          </div>

          <div className="form-group">
            <label>Teacher:</label>
            <input
              type="text"
              name="teacher"
              value={formData.teacher}
              onChange={handleInputChange}
              required
              placeholder="Enter teacher's name"
            />
          </div>

          <div className="form-group">
            <label>Subject:</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Enter subject name"
            />
          </div>

          <div className="form-group">
            <label>Room Number:</label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              placeholder="e.g., Room 101"
            />
          </div>

          <div className="form-group">
            <label>Schedule:</label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={handleInputChange}
              placeholder="e.g., Mon-Wed-Fri 9:00-10:00 AM"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit">Create Class</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Generate Report Modal Component
function GenerateReportModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    reportType: "",
    dateRange: "",
    format: "",
    includeCharts: false,
    emailReport: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      reportType: "",
      dateRange: "",
      format: "",
      includeCharts: false,
      emailReport: false,
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      reportType: "",
      dateRange: "",
      format: "",
      includeCharts: false,
      emailReport: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Generate Report</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Report Type:</label>
            <select
              name="reportType"
              value={formData.reportType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select report type</option>
              <option value="student-performance">Student Performance</option>
              <option value="attendance-summary">Attendance Summary</option>
              <option value="financial-report">Financial Report</option>
              <option value="class-progress">Class Progress</option>
              <option value="teacher-performance">Teacher Performance</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date Range:</label>
            <select
              name="dateRange"
              value={formData.dateRange}
              onChange={handleInputChange}
              required
            >
              <option value="">Select date range</option>
              <option value="last-week">Last Week</option>
              <option value="last-month">Last Month</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="form-group">
            <label>Format:</label>
            <select
              name="format"
              value={formData.format}
              onChange={handleInputChange}
              required
            >
              <option value="">Select format</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="html">Web Page</option>
            </select>
          </div>

          <div className="form-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="includeCharts"
                checked={formData.includeCharts}
                onChange={handleInputChange}
              />
              Include Charts and Graphs
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="emailReport"
                checked={formData.emailReport}
                onChange={handleInputChange}
              />
              Email me the report
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit">Generate Report</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Manage Fees Modal Component
function ManageFeesModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    studentId: "",
    feeType: "",
    amount: "",
    dueDate: "",
    paymentStatus: "pending",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      studentId: "",
      feeType: "",
      amount: "",
      dueDate: "",
      paymentStatus: "pending",
      description: "",
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      studentId: "",
      feeType: "",
      amount: "",
      dueDate: "",
      paymentStatus: "pending",
      description: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Manage Fees</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student ID/Name:</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              required
              placeholder="Enter student ID or name"
            />
          </div>

          <div className="form-group">
            <label>Fee Type:</label>
            <select
              name="feeType"
              value={formData.feeType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select fee type</option>
              <option value="tuition">Tuition Fee</option>
              <option value="registration">Registration Fee</option>
              <option value="exam">Examination Fee</option>
              <option value="transport">Transport Fee</option>
              <option value="hostel">Hostel Fee</option>
              <option value="library">Library Fee</option>
              <option value="sports">Sports Fee</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount ($):</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Due Date:</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Status:</label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleInputChange}
              required
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional notes about the fee"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit">Save Fee Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// View Attendance Modal Component
function ViewAttendanceModal({ isOpen, onClose }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedClass, setSelectedClass] = useState("");

  // Mock attendance data
  useEffect(() => {
    if (isOpen) {
      const mockData = [
        {
          id: 1,
          name: "Grade 1 - Section A",
          present: 22,
          total: 25,
          percentage: 88,
        },
        {
          id: 2,
          name: "Grade 2 - Section B",
          present: 18,
          total: 20,
          percentage: 90,
        },
        {
          id: 3,
          name: "Grade 3 - Section A",
          present: 24,
          total: 28,
          percentage: 86,
        },
        {
          id: 4,
          name: "Grade 4 - Section C",
          present: 20,
          total: 22,
          percentage: 91,
        },
        {
          id: 5,
          name: "Grade 5 - Section A",
          present: 19,
          total: 21,
          percentage: 90,
        },
      ];
      setAttendanceData(mockData);
    }
  }, [isOpen]);

  const handleClose = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedClass("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "800px" }}>
        <div className="modal-header">
          <h2>View Attendance</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="attendance-filters">
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              <option value="grade1">Grade 1</option>
              <option value="grade2">Grade 2</option>
              <option value="grade3">Grade 3</option>
              <option value="grade4">Grade 4</option>
              <option value="grade5">Grade 5</option>
            </select>
          </div>
        </div>

        <div className="attendance-summary">
          <h3>Attendance Summary for {selectedDate}</h3>
          <div className="attendance-stats">
            {attendanceData.map((classData) => (
              <div key={classData.id} className="attendance-stat-card">
                <div className="attendance-class-name">{classData.name}</div>
                <div className="attendance-numbers">
                  <span className="present-count">{classData.present}</span>
                  <span className="total-count">/ {classData.total}</span>
                </div>
                <div className="attendance-percentage">
                  {classData.percentage}%
                </div>
                <div className="attendance-bar">
                  <div
                    className="attendance-fill"
                    style={{
                      width: `${classData.percentage}%`,
                      backgroundColor:
                        classData.percentage >= 90
                          ? "#48bb78"
                          : classData.percentage >= 80
                          ? "#ed8936"
                          : "#f56565",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleClose}>
            Close
          </button>
          <button type="button" className="btn-primary">
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// Send Notifications Modal Component
function SendNotificationsModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    notificationType: "",
    targetAudience: "",
    title: "",
    message: "",
    scheduleSend: false,
    sendDate: "",
    sendTime: "",
    priority: "normal",
    includeEmail: false,
    includeSMS: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      notificationType: "",
      targetAudience: "",
      title: "",
      message: "",
      scheduleSend: false,
      sendDate: "",
      sendTime: "",
      priority: "normal",
      includeEmail: false,
      includeSMS: false,
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      notificationType: "",
      targetAudience: "",
      title: "",
      message: "",
      scheduleSend: false,
      sendDate: "",
      sendTime: "",
      priority: "normal",
      includeEmail: false,
      includeSMS: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "700px" }}>
        <div className="modal-header">
          <h2>Send Notifications</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Notification Type:</label>
            <select
              name="notificationType"
              value={formData.notificationType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select type</option>
              <option value="announcement">General Announcement</option>
              <option value="reminder">Reminder</option>
              <option value="alert">Alert</option>
              <option value="update">System Update</option>
              <option value="event">Event Notification</option>
              <option value="academic">Academic Update</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Audience:</label>
            <select
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              required
            >
              <option value="">Select audience</option>
              <option value="all">All Users</option>
              <option value="students">Students Only</option>
              <option value="teachers">Teachers Only</option>
              <option value="parents">Parents Only</option>
              <option value="staff">Staff Only</option>
              <option value="specific-class">Specific Class</option>
              <option value="specific-grade">Specific Grade</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority:</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter notification title"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label>Message:</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              placeholder="Enter your notification message here..."
              rows="5"
              maxLength="1000"
            />
            <div className="char-count">
              {formData.message.length}/1000 characters
            </div>
          </div>

          <div className="form-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="scheduleSend"
                checked={formData.scheduleSend}
                onChange={handleInputChange}
              />
              Schedule for later
            </label>
          </div>

          {formData.scheduleSend && (
            <div className="form-row">
              <div className="form-group">
                <label>Send Date:</label>
                <input
                  type="date"
                  name="sendDate"
                  value={formData.sendDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="form-group">
                <label>Send Time:</label>
                <input
                  type="time"
                  name="sendTime"
                  value={formData.sendTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <div className="notification-channels">
            <h4>Delivery Channels</h4>
            <div className="form-checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="includeEmail"
                  checked={formData.includeEmail}
                  onChange={handleInputChange}
                />
                Send via Email
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="includeSMS"
                  checked={formData.includeSMS}
                  onChange={handleInputChange}
                />
                Send via SMS
              </label>
              <label
                className="checkbox-label"
                style={{ color: "#4299e1", fontWeight: "bold" }}
              >
                <input type="checkbox" checked readOnly disabled />
                In-app Notification (Always enabled)
              </label>
            </div>
          </div>

          <div className="notification-preview">
            <h4>Preview</h4>
            <div className="preview-card">
              <div className="preview-header">
                <strong>{formData.title || "Notification Title"}</strong>
                <span
                  className={`priority-badge priority-${formData.priority}`}
                >
                  {formData.priority}
                </span>
              </div>
              <div className="preview-message">
                {formData.message ||
                  "Your notification message will appear here..."}
              </div>
              <div className="preview-footer">
                <small>
                  Sent: {formData.scheduleSend ? "Scheduled" : "Now"}
                </small>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {formData.scheduleSend ? "Schedule Notification" : "Send Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main AdminDashboard Component - ONLY ONE OF THESE!
export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");

  // State for the student form modal
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showFeesForm, setShowFeesForm] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, studentsData] = await Promise.all([
          api.getDashboardStats(),
          api.getStudents()
        ]);

        const mappedStats = [
          {
            title: "Total Students",
            value: statsData.totalStudents || 0,
            change: 0,
            color: "#667eea",
            icon: "👥",
            trend: "stable",
          },
          {
            title: "Active Teachers",
            value: statsData.totalTeachers || 0,
            change: 0,
            color: "#48bb78",
            icon: "👨‍🏫",
            trend: "stable",
          },
          {
            title: "Classes",
            value: statsData.totalClasses || 0,
            change: 0,
            color: "#ed8936",
            icon: "🏫",
            trend: "stable",
          },
          {
            title: "Pending Fees",
            value: 0,
            change: 0,
            color: "#f56565",
            icon: "💰",
            trend: "stable",
          },
        ];

        setStats(mappedStats);
        setRecentStudents(Array.isArray(studentsData) ? studentsData.slice(0, 5) : []);
        
        // Mocking attendance for now as it needs a specific date
        const today = new Date().toISOString().split('T')[0];
        const attendanceData = await api.getAttendance(today);
        // Map attendanceData if needed, or use a fallback
        setAttendance([
          { name: "Grade 10-A", pct: 96, present: 28, total: 30, trend: "up" },
          { name: "Grade 9-B", pct: 89, present: 25, total: 28, trend: "down" },
        ]);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle quick action clicks
  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action.label}`, action);

    // Handle different quick actions
    switch (action.action) {
      case "addStudent":
        setShowStudentForm(true);
        break;
      case "createClass":
        setShowClassForm(true);
        break;
      case "generateReport":
        setShowReportForm(true);
        break;
      case "manageFees":
        setShowFeesForm(true);
        break;
      case "viewAttendance":
        setShowAttendanceModal(true);
        break;
      case "sendNotifications":
        setShowNotificationsModal(true);
        break;
      case "manageUsers":
        setCurrentView("administration");
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  // Handle form submission
  const handleAddStudent = (studentData) => {
    console.log("New student data:", studentData);
    alert(`Student ${studentData.name} added successfully!`);
  };

  const handleCreateClass = (classData) => {
    console.log("New class data:", classData);
    alert(`Class "${classData.className}" created successfully!`);
  };

  const handleGenerateReport = (reportData) => {
    console.log("Report configuration:", reportData);
    alert(`Report generation started! You will receive it shortly.`);
  };

  const handleManageFees = (feeData) => {
    console.log("Fee data:", feeData);
    alert(`Fee record saved successfully for student ${feeData.studentId}`);
  };
  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <div className="dashboard-sub">Loading...</div>
        </div>
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      </div>
    );
  }
  const handleSendNotifications = (notificationData) => {
    console.log("Notification data:", notificationData);

    const recipientCount =
      notificationData.targetAudience === "all"
        ? "all users"
        : notificationData.targetAudience;
    const deliveryMethod = [];

    if (notificationData.includeEmail) deliveryMethod.push("email");
    if (notificationData.includeSMS) deliveryMethod.push("SMS");
    deliveryMethod.push("in-app");

    if (notificationData.scheduleSend) {
      alert(
        `Notification scheduled for ${notificationData.sendDate} at ${
          notificationData.sendTime
        }! It will be sent to ${recipientCount} via ${deliveryMethod.join(
          ", "
        )}.`
      );
    } else {
      alert(
        `Notification sent successfully to ${recipientCount} via ${deliveryMethod.join(
          ", "
        )}!`
      );
    }
  };

  if (currentView === "administration") {
    return (
      <div className="dashboard">
        <AdministrationSection
          token={token}
          baseUrl={DEFAULT_BASE_URL}
          onBack={() => setCurrentView("dashboard")}
        />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>School Management Dashboard</h2>
        <div className="dashboard-sub">
          Welcome back! Here's what's happening in your school today.
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onActionClick={handleQuickAction} />

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={showStudentForm}
        onClose={() => setShowStudentForm(false)}
        onSubmit={handleAddStudent}
      />
      <CreateClassModal
        isOpen={showClassForm}
        onClose={() => setShowClassForm(false)}
        onSubmit={handleCreateClass}
      />
      <GenerateReportModal
        isOpen={showReportForm}
        onClose={() => setShowReportForm(false)}
        onSubmit={handleGenerateReport}
      />
      <ManageFeesModal
        isOpen={showFeesForm}
        onClose={() => setShowFeesForm(false)}
        onSubmit={handleManageFees}
      />
      <ViewAttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
      />
      <SendNotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onSubmit={handleSendNotifications}
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Panels */}
      <div className="panels">
        {/* Recent Registrations */}
        <section className="panel recent-registrations">
          <h3>Recent Student Registrations</h3>
          <RecentTable rows={recentStudents} />
        </section>

        {/* Attendance */}
        <section className="panel attendance-panel">
          <h3>Today's Attendance</h3>
          <div className="attendance-list">
            {attendance.map((classData) => (
              <div className="attendance-row" key={classData.name}>
                <div className="attendance-meta">
                  <strong>Grade {classData.name}</strong>
                  <span>{classData.pct}%</span>
                </div>
                <div className="attendance-details">
                  <span className="attendance-count">
                    {classData.present}/{classData.total} students
                  </span>
                </div>
                <div className="attendance-bar">
                  <div
                    className="attendance-fill"
                    style={{
                      width: `${classData.pct}%`,
                      backgroundColor:
                        classData.pct >= 90
                          ? "#48bb78"
                          : classData.pct >= 80
                          ? "#ed8936"
                          : "#f56565",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <UpcomingEvents />

        {/* Notifications */}
        <Notifications />

        {/* Top Performers */}
        <TopPerformers />
      </div>
    </div>
  );
}
