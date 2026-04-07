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
  const [activeAcademicYear, setActiveAcademicYear] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);
  const [classLevels, setClassLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveYear = async () => {
    try {
      const year = await api.getActiveAcademicYear();
      if (year && year.id) {
        setActiveAcademicYear(year);
        localStorage.setItem("activeAcademicYear", JSON.stringify(year));
        
        // Fetch terms for this year
        const terms = await api.getAcademicTerms(year.id);
        const current = terms.find(t => t.isCurrent);
        if (current) {
          setCurrentTerm(current);
          localStorage.setItem("currentTerm", JSON.stringify(current));
        } else {
          setCurrentTerm(null);
          localStorage.removeItem("currentTerm");
        }
      } else {
        setActiveAcademicYear(null);
        setCurrentTerm(null);
        localStorage.removeItem("activeAcademicYear");
        localStorage.removeItem("currentTerm");
      }
      
      // Fetch class levels
      const levels = await api.getClassLevels();
      setClassLevels(levels);
      localStorage.setItem("classLevels", JSON.stringify(levels));
      
    } catch (error) {
      console.error("Failed to fetch academic context:", error);
    }
  };

  useEffect(() => {
    // Check if user is logged in from localStorage (set by our API)
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      
      const savedYear = localStorage.getItem("activeAcademicYear");
      if (savedYear) {
        setActiveAcademicYear(JSON.parse(savedYear));
      }
      const savedTerm = localStorage.getItem("currentTerm");
      if (savedTerm) {
        setCurrentTerm(JSON.parse(savedTerm));
      }
      const savedLevels = localStorage.getItem("classLevels");
      if (savedLevels) {
        setClassLevels(JSON.parse(savedLevels));
      }
      // Re-fetch to ensure it's up to date
      fetchActiveYear();
    }
    setLoading(false);
  }, []);

  const decodeJWT = (token) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      return null;
    }
  };

  const login = async (email, password, selectedRole) => {
    setLoading(true);

    try {
      // Call the backend API - returns { accessToken: "jwt..." }
      const result = await api.login(email, password);

      if (result.accessToken) {
        // Decode token to see if we MUST reset password
        const payload = decodeJWT(result.accessToken);
        const mustResetPassword = payload?.mustResetPassword || false;

        let userData;

        if (mustResetPassword) {
          // Skip profile fetch to avoid 403. Build skeletal user from JWT.
          userData = {
            id: payload?.sub,
            email: payload?.email,
            name: payload?.email?.split("@")[0],
            role: payload?.role || selectedRole,
            mustResetPassword: true,
            avatar: payload?.email?.[0].toUpperCase() || "U",
          };
        } else {
          // Get full profile data for normal users
          let profile = {};
          try {
            profile = await api.getProfile();
          } catch (e) {
            console.warn("Failed to fetch profile, using JWT data", e);
          }

          userData = {
            id: profile.id || payload?.sub,
            email: profile.email || payload?.email,
            name:
              [profile.firstName, profile.middleName, profile.lastName]
                .filter(Boolean)
                .join(" ") || 
              (profile.email || payload?.email)?.split("@")[0] || 
              "User",
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            middleName: profile.middleName || "",
            phone: profile.phone || "",
            role: profile.role || payload?.role || selectedRole,
            schoolId: profile.schoolId,
            mustResetPassword: false,
            avatar:
              profile.firstName && profile.lastName
                ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
                : (profile.firstName || (profile.email || payload?.email)?.[0] || "U").toUpperCase(),
          };
        }

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Fetch academic year after login
        await fetchActiveYear();
        
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

  const logout = async () => {
    try {
      await api.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
    setUser(null);
    setActiveAcademicYear(null);
    setCurrentTerm(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("activeAcademicYear");
    localStorage.removeItem("currentTerm");
  };

  const updateProfile = async (updates = {}) => {
    try {
      await api.updateProfile(updates);
      setUser((prev) => {
        if (!prev) return prev;
        const firstName = updates.firstName !== undefined ? updates.firstName : prev.firstName;
        const lastName = updates.lastName !== undefined ? updates.lastName : prev.lastName;
        const middleName = updates.middleName !== undefined ? updates.middleName : prev.middleName;
        
        const nextUser = {
          ...prev,
          ...updates,
          name: [firstName, middleName, lastName].filter(Boolean).join(" "),
          avatar: (firstName?.[0] || prev.name?.[0] || "U").toUpperCase()
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
    activeAcademicYear,
    currentTerm,
    classLevels,
    refreshActiveYear: fetchActiveYear,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
