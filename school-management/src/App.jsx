import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import SignIn from "./components/SignIn";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ForceResetPassword from "./components/ForceResetPassword";

import AdminDashboard from "./components/dashboards/AdminDashboard";
import TeacherDashboard from "./components/dashboards/TeacherDashboard";
import StudentDashboard from "./components/dashboards/StudentDashboard";
import StudentAssignments from "./components/student/Assignments";
import StudentGrades from "./components/student/Grades";
import StudentTimetable from "./components/student/Timetable";
import StudentPayments from "./components/student/Payments";
import ParentDashboard from "./components/dashboards/ParentDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import AcademyLandingPage from "./AcademyLandingPage";
import Home from "./Home";
import ProgramsPage from "./pages/ProgramsPage";
import CampusPage from "./pages/CampusPage";
import AdmissionsPage from "./pages/AdmissionsPage";
import AddStudent from "./pages/AddStudent";
import AccountPage from "./pages/AccountPage";
import NotificationServicePage from "./lib/NotificationService";
import { useAuth } from "./contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Helper component to wire up TeacherDashboard with props
const TeacherDashboardRoute = () => {
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  return (
    <TeacherDashboard
      token={token}
      baseUrl={baseUrl}
    />
  );
};

const NotificationsRoute = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const serviceUrl = import.meta.env.VITE_NOTIFICATION_URL || "http://localhost:3001";

  return (
    <div className="app">
      <Navbar />
      <div className="app-main-content" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <NotificationServicePage token={token} serviceUrl={serviceUrl} userId={user?.id} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Superadmin Dashboard - Full system access */}
            <Route
              path="/superadmin"
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <div className="app">
                    <Navbar />
                    <SuperAdminDashboard />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin/dashboard"
              element={<Navigate to="/superadmin" replace />}
            />
            {/* Superadmin as standalone (for development/testing) */}
            <Route
              path="/superadmin-dashboard"
              element={<SuperAdminDashboard />}
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsRoute />
                </ProtectedRoute>
              }
            />

            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/original" element={<AcademyLandingPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/campus" element={<CampusPage />} />
            <Route path="/admissions" element={<AdmissionsPage />} />
            <Route path="/login" element={<Navigate to="/signin" replace />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<Navigate to="/signin" replace />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/force-reset" element={<ForceResetPassword />} />
            
            {/* Account Settings Page */}
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <AccountPage />
                </ProtectedRoute>
              }
            />
            
            {/* Add Student Page (admin only) */}
            <Route
              path="/add-student"
              element={
                <ProtectedRoute requiredRole={["admin", "administration", "superadmin"]}>
                  <div className="app">
                    <Navbar />
                    <AddStudent />
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Admin Dashboard */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requiredRole={["admin", "administration", "superadmin"]}>
                  <div className="app">
                    <Navbar />
                    <AdminDashboard />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/administration/dashboard"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            
            {/* Teacher Dashboard */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboardRoute />
                </ProtectedRoute>
              }
            />
            
            {/* Student Dashboard */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute requiredRole="student">
                  <div className="app">
                    <Navbar />
                    <StudentDashboard />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/assignments"
              element={
                <ProtectedRoute requiredRole="student">
                  <div className="app">
                    <Navbar />
                    <StudentAssignments />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/grades"
              element={
                <ProtectedRoute requiredRole="student">
                  <div className="app">
                    <Navbar />
                    <StudentGrades />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/timetable"
              element={
                <ProtectedRoute requiredRole="student">
                  <div className="app">
                    <Navbar />
                    <StudentTimetable />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/payments"
              element={
                <ProtectedRoute requiredRole="student">
                  <div className="app">
                    <Navbar />
                    <StudentPayments />
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Parent Dashboard */}
            <Route
              path="/parent/dashboard"
              element={
                <ProtectedRoute requiredRole="parent">
                  <div className="app">
                    <Navbar />
                    <ParentDashboard />
                  </div>
                </ProtectedRoute>
              }
            />
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
