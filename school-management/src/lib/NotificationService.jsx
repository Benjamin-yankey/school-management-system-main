/**
 * ─────────────────────────────────────────────────────────────────────────────
 * NotificationService.jsx
 * School Management System — Notification Microservice
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, {
  useState, useEffect, useRef, useCallback,
  createContext, useContext, useReducer, useMemo
} from "react";
import { useTheme as useAppTheme } from "../contexts/ThemeContext";
import { 
  Bell, Mail, MessageSquare, Smartphone, 
  GraduationCap, CheckCircle2, BarChart2, FileText, 
  Megaphone, User, Settings, TrendingUp, Shield,
  X, RefreshCw, Check, Trash2, Search, Filter,
  Clock, Moon, Zap, ChevronRight
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// THEME-AWARE DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const getColors = (isDark) => ({
  bg:        "var(--bg, #F8FAFC)",
  surface:   "var(--surface, #FFFFFF)",
  card:      "var(--surface, #FFFFFF)",
  cardHover: "var(--header-hover, #F1F5F9)",
  border:    "var(--border, rgba(0,0,0,0.06))",
  border2:   "var(--header-border, rgba(0,0,0,0.1))",
  text1:     "var(--text, #0F172A)",
  text2:     "var(--text-secondary, #64748B)",
  text3:     "var(--text-muted, #94A3B8)",
  blue:      "#3B82F6",
  blueBg:    isDark ? "rgba(59,130,246,0.12)" : "rgba(59,130,246,0.08)",
  green:     "#10B981",
  greenBg:   isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.08)",
  amber:     "#F59E0B",
  amberBg:   isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.08)",
  red:       "#EF4444",
  redBg:     isDark ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)",
  purple:    "#8B5CF6",
  purpleBg:  isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.08)",
  teal:      "#06B6D4",
  tealBg:    isDark ? "rgba(6,182,212,0.12)" : "rgba(6,182,212,0.08)",
  pink:      "#EC4899",
  pinkBg:    isDark ? "rgba(236,72,153,0.12)" : "rgba(236,72,153,0.08)",
  input:     "var(--input-bg, #F1F5F9)",
  inputBd:   "var(--input-border, rgba(0,0,0,0.08))",
});

const CATEGORIES_RAW = {
  admission:   { label: "Admissions",   icon: GraduationCap, key: "blue"   },
  attendance:  { label: "Attendance",   icon: CheckCircle2,  key: "green"  },
  grade:       { label: "Grades",       icon: BarChart2,     key: "amber"  },
  assignment:  { label: "Assignments",  icon: FileText,      key: "purple" },
  notice:      { label: "Notices",      icon: Megaphone,     key: "teal"   },
  user:        { label: "Users",        icon: User,          key: "pink"   },
  system:      { label: "System",       icon: Settings,      key: "text2"  },
  promotion:   { label: "Promotions",   icon: TrendingUp,    key: "green"  },
  security:    { label: "Security",     icon: Shield,        key: "red"    },
};

const getCategories = (C) => {
  const cats = {};
  Object.entries(CATEGORIES_RAW).forEach(([key, val]) => {
    cats[key] = {
      ...val,
      color: C[val.key] || C.text2,
      bg: C[val.key + "Bg"] || C.input
    };
  });
  return cats;
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
function notifReducer(state, action) {
  switch (action.type) {
    case "SET":       return { ...state, list: action.payload };
    case "MARK_ONE":  return { ...state, list: state.list.map((n) => n.id === action.id ? { ...n, read: true } : n) };
    case "MARK_ALL":  return { ...state, list: state.list.map((n) => ({ ...n, read: true })) };
    case "DELETE":    return { ...state, list: state.list.filter((n) => n.id !== action.id) };
    case "CLEAR_ALL": return { ...state, list: [] };
    case "ADD":       return { ...state, list: [action.payload, ...state.list] };
    default:          return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// API HELPER
// ─────────────────────────────────────────────────────────────────────────────
async function notifApi(serviceUrl, token, method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const cfg = { method, headers };
  if (body) cfg.body = JSON.stringify(body);
  const res = await fetch(`${serviceUrl}${path}`, cfg);
  let data;
  try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) throw new Error(data?.message || `Error ${res.status}`);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function useClickOutside(ref, fn) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) fn(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, fn]);
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function Spinner({ size = 16, color = "#6B83A8" }) {
  return (
    <RefreshCw size={size} color={color} className="n-spin" style={{ animation: "nspin 1s linear infinite" }} />
  );
}

function PriorityDot({ priority, C }) {
  const col = priority === "high" ? C.red : priority === "normal" ? C.amber : C.text3;
  return <span style={{ width: 7, height: 7, borderRadius: "50%", background: col, display: "inline-block", flexShrink: 0 }} />;
}

function CategoryBadge({ category, C, CATEGORIES }) {
  const cat = CATEGORIES[category] || CATEGORIES.system;
  const Icon = cat.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 99,
      fontSize: 10, fontWeight: 700,
      background: cat.bg, color: cat.color,
      border: `1px solid ${cat.color}33`,
    }}>
      <Icon size={10} />
      {cat.label}
    </span>
  );
}

function Toggle({ value, onChange, disabled, C }) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      style={{
        width: 42, height: 24, borderRadius: 99,
        background: value ? C.blue : C.input,
        border: `1px solid ${value ? C.blue : C.inputBd}`,
        cursor: disabled ? "not-allowed" : "pointer",
        position: "relative", transition: "all .2s", flexShrink: 0,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <span style={{
        position: "absolute", top: 3,
        left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: "#fff",
        transition: "left .2s",
        display: "block",
      }} />
    </button>
  );
}

function SectionHeader({ icon: Icon, title, sub, action, C }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: C.blueBg, border: `1px solid ${C.blue}33`,
          display: "flex", alignItems: "center", justifyContent: "center", color: C.blue
        }}>
          {typeof Icon === 'string' ? Icon : <Icon size={20} />}
        </div>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text1, margin: 0, letterSpacing: "-0.3px" }}>{title}</h2>
          {sub && <p style={{ fontSize: 12, color: C.text2, margin: "2px 0 0" }}>{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION ITEM
// ─────────────────────────────────────────────────────────────────────────────
function NotifItem({ notif, onRead, onDelete, compact = false, C, CATEGORIES }) {
  const cat = CATEGORIES[notif.category] || CATEGORIES.system;
  const Icon = cat.icon;
  return (
    <div
      style={{
        display: "flex", gap: 12, padding: compact ? "10px 14px" : "14px 16px",
        background: notif.read ? "transparent" : `${C.blue}08`,
        borderBottom: `1px solid ${C.border}`,
        cursor: "pointer", transition: "background .15s",
        position: "relative",
      }}
      onClick={() => !notif.read && onRead(notif.id)}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.cardHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = notif.read ? "transparent" : `${C.blue}08`)}
    >
      {/* Unread indicator */}
      {!notif.read && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: cat.color, borderRadius: "0 2px 2px 0",
        }} />
      )}

      {/* Category icon */}
      <div style={{
        width: compact ? 34 : 40, height: compact ? 34 : 40,
        borderRadius: 10, background: cat.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, color: cat.color,
        border: `1px solid ${cat.color}22`,
      }}>
        <Icon size={compact ? 16 : 20} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", justifyContent: "space-between" }}>
          <p style={{
            fontSize: compact ? 12 : 13, fontWeight: notif.read ? 500 : 700,
            color: notif.read ? C.text2 : C.text1, margin: 0,
            lineHeight: 1.4, flex: 1,
          }}>
            {notif.title}
          </p>
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
            <PriorityDot priority={notif.priority} C={C} />
          </div>
        </div>
        {!compact && (
          <p style={{ fontSize: 12, color: C.text2, margin: "3px 0 6px", lineHeight: 1.5 }}>
            {notif.body}
          </p>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: C.text3 }}>{timeAgo(notif.time)}</span>
          {!compact && <span style={{ fontSize: 11, color: C.text3 }}>·</span>}
          {!compact && <span style={{ fontSize: 11, color: C.text3 }}>by {notif.actor || 'System'}</span>}
          {!compact && <CategoryBadge category={notif.category} C={C} CATEGORIES={CATEGORIES} />}
        </div>
      </div>

      {/* Actions */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(notif.id); }}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: C.text3, padding: "2px 4px", borderRadius: 4,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, alignSelf: "flex-start",
          transition: "color .15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = C.red)}
        onMouseLeave={(e) => (e.currentTarget.style.color = C.text3)}
        title="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION BELL
