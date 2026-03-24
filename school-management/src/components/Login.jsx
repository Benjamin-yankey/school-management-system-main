import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { GraduationCap, Eye, EyeOff } from "lucide-react";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "admin",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const roles = [
    { value: "admin", label: "Administrator", color: "#2563eb", icon: "👨‍💼" },
    { value: "teacher", label: "Teacher", color: "#10b981", icon: "👨‍🏫" },
    { value: "student", label: "Student", color: "#8b5cf6", icon: "👨‍🎓" },
    { value: "parent", label: "Parent", color: "#f59e0b", icon: "👨‍👩‍👧‍👦" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(
        formData.email,
        formData.password,
        formData.role
      );

      if (result.success) {
        // Navigate based on role
        navigate(`/${formData.role}/dashboard`);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    return roles.find((r) => r.value === role) || roles[0];
  };

  const currentRole = getRoleInfo(formData.role);

  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Logo and Header */}
        <div className="login-header">
          <div className="login-logo">
            <GraduationCap />
          </div>
          <h1 className="login-title">SchoolSync Pro</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="login-form-container">
          {/* Role Selection */}
          <div className="role-selection">
            <label className="role-label">Select Your Role</label>
            <div className="role-grid">
              {roles.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, role: role.value }))
                  }
                  className={`role-button ${
                    formData.role === role.value ? "active" : ""
                  }`}
                  style={{
                    borderColor:
                      formData.role === role.value ? role.color : undefined,
                    backgroundColor:
                      formData.role === role.value
                        ? `${role.color}10`
                        : "white",
                  }}
                >
                  <div className="role-icon">{role.icon}</div>
                  <div className="role-name">{role.label}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={getPlaceholder("email", formData.role)}
                className="form-input"
                style={{
                  "--focus-color": currentRole.color,
                  "--focus-color-rgb": hexToRgb(currentRole.color),
                }}
                required
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input"
                  style={{
                    "--focus-color": currentRole.color,
                    "--focus-color-rgb": hexToRgb(currentRole.color),
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-label">Remember me</span>
              </label>
              <a href="#" className="forgot-link">
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="login-button"
              style={{
                backgroundColor: currentRole.color,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing in...
                </>
              ) : (
                `Sign in as ${currentRole.label}`
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="demo-credentials">
            <h4 className="demo-title">Demo Credentials:</h4>
            <div className="demo-list">
              <div className="demo-item">
                <strong>Admin:</strong> admin@school.com / admin123
              </div>
              <div className="demo-item">
                <strong>Teacher:</strong> teacher@school.com / teacher123
              </div>
              <div className="demo-item">
                <strong>Student:</strong> student@school.com / student123
              </div>
              <div className="demo-item">
                <strong>Parent:</strong> parent@school.com / parent123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get role-specific placeholders
const getPlaceholder = (field, role) => {
  const placeholders = {
    email: {
      admin: "admin@school.com",
      teacher: "teacher@school.com",
      student: "student@school.com",
      parent: "parent@school.com",
    },
  };
  return placeholders[field]?.[role] || "Enter your email";
};

// Helper function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "59, 130, 246";
};

export default Login;
