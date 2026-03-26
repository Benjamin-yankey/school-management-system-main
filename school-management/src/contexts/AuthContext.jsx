import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../lib/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage (set by our API)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, selectedRole) => {
    setLoading(true);

    try {
      // Call the backend API - returns { accessToken: "jwt..." }
      const result = await api.login(email, password);

      if (result.accessToken) {
        // Get full profile data
        const profile = await api.getProfile();

        const userData = {
          id: profile.id,
          email: profile.email,
          name:
            profile.firstName && profile.lastName
              ? `${profile.firstName} ${profile.lastName}`
              : profile.email.split("@")[0],
          firstName: profile.firstName || "",
          lastName: profile.lastName || "",
          phone: profile.phone || "",
          role: profile.role || selectedRole,
          schoolId: profile.schoolId,
          avatar:
            profile.firstName && profile.lastName
              ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
              : profile.email[0].toUpperCase(),
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setLoading(false);
        return { success: true, user: userData };
      }

      setLoading(false);
      return { success: false, error: "Login failed - no token received" };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message || "Invalid credentials" };
    }
  };

  const register = async (email, password, name, role) => {
    setLoading(true);
    try {
      const result = await api.register(email, password, name, role);
      setLoading(false);
      return { success: true, user: result };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    api.logout();
  };

  const updateProfile = async (updates = {}) => {
    try {
      await api.updateProfile(updates);
      setUser((prev) => {
        if (!prev) return prev;
        const nextUser = {
          ...prev,
          ...updates,
          name:
            updates.firstName && updates.lastName
              ? `${updates.firstName} ${updates.lastName}`
              : prev.name,
        };
        localStorage.setItem("user", JSON.stringify(nextUser));
        return nextUser;
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
