import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Mock users for demonstration
const mockUsers = {
  "admin@school.com": {
    password: "admin123",
    role: "admin",
    name: "Admin User",
  },
  "teacher@school.com": {
    password: "teacher123",
    role: "teacher",
    name: "John Teacher",
  },
  "student@school.com": {
    password: "student123",
    role: "student",
    name: "Jane Student",
  },
  "parent@school.com": {
    password: "parent123",
    role: "parent",
    name: "Parent User",
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem("schoolsync_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, selectedRole) => {
    setLoading(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user exists in mock data
    const userData = mockUsers[email.toLowerCase()];

    if (userData && userData.password === password) {
      // Use selected role instead of stored role for flexibility
      const user = {
        email: email.toLowerCase(),
        name: userData.name,
        role: selectedRole,
        avatar: userData.name
          .split(" ")
          .map((n) => n[0])
          .join(""),
      };

      setUser(user);
      localStorage.setItem("schoolsync_user", JSON.stringify(user));
      setLoading(false);
      return { success: true, user };
    }

    setLoading(false);
    return { success: false, error: "Invalid credentials" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("schoolsync_user");
  };

  const updateProfile = (updates = {}) => {
    setUser((prev) => {
      if (!prev) return prev;
      const nextUser = { ...prev, ...updates };
      localStorage.setItem("schoolsync_user", JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
