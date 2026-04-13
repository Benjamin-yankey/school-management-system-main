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
    <div className="n-section-header">
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
      <div>{action}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION ITEM
// ─────────────────────────────────────────────────────────────────────────────
function NotifItem({ notif, onRead, onDelete, compact = false, C, CATEGORIES }) {
  const cat = CATEGORIES[notif.category] || CATEGORIES.system;
  const Icon = cat.icon;
  const [expanded, setExpanded] = useState(false);
  
  const handleClick = () => {
    setExpanded(!expanded);
  };
  
  const handleMarkRead = (e) => {
    e.stopPropagation();
    if (!notif.read) onRead(notif.id);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notif.id);
  };
  
  return (
    <div
      style={{
        display: "flex", gap: 12, padding: compact ? "10px 14px" : "14px 16px",
        background: expanded ? C.cardHover : (notif.read ? "transparent" : `${C.blue}08`),
        borderBottom: `1px solid ${C.border}`,
        cursor: "pointer", transition: "background .15s",
        position: "relative",
      }}
      onClick={handleClick}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.cardHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = expanded ? C.cardHover : (notif.read ? "transparent" : `${C.blue}08`))}
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
          <span style={{ fontSize: 11, color: C.text3 }}>{timeAgo(notif.createdAt || notif.time)}</span>
          <span style={{ fontSize: 11, color: C.text3 }}>·</span>
          <CategoryBadge category={notif.category} C={C} CATEGORIES={CATEGORIES} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 4 }}>
        {!notif.read && (
          <button
            onClick={handleMarkRead}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: C.text3, padding: "2px 4px", borderRadius: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, alignSelf: "flex-start",
              transition: "color .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.green)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.text3)}
            title="Mark as read"
          >
            <CheckCircle2 size={14} />
          </button>
        )}
        <button
          onClick={handleDelete}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: C.text3, padding: "2px 4px", borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, alignSelf: "flex-start",
            transition: "color .15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C.red)}
          onMouseLeave={(e) => (e.currentTarget.style.color = C.text3)}
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
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
      <div className="n-grid-stats">
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
      <div className="n-filters-row">
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
      <div className="n-card-padding" style={{ ...sCard, marginBottom: 20 }}>
        <p style={sCardTitle}>Delivery channels</p>
        <p style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>
          Enable or disable entire channels globally.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12 }} className="n-pref-cards-grid">
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
      <div className="n-prefs-matrix">
        <div className="n-pref-grid" style={{ ...sCard, marginBottom: 0 }}>
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
      </div>

      {/* Digest & Quiet settings */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 20 }} className="n-pref-cards-grid">
        <div className="n-card-padding" style={sCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Clock size={16} color={C.blue} />
            <p style={sCardTitle}>Digest settings</p>
          </div>
          <p style={{ fontSize: 12, color: C.text3, marginBottom: 14 }}>
            Receive a summary email instead of individual notifications.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: C.text1, fontWeight: 500 }}>Enable digest</span>
            <Toggle value={prefs.digest?.enabled} onChange={(v) => setPrefs((p) => ({ ...p, digest: { ...p.digest, enabled: v } }))} C={C} />
          </div>
          {prefs.digest?.enabled && (
            <>
              <label style={{ display: "block", fontSize: 12, color: C.text2, marginBottom: 6, fontWeight: 600 }}>Frequency</label>
              <select
                value={prefs.digest?.frequency}
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
                type="time" value={prefs.digest?.time}
                onChange={(e) => setPrefs((p) => ({ ...p, digest: { ...p.digest, time: e.target.value } }))}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: C.input, border: `1px solid ${C.inputBd}`, color: C.text1, fontSize: 13, outline: "none", fontFamily: "inherit" }}
              />
            </>
          )}
        </div>

        <div className="n-card-padding" style={sCard}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Moon size={16} color={C.purple} />
            <p style={sCardTitle}>Quiet hours</p>
          </div>
          <p style={{ fontSize: 12, color: C.text3, marginBottom: 14 }}>
            Suppress notifications during specified hours.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: C.text1, fontWeight: 500 }}>Enable quiet hours</span>
            <Toggle value={prefs.quiet?.enabled} onChange={(v) => setPrefs((p) => ({ ...p, quiet: { ...p.quiet, enabled: v } }))} C={C} />
          </div>
          {prefs.quiet?.enabled && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["from", "From"], ["to", "Until"]].map(([k, lbl]) => (
                <div key={k}>
                  <label style={{ display: "block", fontSize: 12, color: C.text2, marginBottom: 6, fontWeight: 600 }}>{lbl}</label>
                  <input
                    type="time" value={prefs.quiet?.[k]}
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
      <div className="n-card-padding" style={{ ...sCard, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
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

        /* Responsive Helpers */
        .n-section-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .n-filters-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .n-grid-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .n-prefs-matrix { overflow-x: auto; -webkit-overflow-scrolling: touch; margin-bottom: 20px; }
        .n-pref-grid { min-width: 580px; }

        @media (max-width: 640px) {
          .n-section-header { flex-direction: column; gap: 16px; }
          .n-section-header > div:last-child { width: 100%; display: flex; gap: 8px; }
          .n-section-header button { flex: 1; justify-content: center; }
          
          .n-filters-row { flex-direction: column; }
          .n-filters-row > div { width: 100% !important; }
          .n-filters-row select, .n-filters-row button { width: 100%; height: 44px; display: flex; justify-content: center; }

          .n-grid-stats { grid-template-columns: 1fr 1fr; }
          .n-toggle-container { width: 100% !important; }
          .n-toggle-btn { flex: 1; justify-content: center; padding: 10px 12px !important; }

          .n-pref-cards-grid { grid-template-columns: 1fr !important; }
          .n-card-padding { padding: 16px !important; }
        }
      `}</style>
      
      {/* Sliding Segment Toggle */}
      <div className="n-toggle-container" style={{ 
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
              className="n-toggle-btn"
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

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATION SEND MODAL (Admin/SuperAdmin/Teacher) — Enhanced
// ─────────────────────────────────────────────────────────────────────────────
export function NotificationSendModal({ isOpen, onClose, token, serviceUrl = "http://localhost:3001", userRole = "student" }) {
  const { isDarkMode } = useAppTheme();
  const C = getColors(isDarkMode);
  
  const [step, setStep] = useState(1); // 1 = compose, 2 = preview
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    category: "general",
    priority: "normal",
    targetRoles: [],
    targetRole: "all",
    group: "",
    channels: ["inApp"],
    schedule: "now",
    scheduledDate: "",
    scheduledTime: "",
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  
  const canSend = ["admin", "superadmin", "teacher", "administration"].includes(userRole?.toLowerCase());
  
  if (!isOpen || !canSend) return null;
  
  const CATEGORIES = [
    { value: "general", label: "General Notice", desc: "Announcements that don't fit other categories" },
    { value: "admission", label: "Admissions", desc: "Enrollment, applications, intake information" },
    { value: "attendance", label: "Attendance", desc: "Absences, late arrivals, truancy alerts" },
    { value: "grade", label: "Grades", desc: "Results, report cards, grade updates" },
    { value: "assignment", label: "Assignments", desc: "Homework, project deadlines" },
    { value: "payment", label: "Payments & Fees", desc: "Fee reminders, receipts, balances" },
    { value: "event", label: "Events", desc: "School events, ceremonies, trips" },
    { value: "emergency", label: "Emergency", desc: "Urgent safety/health alerts" },
    { value: "system", label: "System", desc: "Platform updates, maintenance" },
  ];

  const PRIORITIES = [
    { value: "normal", label: "Normal", desc: "Routine communication, no urgency", color: "#22c55e" },
    { value: "urgent", label: "Urgent", desc: "Requires attention within 24 hours", color: "#f59e0b" },
    { value: "critical", label: "Critical", desc: "Immediate action required", color: "#ef4444" },
  ];

  const RECIPIENTS = [
    { value: "all", label: "All Users", desc: "Everyone in the system" },
    { value: "students", label: "Students Only", desc: "All enrolled students" },
    { value: "teachers", label: "Teachers Only", desc: "All teaching staff" },
    { value: "parents", label: "Parents Only", desc: "All registered parents/guardians" },
    { value: "administration", label: "Admins Only", desc: "System administrators" },
  ];

  const CHANNELS = [
    { value: "inApp", label: "In-App", desc: "Notification inside platform" },
    { value: "email", label: "Email", desc: "Sent to registered email" },
    { value: "sms", label: "SMS", desc: "Text message (costs may apply)" },
    { value: "push", label: "Push", desc: "Mobile push notification" },
  ];

  const GROUPS = [
    { value: "", label: "All (No specific group)" },
    { value: "Grade 10A", label: "Grade 10A" },
    { value: "Grade 10B", label: "Grade 10B" },
    { value: "Grade 11A", label: "Grade 11A" },
    { value: "Grade 11B", label: "Grade 11B" },
    { value: "Form 3", label: "Form 3" },
    { value: "Science", label: "Science Department" },
    { value: "Mathematics", label: "Mathematics Department" },
  ];

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = "Title is required";
    else if (form.title.length > 100) errs.title = "Title must be 100 characters or less";
    if (!form.message?.trim()) errs.message = "Message is required";
    if (form.targetRoles.length === 0 && form.targetRole === "all") {
      // ok - will send to all
    } else if (form.targetRoles.length === 0 && !form.targetRole) {
      errs.recipients = "Select at least one recipient group";
    }
    if (form.channels.length === 0) errs.channels = "Select at least one delivery channel";
    if (form.schedule === "later") {
      if (!form.scheduledDate || !form.scheduledTime) errs.schedule = "Select date and time";
      else {
        const scheduled = new Date(`${form.scheduledDate}T${form.scheduledTime}`);
        if (scheduled < new Date()) errs.schedule = "Schedule cannot be in the past";
      }
    }
    if (form.priority === "critical" && !form.channels.includes("sms") && !form.channels.includes("push")) {
      errs.warning = "Critical notifications should include SMS or Push for maximum reach";
    }
    if (form.message.length > 500 && form.channels.includes("sms")) {
      errs.warning = "Message exceeds 500 chars — SMS will be truncated";
    }
    setErrors(errs);
    return Object.keys(errs).filter(k => k !== "warning").length === 0;
  };

  const handleNext = (e) => {
    e?.preventDefault();
    if (validate()) setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    
    // Map target roles for backend
    const targetRoleValue = form.targetRole === "custom" && form.targetRoles.length > 0 
      ? form.targetRoles.join(",") 
      : form.targetRole;

    try {
      await notifApi(serviceUrl, token, "POST", "/notifications/send", {
        title: form.title,
        message: form.message,
        category: form.category,
        priority: form.priority,
        targetRole: targetRoleValue,
        group: form.group,
        channels: form.channels.join(","),
        senderRole: userRole
      });
      setResult({ success: true, message: "Notification sent successfully!" });
      setForm({
        title: "",
        message: "",
        category: "general",
        priority: "normal",
        targetRoles: [],
        targetRole: "all",
        group: "",
        channels: ["inApp"],
        schedule: "now",
        scheduledDate: "",
        scheduledTime: "",
      });
      setStep(1);
      setTimeout(() => { onClose(); setResult(null); }, 2000);
    } catch (err) {
      setResult({ success: false, message: err.message || "Failed to send notification" });
    } finally {
      setSending(false);
    }
  };

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleArrayItem = (field, value) => {
    setForm(prev => {
      const arr = prev[field] || [];
      if (arr.includes(value)) return { ...prev, [field]: arr.filter(v => v !== value) };
      return { ...prev, [field]: [...arr, value] };
    });
  };

const getPriorityColor = (p) => PRIORITIES.find(pr => pr.value === p)?.color || "#22c55e";

  const renderStep1 = () => (
    <form onSubmit={handleNext}>
      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6 }}>
          Title <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <input
          value={form.title}
          onChange={(e) => updateForm("title", e.target.value)}
          placeholder="Enter notification title (max 100 chars)"
          maxLength={100}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${errors.title ? "#ef4444" : C.border}`,
            fontSize: 14, background: C.input, color: C.text1, outline: "none"
          }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.text3, marginTop: 4 }}>
          <span style={{ color: errors.title ? "#ef4444" : C.text3 }}>{errors.title || ""}</span>
          <span>{form.title.length}/100</span>
        </div>
      </div>

      {/* Category */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6 }}>
          Category <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <select
          value={form.category}
          onChange={(e) => updateForm("category", e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, background: C.input, color: C.text1, outline: "none" }}
        >
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>
          {CATEGORIES.find(c => c.value === form.category)?.desc}
        </div>
      </div>

      {/* Priority */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6 }}>
          Priority <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          {PRIORITIES.map(p => (
            <button
              key={p.value}
              type="button"
              onClick={() => updateForm("priority", p.value)}
              style={{
                flex: 1, padding: "8px 4px", borderRadius: 6, border: "none",
                background: form.priority === p.value ? p.color : "transparent",
                color: form.priority === p.value ? "#fff" : C.text2,
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: form.priority === p.value ? "none" : `1px solid ${C.border}`
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipients */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6 }}>
          Send To <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <select
          value={form.targetRole}
          onChange={(e) => updateForm("targetRole", e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${errors.recipients ? "#ef4444" : C.border}`, fontSize: 14, background: C.input, color: C.text1, outline: "none" }}
        >
          {RECIPIENTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>
          {RECIPIENTS.find(r => r.value === form.targetRole)?.desc}
        </div>
      </div>

      {/* Specific Group */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6 }}>
          Specific Group (Optional)
        </label>
        <select
          value={form.group}
          onChange={(e) => updateForm("group", e.target.value)}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 14, background: C.input, color: C.text1, outline: "none" }}
        >
          {GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </div>

      {/* Delivery Channels */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6 }}>
          Delivery Channel <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CHANNELS.map(ch => (
            <label key={ch.value} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.channels.includes(ch.value)}
                onChange={() => toggleArrayItem("channels", ch.value)}
                style={{ accentColor: C.blue }}
              />
              <span style={{ fontSize: 13, color: C.text1 }}>{ch.label}</span>
            </label>
          ))}
        </div>
        {errors.channels && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.channels}</div>}
      </div>

      {/* Schedule */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6 }}>
          Schedule
        </label>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button
            type="button"
            onClick={() => updateForm("schedule", "now")}
            style={{
              flex: 1, padding: "8px", borderRadius: 6, border: "none",
              background: form.schedule === "now" ? C.blue : "transparent",
              color: form.schedule === "now" ? "#fff" : C.text2,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: form.schedule === "now" ? "none" : `1px solid ${C.border}`
            }}
          >
            Send Now
          </button>
          <button
            type="button"
            onClick={() => updateForm("schedule", "later")}
            style={{
              flex: 1, padding: "8px", borderRadius: 6, border: "none",
              background: form.schedule === "later" ? C.blue : "transparent",
              color: form.schedule === "later" ? "#fff" : C.text2,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: form.schedule === "later" ? "none" : `1px solid ${C.border}`
            }}
          >
            Schedule
          </button>
        </div>
        {form.schedule === "later" && (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => updateForm("scheduledDate", e.target.value)}
              style={{ flex: 1, padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.input, color: C.text1 }}
            />
            <input
              type="time"
              value={form.scheduledTime}
              onChange={(e) => updateForm("scheduledTime", e.target.value)}
              style={{ flex: 1, padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, background: C.input, color: C.text1 }}
            />
          </div>
        )}
        {errors.schedule && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.schedule}</div>}
      </div>

      {/* Message */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.text2, marginBottom: 6 }}>
          Message <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <textarea
          value={form.message}
          onChange={(e) => updateForm("message", e.target.value)}
          placeholder="Enter your notification message..."
          rows={5}
          style={{
            width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${errors.message ? "#ef4444" : C.border}`,
            fontSize: 14, background: C.input, color: C.text1, outline: "none", resize: "vertical"
          }}
        />
        {errors.message && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.message}</div>}
        {errors.warning && (
          <div style={{ fontSize: 12, color: "#f59e0b", marginTop: 8, padding: "8px 12px", borderRadius: 6, background: "#f59e0b20", border: "1px solid #f59e0b" }}>
            ⚠️ {errors.warning}
          </div>
        )}
      </div>

      {result && (
        <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: result.success ? C.greenBg : C.redBg, color: result.success ? C.green : C.red, fontSize: 13, fontWeight: 600 }}>
          {result.message}
        </div>
      )}

      <button
        type="submit"
        disabled={sending || !form.title || !form.message}
        style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", background: sending ? C.text3 : C.blue, color: "#fff", fontSize: 14, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer" }}
      >
        {sending ? "Sending..." : "Preview & Send →"}
      </button>
    </form>
  );

  const renderStep2 = () => (
    <div>
      <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: C.input, border: `1px solid ${C.border}` }}>
        <h4 style={{ margin: "0 0 12px", fontSize: 14, color: C.text2 }}>Preview</h4>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.text1, marginBottom: 8 }}>{form.title}</div>
        <div style={{ fontSize: 13, color: C.text2 }}>{form.message}</div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ color: C.text2 }}>Category</span>
          <span style={{ fontWeight: 600, color: C.text1 }}>{CATEGORIES.find(c => c.value === form.category)?.label}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ color: C.text2 }}>Priority</span>
          <span style={{ fontWeight: 600, color: getPriorityColor(form.priority) }}>{PRIORITIES.find(p => p.value === form.priority)?.label}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ color: C.text2 }}>Send To</span>
          <span style={{ fontWeight: 600, color: C.text1 }}>{RECIPIENTS.find(r => r.value === form.targetRole)?.label}</span>
        </div>
        {form.group && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.text2 }}>Group</span>
            <span style={{ fontWeight: 600, color: C.text1 }}>{form.group}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ color: C.text2 }}>Channels</span>
          <span style={{ fontWeight: 600, color: C.text1 }}>{form.channels.map(ch => CHANNELS.find(c => c.value === ch)?.label).join(", ")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          <span style={{ color: C.text2 }}>Schedule</span>
          <span style={{ fontWeight: 600, color: C.text1 }}>
            {form.schedule === "now" ? "Send Now" : `${form.scheduledDate} ${form.scheduledTime}`}
          </span>
        </div>
      </div>

      {result && (
        <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 16, background: result.success ? C.greenBg : C.redBg, color: result.success ? C.green : C.red, fontSize: 13, fontWeight: 600 }}>
          {result.message}
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={handleBack}
          disabled={sending}
          style={{ flex: 1, padding: "12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.text1, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={sending}
          style={{ flex: 1, padding: "12px", borderRadius: 8, border: "none", background: sending ? C.text3 : C.green, color: "#fff", fontSize: 14, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer" }}
        >
          {sending ? "Sending..." : "Confirm & Send ✓"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
      backdropFilter: "blur(4px)"
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 520,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", maxHeight: "90vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.text1 }}>Send Notification</h3>
            <div style={{ fontSize: 12, color: C.text3, marginTop: 4 }}>Step {step} of 2</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} color={C.text2} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 1 ? C.blue : C.border }} />
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 2 ? C.blue : C.border }} />
        </div>

        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
}
