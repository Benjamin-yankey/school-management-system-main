// TeacherDashboard.jsx — Root component with Theme Support & Mobile Responsiveness

import React, { useState, useEffect } from "react";
import { T } from "./teacher/theme";
import { api } from "./teacher/hooks/useApi";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Header    from "../Header";
import Sidebar   from "./teacher/components/Sidebar";
import HomePage       from "./teacher/pages/HomePage";
import AttendancePage from "./teacher/pages/AttendancePage";
import AssignmentPage from "./teacher/pages/AssignmentPage";
import GradesPage     from "./teacher/pages/GradesPage";
import NoticePage     from "./teacher/pages/NoticePage";

const DEFAULT_BASE = "http://localhost:3000";

export default function TeacherDashboard({
  token,
  baseUrl = DEFAULT_BASE,
}) {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [page,         setPage]        = useState("home");
  const [sections,     setSections]    = useState([]);
  const [sidebarOpen,  setSidebarOpen] = useState(false);

  const teacher = {
    name: user?.name || "Teacher",
    role: user?.role || "Teacher",
    department: user?.department || "Academic",
  };

  // Load real sections from the backend
  useEffect(() => {
    api(baseUrl, token, "GET", "/teacher/sections")
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || [];
        setSections(list);
      })
      .catch((err) => {
        console.error("Failed to load sections:", err);
        setSections([]);
      });
  }, [baseUrl, token]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar  = () => setSidebarOpen(false);

  const pageProps = { base: baseUrl, token, sections };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        fontFamily: "'Inter','Segoe UI',sans-serif",
        color: T.text1,
        transition: "background 0.3s ease, color 0.3s ease",
      }}
    >
      <style>{`
        /* Global Reset & Utils */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: ${T.accent};
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          z-index: 100;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .mobile-menu-btn:active { transform: scale(0.9); }

        @media (max-width: 900px) {
          .mobile-menu-btn { display: flex; }
          .main-content { padding: 20px 16px !important; }
        }
      `}</style>

      {/* Global Header */}
      <Header />

      <div style={{ display: "flex", height: "calc(100vh - 60px)", position: "relative" }}>
        
        {/* Sidebar Navigation */}
        <Sidebar 
          active={page} 
          onNavigate={(p) => { setPage(p); closeSidebar(); }} 
          isOpen={sidebarOpen} 
          onClose={closeSidebar}
        />

        {/* Main Content Area */}
        <main 
          className="main-content"
          style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: "28px 32px",
            background: T.bg,
            transition: "all 0.3s ease",
          }}
        >
          {page === "home"       && <HomePage       teacher={teacher} onNavigate={setPage} sections={sections} {...pageProps} />}
          {page === "attendance" && <AttendancePage {...pageProps} />}
          {page === "assignment" && <AssignmentPage {...pageProps} />}
          {page === "grades"     && <GradesPage     {...pageProps} />}
          {page === "notice"     && <NoticePage     {...pageProps} />}
        </main>

        {/* Floating Mobile Toggle */}
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          {sidebarOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          )}
        </button>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            onClick={closeSidebar}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
              zIndex: 80, display: "block"
            }}
          />
        )}
      </div>
    </div>
  );
}
