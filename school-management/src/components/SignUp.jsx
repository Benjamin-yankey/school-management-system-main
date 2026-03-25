import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, Check } from "lucide-react";
import "./Login.css";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = useMemo(() => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }, [email]);

  const isValidPassword = password.length >= 8;
  const showNameError =
    nameTouched && fullName.trim() && fullName.trim().length < 2;
  const showEmailError = emailTouched && email.trim() && !isValidEmail;
  const showPasswordError = password && !isValidPassword;

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !fullName.trim() ||
      !isValidEmail ||
      !isValidPassword ||
      !agreedToTerms ||
      isLoading
    ) {
      return;
    }

    setIsLoading(true);
    // Simulate signup - replace with actual API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);

    // For demo, redirect to admin dashboard
    navigate("/admin/dashboard");
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength();
  const strengthColor =
    passwordStrength < 50
      ? "#ff5252"
      : passwordStrength < 75
        ? "#ffb74d"
        : "#00e676";

  return (
    <div className="signin-page">
      <div className="signin-shell">
        <div className="signin-card">
          <header className="signin-header">
            <button
              type="button"
              className="signin-back"
              onClick={() => navigate("/signin")}
              aria-label="Back to sign in"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="signin-title">Create Account</h1>
            <div className="signin-back spacer" aria-hidden="true"></div>
          </header>
          {/* Social Login Buttons */}
          <div className="social-buttons">
            <button type="button" className="social-button google">
              <svg
                viewBox="0 0 24 24"
                className="social-icon"
                width="20"
                height="20"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button type="button" className="social-button apple">
              <svg
                viewBox="0 0 24 24"
                className="social-icon"
                width="20"
                height="20"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">
                Full Name
              </label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => setNameTouched(true)}
                  placeholder="Enter your name"
                  className="form-input"
                  autoComplete="name"
                  aria-invalid={showNameError}
                  required
                />
              </div>
              {showNameError && (
                <p className="input-error">Please enter your full name.</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="your.email@example.com"
                  className="form-input"
                  autoComplete="email"
                  aria-invalid={showEmailError}
                  required
                />
                {isValidEmail && <Check size={18} className="input-check" />}
              </div>
              {showEmailError && (
                <p className="input-error">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="form-input"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <Eye size={18} />
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundColor: strengthColor,
                      }}
                    />
                  </div>
                  <p className="strength-hint">Must be at least 8 characters</p>
                </div>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="terms-checkbox">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="checkbox-input"
                />
                <span className="checkbox-custom">
                  <Check size={14} />
                </span>
                <span>
                  I agree to the
                  <button type="button" className="text-link">
                    Terms of Service
                  </button>
                  and
                  <button type="button" className="text-link">
                    Privacy Policy
                  </button>
                </span>
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              className="primary-button"
              disabled={
                !fullName.trim() ||
                !isValidEmail ||
                !isValidPassword ||
                !agreedToTerms ||
                isLoading
              }
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="signin-footer">
            <span>Already have an account?</span>
            <button
              type="button"
              className="signin-footer-link"
              onClick={handleSignIn}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
