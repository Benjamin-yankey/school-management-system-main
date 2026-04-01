// Sidebar.jsx — Teacher Dashboard Navigation (Responsive & Theme-Aware)

import React from "react";
import { useNavigate } from "react-router-dom";
import { T } from "../theme";
import {
  Home,
  CheckCircle,
  ClipboardList,
  BarChart2,
  Megaphone,
  Bell,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "home", label: "Overview", icon: <Home size={18} /> },
  { id: "attendance", label: "Attendance", icon: <CheckCircle size={18} /> },
  { id: "assignment", label: "Assignments", icon: <ClipboardList size={18} /> },
  { id: "grades", label: "Grades", icon: <BarChart2 size={18} /> },
  { id: "notice", label: "Notice Board", icon: <Megaphone size={18} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
];

export default function Sidebar({ active, onNavigate, isOpen, onClose }) {
  const navigate = useNavigate();
  return (
    <aside
      className={`teacher-sidebar ${isOpen ? "open" : ""}`}
      style={{
        width: T.sidebarW,
        background: T.bg,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        gap: 6,
        flexShrink: 0,
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 90,
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .teacher-sidebar {
            position: fixed !important;
            left: -100%;
            top: 60px;
            bottom: 0;
            background: ${T.bg} !important;
            box-shadow: 10px 0 30px rgba(0,0,0,0.15);
          }
          .teacher-sidebar.open {
            left: 0 !important;
          }
          .sidebar-label { font-size: 14px !important; }
        }
      `}</style>

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: T.text3,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          padding: "0 12px 16px",
          opacity: 0.8,
        }}
      >
        Navigation
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === "notifications") {
                navigate("/notifications");
                onClose();
              } else {
                onNavigate(item.id);
              }
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 16px",
              borderRadius: T.r,
              border: "none",
              cursor: "pointer",
              width: "100%",
              textAlign: "left",
              fontSize: 14,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? T.accent : T.text2,
              background: isActive ? T.accentAlp : "transparent",
              transition: "all 0.2s",
              outline: "none",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                opacity: isActive ? 1 : 0.7,
              }}
            >
              {item.icon}
            </span>
            <span className="sidebar-label">{item.label}</span>
            {isActive && (
              <div
                style={{
                  marginLeft: "auto",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: T.accent,
                  boxShadow: `0 0 10px ${T.accent}88`,
                }}
              />
            )}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          paddingTop: 20,
          marginTop: 10,
          fontSize: 11,
          color: T.text3,
          textAlign: "center",
          lineHeight: 1.8,
          opacity: 0.6,
          letterSpacing: 0.5,
        }}
      >
        <div style={{ fontWeight: 800, color: T.text1, opacity: 0.9 }}>
          GEOZIIE INTERNATIONAL SCHOOL
        </div>
        Teacher Portal v2.0
      </div>
    </aside>
  );
}
