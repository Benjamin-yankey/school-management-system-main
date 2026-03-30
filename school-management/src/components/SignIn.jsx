import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, UserRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const trimmedEmail = email.trim();
  const isValidEmail = useMemo(() => {
    if (!trimmedEmail) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  }, [trimmedEmail]);

  const isValidPassword = password.length >= 6;
  const canSubmit = isValidEmail && isValidPassword && !isLoading;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (!canSubmit) return;

    setIsLoading(true);
    setError("");

    try {
      const result = await login(trimmedEmail, password, role);
      if (result.success) {
        if (result.user.mustResetPassword) {
          navigate("/force-reset");
        } else {
          navigate(`/${role}/dashboard`);
        }
        return;
      }
      setError(result.error || "Invalid credentials.");
    } catch (loginError) {
      setError("We could not sign you in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = () => {
    navigate("/forgot-password");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const handleHome = () => {
    navigate("/");
  };

  const emailError = touched.email && !!trimmedEmail && !isValidEmail;
  const passwordError = touched.password && !!password && !isValidPassword;

  return (
    <div className="signin-page">
      <div className="signin-shell">
        <div className="signin-card">
          <header className="signin-header">
            <div className="signin-badge">
              <UserRound size={26} />
            </div>
            <h1 className="signin-title">Sign In</h1>
            <p className="signin-subtitle">
              Welcome back. Please enter your details to continue.
            </p>
          </header>

          <form className="signin-form" onSubmit={handleSubmit} noValidate>
            <div className="signin-form-group">
              <label className="signin-label" htmlFor="signin-email">
                Email Address
              </label>
              <div className="signin-input-wrap">
                <Mail className="signin-icon" size={18} />
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
                  placeholder="your.email@example.com"
                  className="signin-input"
                  autoComplete="email"
                  aria-invalid={emailError}
                  aria-describedby="email-feedback"
                  required
                />
              </div>
              {emailError ? (
                <p className="signin-error" id="email-feedback">
                  Enter a valid email address.
                </p>
              ) : (
                <p className="signin-hint" id="email-feedback">
                  Use the email associated with your account.
                </p>
              )}
            </div>

            <div className="signin-form-group">
              <label className="signin-label" htmlFor="signin-password">
                Password
              </label>
              <div className="signin-input-wrap">
                <Lock className="signin-icon" size={18} />
                <input
                  id="signin-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, password: true }))
                  }
                  placeholder="Enter your password"
                  className="signin-input"
                  autoComplete="current-password"
                  aria-invalid={passwordError}
                  aria-describedby="password-feedback"
                  required
                />
                <button
                  type="button"
                  className="signin-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError ? (
                <p className="signin-error" id="password-feedback">
                  Password must be at least 6 characters.
                </p>
              ) : (
                <p className="signin-hint" id="password-feedback">
                  Use your secure account password.
                </p>
              )}
            </div>

            <div className="signin-form-group">
              <label className="signin-label" htmlFor="signin-role">
                Sign in as
              </label>
              <div className="signin-select-wrap">
                <select
                  id="signin-role"
                  name="role"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  className="signin-select"
                >
                  <option value="admin">Administrator</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                </select>
              </div>
            </div>

            <div className="signin-row">
              <label className="signin-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="signin-link"
                onClick={handleForgot}
              >
                Forgot password?
              </button>
            </div>

            {error && <div className="signin-alert">{error}</div>}

            <button
              type="submit"
              className="signin-button"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="spinner" size={18} />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="signin-footer">
            <p className="signin-footer-text">
              Don't have an account?{" "}
              <button
                type="button"
                className="signin-footer-link"
                onClick={handleSignUp}
              >
                Sign Up
              </button>
            </p>
            <p className="signin-footer-text">
              <button
                type="button"
                className="signin-footer-link"
                onClick={handleHome}
              >
                Back to Home
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