// ─────────────────────────────────────────────────────────────────────────────
export function NotificationBell({ token, serviceUrl = "http://localhost:3001", onOpenCenter }) {
  const { isDarkMode } = useAppTheme();
  const C = useMemo(() => getColors(isDarkMode), [isDarkMode]);
  const CATEGORIES = useMemo(() => getCategories(C), [C]);

  const [notifs, dispatch] = useReducer(notifReducer, { list: [] });
  const [open, setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false));

  const unread = notifs.list.filter((n) => !n.read).length;

  const fetchNotifs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await notifApi(serviceUrl, token, "GET", "/notifications?limit=20");
      dispatch({ type: "SET", payload: Array.isArray(data) ? data : data?.data || [] });
    } catch (err) {
      console.error("Notifications sync failed:", err);
    } finally {
      setLoading(false);
    }
  }, [serviceUrl, token]);

  useEffect(() => { 
    fetchNotifs(); 
    const id = setInterval(fetchNotifs, 30000); 
    return () => clearInterval(id); 
  }, [fetchNotifs]);

  const markOne = async (id) => {
    dispatch({ type: "MARK_ONE", id });
    try { await notifApi(serviceUrl, token, "POST", `/notifications/${id}/read`); } catch {}
  };
  const markAll = async () => {
    dispatch({ type: "MARK_ALL" });
    try { await notifApi(serviceUrl, token, "POST", "/notifications/read-all"); } catch {}
  };
  const del = async (id) => {
    dispatch({ type: "DELETE", id });
    try { await notifApi(serviceUrl, token, "DELETE", `/notifications/${id}`); } catch {}
  };
  
  const pillBtn = {
    padding: "5px 11px", borderRadius: 7,
    background: C.input, border: `1px solid ${C.inputBd}`,
    color: C.text2, fontSize: 11, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: 4,
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 38, height: 38, borderRadius: 10,
          background: open ? C.blueBg : C.input,
          border: `1px solid ${open ? C.blue + "44" : C.inputBd}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative", transition: "all .15s",
        }}
        title="Notifications"
      >
        <Bell size={17} color={open ? C.blue : C.text2} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            minWidth: 16, height: 16, borderRadius: 99,
            background: C.red, color: "#fff",
            fontSize: 9, fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
            border: `2px solid ${C.bg}`,
            animation: "nbadge 2s ease infinite",
          }}>
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="toolbar-panel notifications" style={{
          position: "absolute", top: "calc(100% + 12px)", right: 0,
          minWidth: 320, maxWidth: 360,
          maxHeight: 520,
          background: C.card, border: `1px solid ${C.border2}`,
          borderRadius: 16, overflow: "hidden",
          boxShadow: isDarkMode ? "0 20px 60px rgba(0,0,0,0.5)" : "0 20px 60px rgba(0,0,0,0.1)",
          zIndex: 300, display: "flex", flexDirection: "column",
        }}>
          {/* Header */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "14px 16px 12px",
            borderBottom: `1px solid ${C.border}`,
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, color: C.text1, margin: 0 }}>Notifications</p>
              <p style={{ fontSize: 11, color: C.text3, margin: "2px 0 0" }}>
                {loading ? "Refreshing…" : `${unread} unread · ${notifs.list.length} total`}
              </p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {unread > 0 && (
                <button onClick={markAll} style={pillBtn}>Mark all read</button>
              )}
              {onOpenCenter && (
                <button onClick={() => { setOpen(false); onOpenCenter(); }} style={{ ...pillBtn, background: C.blueBg, color: C.blue, borderColor: C.blue + "33" }}>
                  Open center
                </button>
              )}
            </div>
          </div>

          {/* Filter tabs */}
          <NotifFilterTabs notifs={notifs.list} C={C} renderItem={(n) => (
            <NotifItem key={n.id} notif={n} onRead={markOne} onDelete={del} compact C={C} CATEGORIES={CATEGORIES} />
          )} />

          {/* Footer */}
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}` }}>
            {onOpenCenter ? (
              <button
                onClick={() => { setOpen(false); onOpenCenter(); }}
                style={{ ...pillBtn, width: "100%", justifyContent: "center", padding: "8px" }}
              >
                View all notifications
              </button>
            ) : (
              <p style={{ fontSize: 11, color: C.text3, textAlign: "center", margin: 0 }}>
                Polling every 30s
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Filter tab component
function NotifFilterTabs({ notifs, renderItem, C }) {
  const [tab, setTab] = useState("all");
  const tabs = [
    { key: "all",    label: "All"    },
    { key: "unread", label: "Unread" },
    { key: "high",   label: "High priority" },
  ];
  const filtered = notifs.filter((n) => {
    if (tab === "unread") return !n.read;
    if (tab === "high")   return n.priority === "high";
    return true;
  });
  return (
    <>
      <div style={{ display: "flex", gap: 2, padding: "8px 12px", borderBottom: `1px solid ${C.border}` }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "5px 11px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer",
            border: "none", fontFamily: "inherit",
            background: tab === t.key ? C.blue : "transparent",
            color:      tab === t.key ? "#fff" : C.text2,
            transition: "all .15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: C.text3, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <Bell size={32} opacity={0.5} color={C.text3} />
            </div>
            No notifications here
          </div>
        )}
        {filtered.map(renderItem)}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION CENTER
// ─────────────────────────────────────────────────────────────────────────────
export function NotificationCenter({ token, serviceUrl = "http://localhost:3001", userId, C_EXT, CAT_EXT }) {
  const { isDarkMode } = useAppTheme();
  const C = C_EXT || getColors(isDarkMode);
  const CATEGORIES = CAT_EXT || getCategories(C);

  const [notifs, dispatch]    = useReducer(notifReducer, { list: [] });
  const [loading, setLoading] = useState(false);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [catFilter, setCatFilter] = useState("all");
  const [prioFilter, setPrioFilter] = useState("all");
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const pillBtn = {
    padding: "5px 11px", borderRadius: 7,
    background: C.input, border: `1px solid ${C.inputBd}`,
    color: C.text2, fontSize: 11, fontWeight: 600,
    cursor: "pointer", fontFamily: "inherit",
    display: "inline-flex", alignItems: "center", gap: 4,
  };

  const load = useCallback(async (pageNum = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: pageNum, limit: 20 });
      if (catFilter  !== "all") params.set("category", catFilter);
      if (prioFilter !== "all") params.set("priority", prioFilter);
      if (search)                params.set("q", search);
      const data = await notifApi(serviceUrl, token, "GET", `/notifications/history?${params}`);
      const list = Array.isArray(data) ? data : data?.data || [];
      if (pageNum === 1) dispatch({ type: "SET", payload: list });
      else dispatch({ type: "SET", payload: [...notifs.list, ...list] });
      setHasMore(list.length === 20);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally { setLoading(false); }
  }, [serviceUrl, token, catFilter, prioFilter, search]);

  useEffect(() => { setPage(1); load(1); }, [catFilter, prioFilter, load]);

  const markOne = async (id) => {
    dispatch({ type: "MARK_ONE", id });
    try { await notifApi(serviceUrl, token, "POST", `/notifications/${id}/read`); } catch {}
  };
  const markAll = async () => {
    dispatch({ type: "MARK_ALL" });
    try { await notifApi(serviceUrl, token, "POST", "/notifications/read-all"); } catch {}
  };
  const del = async (id) => {
    dispatch({ type: "DELETE", id });
    try { await notifApi(serviceUrl, token, "DELETE", `/notifications/${id}`); } catch {}
  };
  const clearAll = async () => {
    dispatch({ type: "CLEAR_ALL" });
    try { await notifApi(serviceUrl, token, "DELETE", "/notifications/clear-all"); } catch {}
  };

  const bulkMarkRead = async () => {
    setBulkLoading(true);
    try {
      const ids = Array.from(selected);
      await Promise.all(ids.map(id => notifApi(serviceUrl, token, "POST", `/notifications/${id}/read`)));
      ids.forEach((id) => dispatch({ type: "MARK_ONE", id }));
      setSelected(new Set());
    } catch (err) { console.error(err); }
    finally { setBulkLoading(false); }
  };

  const bulkDelete = async () => {
    setBulkLoading(true);
    try {
      const ids = Array.from(selected);
      await Promise.all(ids.map(id => notifApi(serviceUrl, token, "DELETE", `/notifications/${id}`)));
      ids.forEach((id) => dispatch({ type: "DELETE", id }));
      setSelected(new Set());
    } catch (err) { console.error(err); }
    finally { setBulkLoading(false); }
  };

  const toggleSelect = (id) => setSelected((s) => {
    const next = new Set(s);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((n) => n.id)));
  };

  const filtered = notifs.list.filter((n) => {
    if (search) {
      const q = search.toLowerCase();
      if (!n.title.toLowerCase().includes(q) && !n.body.toLowerCase().includes(q)) return false;
    }
    if (catFilter  !== "all" && n.category !== catFilter)  return false;
    if (prioFilter !== "all" && n.priority !== prioFilter)  return false;
    return true;
  });

  const unreadCount = notifs.list.filter((n) => !n.read).length;

  const summaryStats = Object.entries(CATEGORIES).map(([key, cat]) => ({
    key, ...cat,
    count: notifs.list.filter((n) => n.category === key).length,
    unread: notifs.list.filter((n) => n.category === key && !n.read).length,
  }));

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.text1, minHeight: "100%" }}>
      <style>{`
        @keyframes nspin{to{transform:rotate(360deg)}} 
        @keyframes nbadge{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        .n-search-input::placeholder { color: ${C.text3}; opacity: 0.8; }
      `}</style>

      <SectionHeader
        icon={Bell}
        title="Notification Center"
        sub={`${unreadCount} unread notifications · ${notifs.list.length} total`}
        C={C}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            {unreadCount > 0 && (
              <button onClick={markAll} style={{ ...pillBtn, fontSize: 12, padding: "7px 14px" }}>
                <Check size={14} /> Mark all read
              </button>
            )}
            <button onClick={clearAll} style={{ ...pillBtn, fontSize: 12, padding: "7px 14px", color: C.red, borderColor: C.red + "33" }}>
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        }
      />

      {/* Category stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, marginBottom: 24 }}>
        {summaryStats.filter((s) => s.count > 0).map((s) => {
          const CatIcon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setCatFilter(catFilter === s.key ? "all" : s.key)}
              style={{
                padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                background: catFilter === s.key ? s.bg : C.card,
                border: `1px solid ${catFilter === s.key ? s.color + "44" : C.border}`,
                textAlign: "left", fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <CatIcon size={20} color={s.color} />
                {s.unread > 0 && (
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 99, padding: "0 4px",
                    background: s.color, color: "#fff", fontSize: 10, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{s.unread}</span>
                )}
              </div>
              <p style={{ fontSize: 11, fontWeight: 700, color: catFilter === s.key ? s.color : C.text2, margin: "0 0 2px" }}>{s.label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: catFilter === s.key ? s.color : C.text1, margin: 0 }}>{s.count}</p>
            </button>
          );
        })}
      </div>

      {/* Filters + search row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.text3 }} />
          <input
            className="n-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications…"
            style={{
              width: "100%", padding: "9px 12px 9px 36px", borderRadius: 9,
              background: C.input, border: `1px solid ${C.inputBd}`,
              color: C.text1, fontSize: 13, outline: "none", fontFamily: "inherit",
            }}
          />
        </div>
        <select
          value={prioFilter}
          onChange={(e) => setPrioFilter(e.target.value)}
          style={{ padding: "9px 12px", borderRadius: 9, background: C.input, border: `1px solid ${C.inputBd}`, color: C.text1, fontSize: 13, outline: "none", fontFamily: "inherit", cursor: "pointer" }}
        >
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <button onClick={() => load(1)} style={{ ...pillBtn, padding: "9px 14px" }}>
          {loading ? <Spinner size={13} /> : <RefreshCw size={13} />} 
          <span style={{marginLeft: 4}}>Refresh</span>
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={{
          display: "flex", gap: 10, alignItems: "center",
          padding: "10px 16px", borderRadius: 10, marginBottom: 12,
          background: C.blueBg, border: `1px solid ${C.blue}33`,
        }}>
          <span style={{ fontSize: 13, color: C.blue, fontWeight: 600 }}>
            {selected.size} selected
          </span>
          <button onClick={bulkMarkRead} disabled={bulkLoading} style={{ ...pillBtn, color: C.green, borderColor: C.green + "33" }}>
            {bulkLoading ? <Spinner size={12} /> : <Check size={12} />} Mark read
          </button>
          <button onClick={bulkDelete} disabled={bulkLoading} style={{ ...pillBtn, color: C.red, borderColor: C.red + "33" }}>
            {bulkLoading ? <Spinner size={12} /> : <Trash2 size={12} />} Delete
          </button>
          <button onClick={() => setSelected(new Set())} style={pillBtn}>Cancel</button>
        </div>
      )}

      {/* Notification list container */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {/* List header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px 16px", borderBottom: `1px solid ${C.border}`,
          background: "var(--surface-muted, #F8FAFC)",
        }}>
          <input
            type="checkbox"
            checked={selected.size === filtered.length && filtered.length > 0}
            onChange={toggleAll}
            style={{ width: 15, height: 15, accentColor: C.blue, cursor: "pointer" }}
          />
          <p style={{ fontSize: 11, fontWeight: 700, color: C.text3, letterSpacing: 0.8, margin: 0, textTransform: "uppercase" }}>
            {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: C.text2 }}>
            <Spinner size={24} color={C.blue} />
            <p style={{ marginTop: 12, fontSize: 13 }}>Loading notifications…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <CheckCircle2 size={48} color={C.green} opacity={0.5} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>You're all caught up!</p>
            <p style={{ fontSize: 13, color: C.text3 }}>No notifications match your current filters.</p>
          </div>
        )}

        {filtered.map((n) => (
          <div key={n.id} style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ padding: "16px 0 0 16px", flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={selected.has(n.id)}
                onChange={() => toggleSelect(n.id)}
                style={{ width: 15, height: 15, accentColor: C.blue, cursor: "pointer" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <NotifItem notif={n} onRead={markOne} onDelete={del} C={C} CATEGORIES={CATEGORIES} />
            </div>
          </div>
        ))}

        {hasMore && (
          <div style={{ padding: 16, textAlign: "center", borderTop: `1px solid ${C.border}` }}>
            <button
              onClick={() => { const next = page + 1; setPage(next); load(next); }}
              style={{ ...pillBtn, padding: "9px 20px" }}
              disabled={loading}
            >
              {loading ? <Spinner size={13} /> : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION PREFERENCES
// ─────────────────────────────────────────────────────────────────────────────
export function NotificationPreferences({ token, serviceUrl = "http://localhost:3001", C_EXT, CAT_EXT }) {
  const { isDarkMode } = useAppTheme();
  const C = C_EXT || getColors(isDarkMode);
  const CATEGORIES = CAT_EXT || getCategories(C);

  const [prefs, setPrefs]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState(null);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult]   = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    notifApi(serviceUrl, token, "GET", "/notifications/preferences")
      .then((data) => setPrefs(data))
      .catch((err) => {
        console.error("Preferences load failed:", err);
        setError("Failed to load preferences from server.");
      })
      .finally(() => setLoading(false));
  }, [serviceUrl, token]);

  const save = async () => {
    if (!prefs) return;
    setSaving(true); setError(null); setSaved(false);
    try {
      await notifApi(serviceUrl, token, "PUT", "/notifications/preferences", prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save preferences.");
    } finally { setSaving(false); }
  };

  const sendTest = async () => {
    setTestSending(true); setTestResult(null);
    try {
      await notifApi(serviceUrl, token, "POST", "/notifications/test", { channel: "inApp" });
      setTestResult({ ok: true, msg: "Test notification sent! Check your bell." });
    } catch (err) {
      setTestResult({ ok: false, msg: "Test failed." });
    } finally { setTestSending(false); }
  };

  const setCatPref = (cat, channel, val) => {
    setPrefs((p) => ({
      ...p,
      categories: { ...p.categories, [cat]: { ...p.categories[cat], [channel]: val } },
    }));
    setSaved(false);
  };

  const setChanPref = (channel, val) => {
    setPrefs((p) => ({ ...p, channels: { ...p.channels, [channel]: val } }));
    setSaved(false);
  };

  const CHANNELS = [
    { key: "inApp", label: "In-app",    icon: Bell, desc: "Shown in the notification bell" },
    { key: "email", label: "Email",     icon: Mail, desc: "Sent to your registered email" },
    { key: "sms",   label: "SMS",       icon: MessageSquare, desc: "Sent as a text message" },
    { key: "push",  label: "Push",      icon: Smartphone, desc: "Browser push notification" },
  ];

  const sCard = {
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px",
  };
  const sCardTitle = {
    fontSize: 12, fontWeight: 800, color: C.text2,
    textTransform: "uppercase", letterSpacing: 0.9, margin: "0 0 4px",
  };
  const thStyle = {
    fontSize: 10, fontWeight: 700, color: C.text3,
    textTransform: "uppercase", letterSpacing: 0.8, margin: 0,
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48, color: C.text2 }}>
      <Spinner size={28} color={C.blue} />
    </div>
  );

  if (!prefs) return (
    <div style={{ padding: 48, textAlign: "center", color: C.text2 }}>
      <Zap size={48} opacity={0.3} style={{ marginBottom: 16 }} />
      <p>Connect to notification service to manage preferences.</p>
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.text1 }}>
      <SectionHeader
        icon={Settings}
        title="Notification Preferences"
        sub="Control how and when you receive notifications from the school system."
        C={C}
        action={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {saved && <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>✓ Saved</span>}
            <button onClick={save} disabled={saving} style={{
              padding: "9px 20px", borderRadius: 9, background: C.blue, color: "#fff",
              border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {saving ? <Spinner size={13} color="#fff" /> : <Check size={13} />}
              {saving ? "Saving…" : "Save preferences"}
            </button>
          </div>
        }
      />

      {/* Global channel toggles */}
      <div style={{ ...sCard, marginBottom: 20 }}>
        <p style={sCardTitle}>Delivery channels</p>
        <p style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>
          Enable or disable entire channels globally.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }}>
          {CHANNELS.map((ch) => {
            const ChanIcon = ch.icon;
            return (
              <div key={ch.key} style={{
                padding: "14px 16px", borderRadius: 12,
                background: prefs.channels[ch.key] ? C.blueBg : C.input,
                border: `1px solid ${prefs.channels[ch.key] ? C.blue + "44" : C.border}`,
                display: "flex", flexDirection: "column", gap: 10,
                transition: "all .2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <ChanIcon size={22} color={prefs.channels[ch.key] ? C.blue : C.text2} />
                  <Toggle value={prefs.channels[ch.key]} onChange={(v) => setChanPref(ch.key, v)} C={C} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: prefs.channels[ch.key] ? C.blue : C.text1, margin: "0 0 2px" }}>{ch.label}</p>
                  <p style={{ fontSize: 11, color: C.text3, margin: 0 }}>{ch.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-category matrix */}
      <div style={{ ...sCard, marginBottom: 20 }}>
        <p style={sCardTitle}>Per-category settings</p>
        <p style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>
          Fine-tune which channels each notification type uses.
        </p>

        {/* Matrix header */}
        <div style={{
          display: "grid", gridTemplateColumns: "200px repeat(4,80px)",
          gap: 8, padding: "0 12px 10px", alignItems: "center",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <span style={thStyle}>Category</span>
          {CHANNELS.map((ch) => {
            const ChIcon = ch.icon;
            return (
              <div key={ch.key} style={{ textAlign: "center" }}>
                <ChIcon size={16} style={{ display: "block", margin: "0 auto" }} color={C.text2} />
                <p style={{ ...thStyle, marginTop: 2, textAlign: "center" }}>{ch.label}</p>
              </div>
            );
          })}
        </div>

        {Object.entries(CATEGORIES).map(([catKey, cat], i) => {
          const CatIcon = cat.icon;
          return (
            <div key={catKey} style={{
              display: "grid", gridTemplateColumns: "200px repeat(4,80px)",
              gap: 8, padding: "12px", alignItems: "center",
              background: i % 2 === 0 ? C.input : "transparent",
              borderRadius: 8, transition: "background .15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CatIcon size={18} color={cat.color} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text1 }}>{cat.label}</span>
              </div>
              {CHANNELS.map((ch) => (
                <div key={ch.key} style={{ display: "flex", justifyContent: "center" }}>
                  <Toggle
                    value={prefs.categories[catKey]?.[ch.key] ?? false}
                    onChange={(v) => setCatPref(catKey, ch.key, v)}
                    disabled={!prefs.channels[ch.key]}
                    C={C}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Digest & Quiet settings */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div style={sCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Clock size={16} color={C.blue} />
            <p style={sCardTitle}>Digest settings</p>
          </div>
          <p style={{ fontSize: 12, color: C.text3, marginBottom: 14 }}>
            Receive a summary email instead of individual notifications.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: C.text1, fontWeight: 500 }}>Enable digest</span>
            <Toggle value={prefs.digest.enabled} onChange={(v) => setPrefs((p) => ({ ...p, digest: { ...p.digest, enabled: v } }))} C={C} />
          </div>
          {prefs.digest.enabled && (
            <>
              <label style={{ display: "block", fontSize: 12, color: C.text2, marginBottom: 6, fontWeight: 600 }}>Frequency</label>
              <select
                value={prefs.digest.frequency}
                onChange={(e) => setPrefs((p) => ({ ...p, digest: { ...p.digest, frequency: e.target.value } }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: C.input, border: `1px solid ${C.inputBd}`, color: C.text1, fontSize: 13, outline: "none", fontFamily: "inherit", marginBottom: 12 }}
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <label style={{ display: "block", fontSize: 12, color: C.text2, marginBottom: 6, fontWeight: 600 }}>Digest time</label>
              <input
                type="time" value={prefs.digest.time}
                onChange={(e) => setPrefs((p) => ({ ...p, digest: { ...p.digest, time: e.target.value } }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: C.input, border: `1px solid ${C.inputBd}`, color: C.text1, fontSize: 13, outline: "none", fontFamily: "inherit" }}
              />
            </>
          )}
        </div>

        <div style={sCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Moon size={16} color={C.purple} />
            <p style={sCardTitle}>Quiet hours</p>
          </div>
          <p style={{ fontSize: 12, color: C.text3, marginBottom: 14 }}>
            Suppress notifications during specified hours.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: C.text1, fontWeight: 500 }}>Enable quiet hours</span>
            <Toggle value={prefs.quiet.enabled} onChange={(v) => setPrefs((p) => ({ ...p, quiet: { ...p.quiet, enabled: v } }))} C={C} />
          </div>
          {prefs.quiet.enabled && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["from", "From"], ["to", "Until"]].map(([k, lbl]) => (
                <div key={k}>
                  <label style={{ display: "block", fontSize: 12, color: C.text2, marginBottom: 6, fontWeight: 600 }}>{lbl}</label>
                  <input
                    type="time" value={prefs.quiet[k]}
                    onChange={(e) => setPrefs((p) => ({ ...p, quiet: { ...p.quiet, [k]: e.target.value } }))}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: C.input, border: `1px solid ${C.inputBd}`, color: C.text1, fontSize: 13, outline: "none", fontFamily: "inherit" }}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: C.text2, marginBottom: 6, fontWeight: 600 }}>Minimum priority to show</label>
            <select
              value={prefs.minPriority}
              onChange={(e) => setPrefs((p) => ({ ...p, minPriority: e.target.value }))}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: C.input, border: `1px solid ${C.inputBd}`, color: C.text1, fontSize: 13, outline: "none", fontFamily: "inherit" }}
            >
              <option value="low">Low and above</option>
              <option value="normal">Normal and above</option>
              <option value="high">High priority only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Test notification */}
      <div style={{ ...sCard, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.text1, margin: "0 0 4px" }}>Test settings</p>
          <p style={{ fontSize: 12, color: C.text3, margin: 0 }}>
            Send a test notification to verify your channels.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {testResult && (
            <span style={{ fontSize: 12, color: testResult.ok ? C.green : C.red, fontWeight: 600 }}>
              {testResult.ok ? "✓" : "✕"} {testResult.msg}
            </span>
          )}
          <button onClick={sendTest} disabled={testSending} style={{
            padding: "9px 18px", borderRadius: 9, background: C.purple,
            color: "#fff", border: "none", fontWeight: 700, fontSize: 13,
            cursor: "pointer", fontFamily: "inherit", display: "flex", gap: 6, alignItems: "center",
          }}>
            {testSending ? <Spinner size={13} color="#fff" /> : <Zap size={13} />}
            <span style={{marginLeft: 4}}>{testSending ? "Sending…" : "Send test"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 9, background: C.redBg, border: `1px solid ${C.red}44`, color: C.red, fontSize: 13 }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function NotificationServicePage({ token, serviceUrl = "http://localhost:3001", userId }) {
  const { isDarkMode } = useAppTheme();
  const C = useMemo(() => getColors(isDarkMode), [isDarkMode]);
  const CATEGORIES = useMemo(() => getCategories(C), [C]);

  const [tab, setTab] = useState("center");
  const TABS = [
    { key: "center",      label: "Notification center", icon: Bell },
    { key: "preferences", label: "Preferences",         icon: Settings },
  ];
  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif", minHeight: "100%", color: C.text1 }}>
      <style>{`
        @keyframes nspin{to{transform:rotate(360deg)}} 
        @keyframes nbadge{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}} 
        *{box-sizing:border-box}
      `}</style>
      
      {/* Sliding Segment Toggle */}
      <div style={{ 
        display: "flex", 
        background: C.surface, 
        padding: 4, 
        borderRadius: 14, 
        width: "fit-content", 
        marginBottom: 28,
        border: `1px solid ${C.border}`,
        position: "relative",
        boxShadow: isDarkMode ? "0 4px 12px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.05)"
      }}>
        {/* Animated Background Slider */}
        <div style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: tab === "center" ? 4 : "50%",
          width: "calc(50% - 4px)",
          background: C.blue,
          borderRadius: 10,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 0,
          boxShadow: `0 4px 10px ${C.blue}44`
        }} />

        {TABS.map((t) => {
          const TabIcon = t.icon;
          const isActive = tab === t.key;
          return (
            <button 
              key={t.key} 
              onClick={() => setTab(t.key)} 
              style={{
                display: "flex", 
                alignItems: "center", 
                gap: 8, 
                padding: "8px 24px",
                background: "none", 
                border: "none", 
                cursor: "pointer",
                color: isActive ? "#fff" : C.text2,
                fontWeight: 700, 
                fontSize: 13, 
                fontFamily: "inherit",
                position: "relative",
                zIndex: 1,
                transition: "color 0.3s",
                whiteSpace: "nowrap"
              }}
            >
              <TabIcon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "center"      && <NotificationCenter      token={token} serviceUrl={serviceUrl} userId={userId} C_EXT={C} CAT_EXT={CATEGORIES} />}
      {tab === "preferences" && <NotificationPreferences token={token} serviceUrl={serviceUrl} C_EXT={C} CAT_EXT={CATEGORIES} />}
    </div>
  );
}
