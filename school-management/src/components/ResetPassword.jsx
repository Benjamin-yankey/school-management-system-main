import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import "./ResetPassword.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const navigate = useNavigate();

  const trimmedEmail = email.trim();
  const isValidEmail = useMemo(() => {
    if (!trimmedEmail) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  }, [trimmedEmail]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleBack = () => {
    navigate("/signin");
  };

  const handleSignIn = () => {
    navigate("/signin");
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleChange = (event) => {
    setEmail(event.target.value);
    setError("");
  };

  const requestReset = async () => {
    setIsLoading(true);
    setError("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSuccess(true);
      setResendCountdown(60);
    } catch (resetError) {
      setError("We could not send a reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (!isValidEmail || isLoading) {
      return;
    }
    await requestReset();
  };

  const handleResend = async () => {
    if (resendCountdown > 0 || isLoading) {
      return;
    }
    await requestReset();
  };

  const showEmailError = touched && !!trimmedEmail && !isValidEmail;
  const resendLabel =
    resendCountdown > 0
      ? `Resend in 0:${String(resendCountdown).padStart(2, "0")}`
      : "Resend";

  return (
    <div className="forgot-page">
      <div className="forgot-shell">
        <header className="forgot-topbar">
          <button
            type="button"
            className="icon-button"
            onClick={handleBack}
            aria-label="Back to sign in"
          >
            <ArrowLeft size={20} />
          </button>
          <h1>Reset Password</h1>
          <div className="icon-button spacer" aria-hidden="true"></div>
        </header>

        <main className="forgot-card">
          {!isSuccess ? (
            <>
              <div className="forgot-info">
                <div className="icon-stack" aria-hidden="true">
                  <span className="icon-orbit"></span>
                  <Mail className="icon-main" size={38} />
                  <Lock className="icon-lock" size={18} />
                </div>
                <p>
                  Enter your email address and we'll send you instructions to
                  reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="reset-form-group">
                  <label htmlFor="email" className="reset-form-label">
                    Email Address
                  </label>
                  <div className="reset-input-wrapper">
                    <Mail size={18} className="reset-input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      onBlur={() => setTouched(true)}
                      placeholder="your.email@example.com"
                      className="reset-form-input"
                      autoComplete="email"
                      aria-invalid={showEmailError}
                      aria-describedby="email-help"
                      required
                    />
                    {isValidEmail ? (
                      <Check size={18} className="reset-input-check" />
                    ) : null}
                  </div>
                  {showEmailError ? (
                    <p className="reset-input-error" id="email-help">
                      Please enter a valid email address.
                    </p>
                  ) : (
                    <p className="reset-input-hint" id="email-help">
                      We'll send reset instructions to this email.
                    </p>
                  )}
                </div>

                {error && <div className="reset-form-error">{error}</div>}

                <button
                  type="submit"
                  className="reset-primary-button"
                  disabled={!isValidEmail || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="spinner" size={18} />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <div className="forgot-footer">
                <span>Remember your password?</span>
                <button
                  type="button"
                  className="reset-text-link"
                  onClick={handleSignIn}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="reset-text-link"
                  onClick={handleHome}
                >
                  Home
                </button>
              </div>
            </>
          ) : (
            <div className="success-state">
              <div className="icon-stack success" aria-hidden="true">
                <CheckCircle2 size={48} />
              </div>
              <h2>Check your email</h2>
              <p>
                We've sent password reset instructions to{" "}
                <span className="success-email">{trimmedEmail}</span>.
              </p>

              {error && <div className="reset-form-error">{error}</div>}

              <button
                type="button"
                className={`reset-text-link resend-link ${
                  resendCountdown > 0 ? "disabled" : ""
                }`}
                onClick={handleResend}
                disabled={resendCountdown > 0 || isLoading}
              >
                Didn't receive email? <span>{resendLabel}</span>
              </button>

              <button
                type="button"
                className="reset-secondary-button"
                onClick={handleSignIn}
              >
                Back to Sign In
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResetPassword;
