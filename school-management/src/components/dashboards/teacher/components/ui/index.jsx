import React from "react";
import { X, Loader2 } from "lucide-react";
import { T, inp } from "../../theme";

// --- HELPERS ---
const flexCenter = { display: "flex", alignItems: "center", justifyContent: "center" };

// --- COMPONENTS ---

/** 1. Card: A basic container for sections */
export const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: T.r2,
    padding: "20px 24px",
    marginBottom: "18px",
    ...style
  }}>
    {children}
  </div>
);

/** 2. PageHeader: Icon + Title + Subtitle */
export const PageHeader = ({ icon, title, sub }) => (
  <div style={{ marginBottom: "28px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
      <span style={{ fontSize: "28px" }}>{icon}</span>
      <h1 style={{ fontSize: "22px", fontWeight: 800, color: T.text1, margin: 0 }}>{title}</h1>
    </div>
    {sub && <p style={{ fontSize: "13px", color: T.text2, margin: 0 }}>{sub}</p>}
  </div>
);

/** 3. Avatar: Standard initials circle */
export const Avatar = ({ name = "U", size = 30, color = T.accent }) => {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color + "22",
      border: `1px solid ${color}33`,
      color: color,
      fontSize: Math.max(10, size * 0.4),
      fontWeight: 700,
      ...flexCenter,
      flexShrink: 0,
    }}>
      {initials[0]}
    </div>
  );
};

/** 4. Spinner: Simple CSS loader */
export const Spinner = () => (
  <div style={{
    width: "24px",
    height: "24px",
    border: `2px solid ${T.border2}`,
    borderTop: `2px solid ${T.accent}`,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto",
  }} />
);

/** 5. Alert: Success/Error message box */
export const Alert = ({ type, msg, onClose }) => {
  if (!msg) return null;
  const isError = type === "error";
  const color = isError ? T.red : T.green;
  return (
    <div style={{
      padding: "12px 16px",
      borderRadius: T.r,
      background: (isError ? T.redAlp : T.greenAlp) + "dd", // Slightly more opaque for alerts
      border: `1px solid ${color}33`,
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
      marginTop: "16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    }}>
      <span>{msg}</span>
      {onClose && <button onClick={onClose} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", padding: "0 4px" }}><X size={16} /></button>}
    </div>
  );
};

/** 6. Field: Label + Input wrapper */
export const Field = ({ label, required, children, hint }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
    <label style={{ fontSize: "11px", fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {label} {required && <span style={{ color: T.red }}>*</span>}
    </label>
    {children}
    {hint && <span style={{ fontSize: "10px", color: T.text3 }}>{hint}</span>}
  </div>
);

/** 7. Select: Styled dropdown */
export const Select = ({ value, onChange, children, style = {} }) => (
  <select value={value} onChange={onChange} style={{ ...inp, ...style }}>
    {children}
  </select>
);

/** 8. Input: Generic styled input */
export const Input = (props) => (
  <input {...props} style={{ ...inp, ...props.style }} />
);

/** 9. Textarea: Styled multiline input */
export const Textarea = (props) => (
  <textarea {...props} style={{ ...inp, padding: "12px 14px", resize: "vertical", ...props.style }} />
);

/** 10. Badge: Small status indicator */
export const Badge = ({ label, color = T.accent }) => (
  <span style={{
    fontSize: "10px",
    fontWeight: 700,
    textTransform: "uppercase",
    padding: "2px 8px",
    borderRadius: "99px",
    background: color + "18",
    color: color,
    border: `1px solid ${color}33`,
    whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

/** 11. Btn: Action button with variants */
export const Btn = ({ children, onClick, loading, variant = "primary", style = {} }) => {
  const variants = {
    primary: { bg: T.accent, color: "#fff", border: "none" },
    success: { bg: T.green, color: "#fff", border: "none" },
    ghost:   { bg: "transparent", color: T.text2, border: `1px solid ${T.border}` },
  };
  const { bg, color, border } = variants[variant] || variants.primary;
  
  return (
    <button 
      onClick={onClick} 
      disabled={loading} 
      style={{
        background: bg,
        color: color,
        border: border,
        borderRadius: T.r,
        padding: "10px 22px",
        fontSize: "13px",
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1,
        transition: "all 0.2s",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        ...style
      }}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
};
