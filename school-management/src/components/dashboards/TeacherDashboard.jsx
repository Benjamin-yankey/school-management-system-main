// TeacherDashboard.jsx — Root component with Theme Support & Mobile Responsiveness

import React, { useState, useEffect } from "react";
import { T } from "./teacher/theme";
import { api } from "./teacher/hooks/useApi";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import HomePage       from "./teacher/pages/HomePage";
import AttendancePage from "./teacher/pages/AttendancePage";
import AssignmentPage from "./teacher/pages/AssignmentPage";
import GradesPage     from "./teacher/pages/GradesPage";
import NoticePage     from "./teacher/pages/NoticePage";

import {
  Home,
  CheckCircle,
  ClipboardList,
  BarChart2,
  Megaphone,
  Bell,
} from "lucide-react";

const DEFAULT_BASE = "http://localhost:3000";

const TEACHER_NAV_ITEMS = [
  { id: "home", label: "Overview", icon: <Home size={18} /> },
  { id: "attendance", label: "Attendance", icon: <CheckCircle size={18} /> },
  { id: "assignment", label: "Assignments", icon: <ClipboardList size={18} /> },
  { id: "grades", label: "Grades", icon: <BarChart2 size={18} /> },
  { id: "notice", label: "Notice Board", icon: <Megaphone size={18} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={18} />, action: "/notifications" },
];

export default function TeacherDashboard({
  token,
  baseUrl = DEFAULT_BASE,
}) {
  const { user, activeAcademicYear } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [page, setPage] = useState("home");
  const [sections, setSections] = useState([]);

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
        // Normalize the data: The backend returns TeacherSection[] which nests Section data.
        // We flatten it so pages (Attendance, Assignments, etc.) can use it easily.
        const normalized = list.map(item => ({
          ...item.section,
          id: item.section?.id || item.sectionId, // Ensure we use the actual section ID for API calls
          assignmentId: item.id,                  // Keep the original assignment ID if needed
          level: item.section?.classLevel?.name || item.section?.classLevel?.level || "N/A",
          subject: item.section?.classLevel?.name || "General", // Defaulting subject to class level name
        }));
        setSections(normalized);
      })
      .catch((err) => {
        console.error("Failed to load sections:", err);
        setSections([]);
      });
  }, [baseUrl, token]);

  const pageProps = { base: baseUrl, token, sections, activeAcademicYear };

  const PAGE_TITLES = {
    home: "Teacher Overview",
    attendance: "Attendance",
    assignment: "Assignments",
    grades: "Grades",
    notice: "Notice Board",
  };

  return (
    <DashboardLayout
      navItems={TEACHER_NAV_ITEMS}
      activeItem={page}
      onNavigate={setPage}
      pageTitle={PAGE_TITLES[page] || "Teacher Portal"}
      portalLabel="Teacher Portal v2.0"
    >
      <style>{`
        /* Global Reset & Utils */
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <main
        style={{
          padding: "var(--dash-padding)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--dash-gap)",
          background: T.bg,
          minHeight: "calc(100vh - 64px)",
          transition: "all 0.3s ease",
        }}
      >
        {page === "home"       && <HomePage       teacher={teacher} onNavigate={setPage} sections={sections} {...pageProps} />}
        {page === "attendance" && <AttendancePage {...pageProps} />}
        {page === "assignment" && <AssignmentPage {...pageProps} />}
        {page === "grades"     && <GradesPage     {...pageProps} />}
        {page === "notice"     && <NoticePage     {...pageProps} />}
      </main>
    </DashboardLayout>
  );
}
