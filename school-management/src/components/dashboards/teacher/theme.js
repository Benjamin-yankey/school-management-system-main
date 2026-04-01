// theme.js — Teacher Dashboard design tokens with full CSS variable support

/**
 * T: The central design tokens for the Teacher Dashboard.
 * Now using CSS variables from index.css to support light/dark mode transitions.
 */
export const T = {
  // Main background colors
  bg:      "var(--bg)",
  bg2:     "var(--surface-muted)", // Use surface-muted for subtle layers
  card:    "var(--surface)",
  border:  "var(--border)",
  border2: "var(--border)", // Secondary border, can be adjusted
  
  // Text colors
  text1:   "var(--text)",
  text2:   "var(--text-secondary)",
  text3:   "var(--text-muted)", // Custom muted text variable
  
  // Brand & Accents
  accent:    "var(--accent)",
  accentBg:  "rgba(37, 99, 235, 0.12)",
  accentAlp: "rgba(37, 99, 235, 0.08)",
  
  // Status Colors (Semantic)
  green:     "#10b981",
  greenAlp:  "rgba(16, 185, 129, 0.1)",
  red:       "#ef4444",
  redAlp:    "rgba(239, 68, 68, 0.1)",
  amber:     "#f59e0b",
  amberAlp:  "rgba(245, 158, 11, 0.1)",
  purple:    "#8b5cf6",
  purpleAlp: "rgba(139, 92, 246, 0.1)",
  
  // UI Elements
  inputBg:  "var(--input-bg)",
  divider:  "var(--border)",
  shadow:   "var(--card-shadow)",
  glow:     "var(--card-glow)",
  
  // Layout Constants
  sidebarW: "var(--sidebar-w)",
  headerH:  "var(--header-h)",
  r:        "12px", // border radius standard
  r2:       "16px", // border radius large (cards)
};

/** Shared input/select/textarea styles to ensure consistency and theme support */
export const inp = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: T.r,
  border: `1px solid ${T.border}`,
  background: T.inputBg,
  color: T.text1,
  fontSize: "14px",
  outline: "none",
  transition: "all 0.15s ease",
  fontFamily: "inherit",
  // Note: focus styles are handled via inline focus events in components
};
