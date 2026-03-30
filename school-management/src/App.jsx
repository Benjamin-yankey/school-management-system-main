import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import ForceResetPassword from "./components/ForceResetPassword";

import AdminDashboard from "./components/dashboards/AdminDashboard";
import TeacherDashboard from "./components/dashboards/TeacherDashboard";
import StudentDashboard from "./components/dashboards/StudentDashboard";
import ParentDashboard from "./components/dashboards/ParentDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import AcademyLandingPage from "./AcademyLandingPage";
import Home from "./Home";
import ProgramsPage from "./pages/ProgramsPage";
import CampusPage from "./pages/CampusPage";
import AdmissionsPage from "./pages/AdmissionsPage";
import AddStudent from "./pages/AddStudent";

export default function App() {
  return (
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
                <SuperAdminDashboard />
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

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/original" element={<AcademyLandingPage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/campus" element={<CampusPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/force-reset" element={<ForceResetPassword />} />
          
          {/* Add Student Page (admin only) */}
          <Route
            path="/add-student"
            element={
              <ProtectedRoute requiredRole={["admin", "administration"]}>
                <div className="app">
                  <Header />
                  <AddStudent />
                </div>
              </ProtectedRoute>
            }
          />
          
          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole={["admin", "administration"]}>
                <div className="app">
                  <Header />
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
                <div className="app">
                  <Header />
                  <TeacherDashboard />
                </div>
              </ProtectedRoute>
            }
          />
          
          {/* Student Dashboard */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <div className="app">
                  <Header />
                  <StudentDashboard />
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
                  <Header />
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
  );
}
