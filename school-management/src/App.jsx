import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Header from "./components/Header";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

import AdminDashboard from "./components/dashboards/AdminDashboard";
import TeacherDashboard from "./components/dashboards/TeacherDashboard";
import StudentDashboard from "./components/dashboards/StudentDashboard";
import ParentDashboard from "./components/dashboards/ParentDashboard";

import AddStudent from "./pages/AddStudent";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Add Student Page (admin only) */}
          <Route
            path="/add-student"
            element={
              <ProtectedRoute requiredRole="admin">
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
              <ProtectedRoute requiredRole="admin">
                <div className="app">
                  <Header />
                  <AdminDashboard />
                </div>
              </ProtectedRoute>
            }
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

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
