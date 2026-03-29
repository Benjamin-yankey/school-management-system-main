import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../lib/api";
import "./ResetPassword.css";

const ForceResetPassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const isNewValid = newPassword.length >= 8;
  const isConfirmValid = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = currentPassword.length > 0 && isNewValid && isConfirmValid && !isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await api.forceResetPassword(currentPassword, newPassword);
      // Sign out and redirect to sign in with success notice
      logout();
      navigate("/signin", {
        state: { message: "Password updated successfully. Please sign in with your new password." },
      });
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-shell">
        <header className="forgot-topbar" style={{ gridTemplateColumns: "1fr" }}>
          <h1 style={{ textAlign: "center" }}>Set Your Password</h1>
        </header>

        <main className="forgot-card">
          {/* Warning banner */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.75rem",
              background: "rgba(255, 180, 0, 0.08)",
              border: "1px solid rgba(255, 180, 0, 0.3)",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1.75rem",
            }}
          >
            <ShieldAlert size={20} style={{ color: "#f59e0b", flexShrink: 0, marginTop: "1px" }} />
            <p style={{ margin: 0, color: "#fbbf24", fontSize: "0.88rem", lineHeight: 1.5 }}>
              Your account was created with a temporary password. You must set a new password before continuing.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Current (temp) password */}
            <div className="reset-form-group">
              <label className="reset-form-label" htmlFor="force-current-pw">
                Temporary Password (from email)
              </label>
              <div className="reset-input-wrapper">
                <KeyRound size={18} className="reset-input-icon" />
                <input
                  id="force-current-pw"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setError(""); }}
                  placeholder="Enter the temporary password"
                  className="reset-form-input"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}
                  aria-label={showCurrent ? "Hide" : "Show"}
                >
                  {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="reset-input-hint">Use the temp password sent to your email.</p>
            </div>

            {/* New password */}
            <div className="reset-form-group">
              <label className="reset-form-label" htmlFor="force-new-pw">
                New Password
              </label>
              <div className="reset-input-wrapper">
                <KeyRound size={18} className="reset-input-icon" />
                <input
                  id="force-new-pw"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                  placeholder="At least 8 characters"
                  className="reset-form-input"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}
                  aria-label={showNew ? "Hide" : "Show"}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPassword.length > 0 && !isNewValid && (
                <p className="reset-input-error">Password must be at least 8 characters.</p>
              )}
            </div>

            {/* Confirm new password */}
            <div className="reset-form-group">
              <label className="reset-form-label" htmlFor="force-confirm-pw">
                Confirm New Password
              </label>
              <div className="reset-input-wrapper">
                <KeyRound size={18} className="reset-input-icon" />
                <input
                  id="force-confirm-pw"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                  placeholder="Repeat your new password"
                  className="reset-form-input"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }}
                  aria-label={showConfirm ? "Hide" : "Show"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword.length > 0 && !isConfirmValid && (
                <p className="reset-input-error">Passwords do not match.</p>
              )}
            </div>

            {error && <div className="reset-form-error">{error}</div>}

            <button
              type="submit"
              className="reset-primary-button"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="spinner" size={18} />
                  Updating...
                </>
              ) : (
                "Set New Password"
              )}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default ForceResetPassword;
