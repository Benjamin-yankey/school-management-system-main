import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { 
  User, Settings, CreditCard, Users, Mail, Lock, 
  Camera, Check, Shield, Plus, MoreHorizontal, FileText, ArrowUpRight,
  Loader2, AlertCircle, Bell, Palette, Globe, Eye, Fingerprint, 
  Link as LinkIcon, History, LogOut, Monitor, Trash2, Smartphone, Key
} from "lucide-react";

const C = {
  purple600: "#5b2d8e",
  purple500: "#7c3aed",
  purple100: "#ede9fe",
  purple50:  "#f5f3ff",
  blue600:   "#2563eb",
  blue500:   "#3b82f6",
  blue50:    "#eff6ff",
  gray50:    "#f9fafb",
  gray100:   "#f3f4f6",
  gray200:   "#e5e7eb",
  gray400:   "#9ca3af",
  gray600:   "#4b5563",
  gray800:   "#1f2937",
  gray900:   "#111827",
  red500:    "#ef4444",
  green500:  "#10b981",
  white:     "#ffffff"
};

export default function AccountPage() {
  const auth = useAuth();
  const authUser = auth.user;
  const { isDarkMode: isDark } = useTheme();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile State
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
    email: "",
    role: ""
  });
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingLoading, setBillingLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Account Settings State
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  // Team State
  const [team, setTeam] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "teacher"
  });

  // New Tabs State
  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    browserNotifs: false,
    weeklyReport: true,
    loginAlerts: true
  });
  const [appearance, setAppearance] = useState({
    theme: "light",
    density: "comfortable",
    fontSize: "medium"
  });
  const [region, setRegion] = useState({
    language: "english",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY"
  });
  const [access, setAccess] = useState({
    reduceMotion: false,
    highContrast: false,
    screenReader: false
  });
  const [twoFactor, setTwoFactor] = useState(false);

  const TABS = useMemo(() => [
    { id: "profile", label: "My Profile", icon: User },
    { id: "account", label: "Account Settings", icon: Settings },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
    { id: "team", label: "Team & Members", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "language", label: "Language & Region", icon: Globe },
    { id: "accessibility", label: "Accessibility", icon: Eye },
    { id: "security", label: "Privacy & Security", icon: Fingerprint },
    { id: "apps", label: "Connected Apps", icon: LinkIcon },
    { id: "activity", label: "Activity Log", icon: History }
  ], []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
    fetchProfile();
  }, [searchParams, TABS]);

  useEffect(() => {
    if (activeTab === "team" && (authUser?.role === "administration" || authUser?.role === "superadmin")) {
      fetchTeam();
    }
    if (activeTab === "billing") {
      fetchBilling();
    }
  }, [activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getProfile();
      setProfile({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        bio: data.bio || "",
        phone: data.phone || "",
        email: data.email || "",
        role: data.role || ""
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      setTeamLoading(true);
      const data = await api.getAdministrationUsers();
      setTeam(data);
    } catch (err) {
      console.error("Failed to fetch team:", err);
    } finally {
      setTeamLoading(false);
    }
  };

  const fetchBilling = async () => {
    if (authUser?.role !== "administration" && authUser?.role !== "superadmin") return;
    try {
      setBillingLoading(true);
      const data = await api.getMyBilling();
      setBillingData(data);
    } catch (err) {
      console.error("Failed to fetch billing:", err);
    } finally {
      setBillingLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.createSchoolUser({
        email: inviteData.email,
        firstName: inviteData.firstName,
        lastName: inviteData.lastName,
        role: inviteData.role,
        password: "TemporaryPassword123!" 
      });
      setMessage({ type: "success", text: `Invitation sent to ${inviteData.email}` });
      setShowInviteModal(false);
      setInviteData({ email: "", firstName: "", lastName: "", role: "teacher" });
      fetchTeam();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to send invitation" });
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ type: "", text: "" });
      const updates = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio,
        phone: profile.phone
      };
      
      const result = await auth.updateProfile(updates);
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }
    try {
      setSaving(true);
      await api.changePassword(passwords.current, passwords.new);
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to change password" });
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setMessage({ type: "", text: "" });
  };

  const getStyle = (isDark) => ({
    page: {
      minHeight: "100vh",
      background: isDark ? "#0b0f19" : C.gray50,
      color: isDark ? C.gray100 : C.gray900,
      fontFamily: "'Inter', sans-serif"
    },
    container: {
      maxWidth: 1100,
      margin: "0 auto",
      padding: "2rem 1.5rem",
      display: "flex",
      gap: "2.5rem",
      flexDirection: "row"
    },
    sidebar: {
      flex: "0 0 240px"
    },
    pageTitle: {
      fontSize: 24,
      fontWeight: 800,
      marginBottom: "1.5rem",
      color: isDark ? C.white : C.gray900
    },
    navItem: (isActive) => ({
      display: "flex",
      alignItems: "center",
      gap: "12px",
      width: "100%",
      background: isActive ? (isDark ? C.gray800 : C.white) : "transparent",
      color: isActive ? (isDark ? C.white : C.purple600) : (isDark ? C.gray400 : C.gray600),
      padding: "10px 14px",
      borderRadius: 8,
      border: "none",
      cursor: "pointer",
      fontWeight: isActive ? 600 : 500,
      fontSize: 14,
      textAlign: "left",
      transition: "all 0.2s",
      boxShadow: isActive && !isDark ? "0 1px 3px rgba(0,0,0,0.05)" : "none",
      marginBottom: 4
    }),
    contentArea: {
      flex: 1,
      minWidth: 0
    },
    panel: {
      background: isDark ? C.gray900 : C.white,
      borderRadius: 16,
      border: `1px solid ${isDark ? C.gray800 : C.gray200}`,
      padding: "2rem",
      boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(0,0,0,0.03)",
      position: "relative"
    },
    panelTitle: {
      fontSize: 20,
      fontWeight: 700,
      color: isDark ? C.white : C.gray900,
      marginBottom: "0.5rem"
    },
    panelDesc: {
      fontSize: 14,
      color: isDark ? C.gray400 : C.gray500,
      marginBottom: "2rem"
    },
    fieldGroup: {
      marginBottom: "1.5rem"
    },
    label: {
      display: "block",
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? C.gray300 : C.gray600,
      marginBottom: 6
    },
    input: {
      width: "100%",
      background: isDark ? C.gray800 : "#fcfcfc",
      border: `1px solid ${isDark ? "#374151" : C.gray200}`,
      color: isDark ? C.white : C.gray900,
      padding: "10px 14px",
      borderRadius: 8,
      fontSize: 14,
      transition: "border-color 0.2s",
      outline: "none"
    },
    btnPrimary: {
      background: C.purple600,
      color: C.white,
      border: "none",
      padding: "10px 20px",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "background 0.2s",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px"
    },
    btnSecondary: {
      background: isDark ? C.gray800 : C.white,
      color: isDark ? C.gray100 : C.gray600,
      border: `1px solid ${isDark ? C.gray600 : C.gray300}`,
      padding: "10px 20px",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s"
    },
    divider: {
      height: 1,
      background: isDark ? C.gray800 : C.gray100,
      margin: "2rem 0"
    },
    alert: (type) => ({
      padding: "12px 16px",
      borderRadius: 8,
      marginBottom: "1.5rem",
      fontSize: 14,
      display: "flex",
      alignItems: "center",
      gap: "10px",
      background: type === "success" ? (isDark ? "rgba(16, 185, 129, 0.1)" : "#ecfdf5") : (isDark ? "rgba(239, 68, 68, 0.1)" : "#fef2f2"),
      color: type === "success" ? C.green500 : C.red500,
      border: `1px solid ${type === "success" ? (isDark ? "rgba(16, 185, 129, 0.2)" : "#d1fae5") : (isDark ? "rgba(239, 68, 68, 0.2)" : "#fee2e2")}`
    }),
    switch: (enabled) => ({
      width: 40,
      height: 20,
      borderRadius: 10,
      background: enabled ? C.purple600 : (isDark ? C.gray700 : C.gray200),
      position: "relative",
      cursor: "pointer",
      transition: "background 0.2s"
    }),
    switchThumb: (enabled) => ({
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: C.white,
      position: "absolute",
      top: 2,
      left: enabled ? 22 : 2,
      transition: "left 0.2s"
    }),
    card: {
      border: `1px solid ${isDark ? C.gray800 : C.gray200}`,
      borderRadius: 12,
      padding: "1rem",
      marginBottom: "1rem"
    }
  });

  const s = getStyle(isDark);

  if (loading) {
    return (
      <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" size={48} color={C.purple600} />
      </div>
    );
  }

  return (
    <div style={s.page}>
      <Navbar />
      <style>{`
        .account-nav-btn:hover {
          background: ${isDark ? C.gray800 : C.gray100} !important;
        }
        .account-input:focus {
          border-color: ${C.purple500} !important;
          box-shadow: 0 0 0 3px ${isDark ? "rgb(124, 58, 237, 0.2)" : "rgba(124, 58, 237, 0.1)"};
        }
        .btn-prim:hover:not(:disabled) {
          background: ${C.purple500} !important;
        }
        .btn-prim:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .btn-sec:hover {
          background: ${isDark ? C.gray700 : C.gray50} !important;
        }
        @media (max-width: 768px) {
          .account-container { flex-direction: column !important; }
          .account-sidebar { flex: none !important; width: 100%; display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem; }
          .account-sidebar button { width: auto !important; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={s.container} className="account-container">
        
        {/* Sidebar */}
        <div style={s.sidebar} className="account-sidebar">
          <h1 style={s.pageTitle}>Account</h1>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {TABS.map(t => (
              <button 
                key={t.id} 
                className="account-nav-btn"
                style={s.navItem(activeTab === t.id)}
                onClick={() => handleTabChange(t.id)}
              >
                <t.icon size={18} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div style={s.contentArea}>
          
          {message.text && (
            <div style={s.alert(message.type)}>
              {message.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div style={s.panel}>
              <h2 style={s.panelTitle}>My Profile</h2>
              <p style={s.panelDesc}>Update your personal details and public profile information.</p>
              
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
                <div style={{ 
                  width: 80, height: 80, borderRadius: "50%", 
                  background: `linear-gradient(135deg, ${C.purple500}, ${C.blue500})`,
                  color: C.white, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, fontWeight: 700, position: "relative"
                }}>
                  {profile.firstName ? profile.firstName[0].toUpperCase() : (authUser?.name ? authUser.name[0].toUpperCase() : "U")}
                  <button style={{
                    position: "absolute", bottom: -5, right: -5,
                    width: 32, height: 32, borderRadius: "50%",
                    background: isDark ? C.gray700 : C.white,
                    border: `1px solid ${isDark ? C.gray600 : C.gray200}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: isDark ? C.gray200 : C.gray600
                  }}>
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.white : C.gray900, marginBottom: 4 }}>Profile Photo</h3>
                  <p style={{ fontSize: 13, color: isDark ? C.gray400 : C.gray500 }}>JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>First Name</label>
                    <input 
                      className="account-input" 
                      style={s.input} 
                      value={profile.firstName} 
                      onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>Last Name</label>
                    <input 
                      className="account-input" 
                      style={s.input} 
                      value={profile.lastName} 
                      onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div style={s.fieldGroup}>
                  <label style={s.label}>Bio</label>
                  <textarea 
                    className="account-input" 
                    style={{ ...s.input, minHeight: 100, resize: "vertical" }} 
                    placeholder="Write a brief description about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  ></textarea>
                  <p style={{ fontSize: 12, color: isDark ? C.gray500 : C.gray400, marginTop: 6 }}>Max 400 characters.</p>
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>Phone Number</label>
                  <input 
                    className="account-input" 
                    style={s.input} 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div style={s.divider}></div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                  <button type="button" className="btn-sec" style={s.btnSecondary} onClick={fetchProfile}>Reset</button>
                  <button type="submit" className="btn-prim" style={s.btnPrimary} disabled={saving}>
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ACCOUNT SETTINGS TAB */}
          {activeTab === "account" && (
            <div style={s.panel}>
              <h2 style={s.panelTitle}>Account Settings</h2>
              <p style={s.panelDesc}>Manage your login credentials and security parameters.</p>
              
              <div style={s.fieldGroup}>
                <label style={s.label}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: 14, top: 11, color: isDark ? C.gray500 : C.gray400 }} />
                  <input className="account-input" style={{ ...s.input, paddingLeft: 38, opacity: 0.7 }} value={profile.email} disabled />
                </div>
                <p style={{ fontSize: 12, color: isDark ? C.gray500 : C.gray400, marginTop: 6 }}>Contact support to change your email address.</p>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Role</label>
                <div style={{ position: "relative" }}>
                  <Shield size={16} style={{ position: "absolute", left: 14, top: 11, color: isDark ? C.gray500 : C.gray400 }} />
                  <input className="account-input" style={{ ...s.input, paddingLeft: 38, opacity: 0.7, textTransform: "capitalize" }} value={profile.role} disabled />
                </div>
              </div>

              <div style={s.divider}></div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.white : C.gray900, marginBottom: "1rem" }}>Change Password</h3>

              <form onSubmit={handlePasswordChange}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>Current Password</label>
                  <input 
                    type="password"
                    className="account-input" 
                    style={s.input}
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem" }}>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>New Password</label>
                    <input 
                      type="password"
                      className="account-input" 
                      style={s.input}
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>Confirm New Password</label>
                    <input 
                      type="password"
                      className="account-input" 
                      style={s.input}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="btn-prim" style={s.btnPrimary} disabled={saving}>
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Update Password
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === "billing" && (
            <div style={s.panel}>
              <h2 style={s.panelTitle}>Billing & Plans</h2>
              <p style={s.panelDesc}>Manage your current subscription plan and billing cycle.</p>
              
              {billingLoading && !billingData ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                  <Loader2 className="animate-spin" size={32} color={C.purple600} />
                </div>
              ) : billingData ? (
                <>
                  <div style={{ 
                    background: `linear-gradient(135deg, ${isDark ? "#2d1b4e" : C.purple50}, ${isDark ? "#17203b" : C.blue50})`, 
                    borderRadius: 12, padding: "1.5rem", marginBottom: "2rem",
                    border: `1px solid ${isDark ? "#432874" : C.purple100}`
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                      <div>
                        <span style={{ 
                          background: isDark ? C.purple600 : C.purple100, color: isDark ? C.white : C.purple600,
                          padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em"
                        }}>Current Plan</span>
                        <h3 style={{ fontSize: 24, fontWeight: 800, color: isDark ? C.white : C.purple900, marginTop: 12, marginBottom: 4 }}>{billingData.subscriptionPlan}</h3>
                        <p style={{ fontSize: 13, color: isDark ? C.gray400 : C.gray600 }}>Includes up to 50 active users.</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: isDark ? C.white : C.gray900 }}>${billingData.subscriptionAmount}<span style={{ fontSize: 14, color: isDark ? C.gray400 : C.gray500, fontWeight: 500 }}>/mo</span></div>
                        <p style={{ fontSize: 12, color: isDark ? C.gray400 : C.gray500, marginTop: 4 }}>
                          Next charge: {billingData.nextChargeDate ? new Date(billingData.nextChargeDate).toLocaleDateString() : "Nov 1, 2026"}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button className="btn-prim" style={s.btnPrimary}>Upgrade Plan</button>
                      <button className="btn-sec" style={{ ...s.btnSecondary, background: isDark ? "rgba(255,255,255,0.05)" : "transparent" }}>Cancel Subscription</button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.white : C.gray900, marginBottom: "1rem" }}>Payment Method</h3>
                  <div style={{ 
                    border: `1px solid ${isDark ? C.gray800 : C.gray200}`, borderRadius: 10, padding: "1rem", 
                    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: 44, height: 30, background: isDark ? C.gray800 : "#f0f0f0", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: isDark ? C.gray300 : C.gray500 }}>
                        {billingData.paymentMethod?.split(" ")[0]?.toUpperCase() || "VISA"}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{billingData.paymentMethod}</div>
                        <div style={{ fontSize: 12, color: isDark ? C.gray400 : C.gray500 }}>Expires 12/28</div>
                      </div>
                    </div>
                    <button style={{ background: "none", border: "none", color: C.purple500, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Edit</button>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.white : C.gray900, marginBottom: "1rem" }}>Invoicing History</h3>
                  <div style={{ borderRadius: 10, border: `1px solid ${isDark ? C.gray800 : C.gray200}`, overflow: "hidden" }}>
                    {(billingData.invoices || []).map((inv, idx) => (
                      <div key={inv.id} style={{ 
                        display: "flex", justifyContent: "space-between", alignItems: "center", 
                        padding: "12px 16px", borderBottom: idx !== (billingData.invoices.length - 1) ? `1px solid ${isDark ? C.gray800 : C.gray200}` : "none",
                        background: isDark ? C.gray900 : C.white
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <FileText size={16} color={isDark ? C.gray500 : C.gray400} />
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{inv.id}</div>
                            <div style={{ fontSize: 12, color: isDark ? C.gray400 : C.gray500 }}>{inv.date}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{inv.amount}</div>
                          <div style={{ 
                            background: isDark ? "rgba(16, 185, 129, 0.1)" : "#d1fae5", color: isDark ? C.green500 : "#065f46",
                            padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600
                          }}>{inv.status}</div>
                          <button style={{ background: "none", border: "none", color: isDark ? C.gray400 : C.gray500, cursor: "pointer" }}>
                            <ArrowUpRight size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "3rem 1rem", border: `1px dashed ${isDark ? C.gray700 : C.gray300}`, borderRadius: 12 }}>
                  <CreditCard size={48} color={isDark ? C.gray700 : C.gray300} style={{ marginBottom: "1rem" }} />
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.gray400 : C.gray600 }}>No billing information</h3>
                  <p style={{ fontSize: 14, color: isDark ? C.gray500 : C.gray400, marginTop: 4 }}>Subscription data is only available for school administrators.</p>
                </div>
              )}
            </div>
          )}

          {/* TEAM TAB */}
          {activeTab === "team" && (
            <div style={s.panel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                  <h2 style={s.panelTitle}>Team & Members</h2>
                  <p style={{ ...s.panelDesc, margin: 0 }}>Manage access, roles, and invite new members.</p>
                </div>
                {(authUser?.role === "administration" || authUser?.role === "superadmin") && (
                  <button 
                    className="btn-prim" 
                    style={{ ...s.btnPrimary, display: "flex", alignItems: "center", gap: 6 }}
                    onClick={() => setShowInviteModal(true)}
                  >
                    <Plus size={16} /> Invite Member
                  </button>
                )}
              </div>

              {/* Invite Modal */}
              {showInviteModal && (
                <div style={{
                  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                  background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
                  zIndex: 1000, padding: "1rem"
                }}>
                  <div style={{ 
                    ...s.panel, width: "100%", maxWidth: 500, 
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)" 
                  }}>
                    <h2 style={s.panelTitle}>Invite New Member</h2>
                    <p style={s.panelDesc}>Send an invitation to join your school administration team.</p>
                    
                    <form onSubmit={handleInvite}>
                      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                        <div style={{ flex: 1 }}>
                          <label style={s.label}>First Name</label>
                          <input 
                            className="account-input" 
                            style={s.input} 
                            required 
                            value={inviteData.firstName}
                            onChange={(e) => setInviteData({...inviteData, firstName: e.target.value})}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={s.label}>Last Name</label>
                          <input 
                            className="account-input" 
                            style={s.input} 
                            required 
                            value={inviteData.lastName}
                            onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})}
                          />
                        </div>
                      </div>
                      <div style={s.fieldGroup}>
                        <label style={s.label}>Email Address</label>
                        <input 
                          type="email" 
                          className="account-input" 
                          style={s.input} 
                          required 
                          placeholder="member@school.com"
                          value={inviteData.email}
                          onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                        />
                      </div>
                      <div style={s.fieldGroup}>
                        <label style={s.label}>Role</label>
                        <select 
                          className="account-input" 
                          style={s.input}
                          value={inviteData.role}
                          onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
                        >
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                          <option value="administration">Administration Staff</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                        <button type="button" className="btn-sec" style={s.btnSecondary} onClick={() => setShowInviteModal(false)}>Cancel</button>
                        <button type="submit" className="btn-prim" style={s.btnPrimary} disabled={saving}>
                          {saving && <Loader2 size={16} className="animate-spin" />}
                          Send Invitation
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {teamLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                  <Loader2 className="animate-spin" size={32} color={C.purple600} />
                </div>
              ) : team.length > 0 ? (
                <>
                  <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    <input className="account-input" style={{ ...s.input, flex: 1 }} placeholder="Search by name or email..." />
                    <select className="account-input" style={{ ...s.input, width: 140 }}>
                      <option>All Roles</option>
                      <option>Admin</option>
                      <option>Member</option>
                    </select>
                  </div>

                  <div style={{ borderRadius: 10, border: `1px solid ${isDark ? C.gray800 : C.gray200}`, overflow: "hidden" }}>
                    {team.map((tUser, idx) => (
                      <div key={idx} style={{ 
                        display: "flex", justifyContent: "space-between", alignItems: "center", 
                        padding: "16px", borderBottom: idx !== team.length - 1 ? `1px solid ${isDark ? C.gray800 : C.gray200}` : "none",
                        background: isDark ? C.gray900 : C.white
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <div style={{ 
                            width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue500}, ${C.purple500})`,
                            display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 600, fontSize: 13
                          }}>
                            {tUser.firstName ? tUser.firstName[0] : (tUser.name ? tUser.name[0] : tUser.email[0].toUpperCase())}
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900, display: "flex", alignItems: "center", gap: 8 }}>
                              {tUser.firstName} {tUser.lastName}
                              {!tUser.isActive && <span style={{ fontSize: 10, padding: "2px 6px", background: isDark ? C.gray800 : C.gray100, color: isDark ? C.gray400 : C.gray500, borderRadius: 10 }}>Inactive</span>}
                            </div>
                            <div style={{ fontSize: 12, color: isDark ? C.gray400 : C.gray500 }}>{tUser.email}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                          <span style={{ fontSize: 13, color: isDark ? C.gray300 : C.gray600, textTransform: "capitalize" }}>{tUser.role}</span>
                          <div style={{ position: "relative" }}>
                             <button style={{ background: "none", border: "none", color: isDark ? C.gray500 : C.gray400, cursor: "pointer" }}>
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "3rem 1rem", border: `1px dashed ${isDark ? C.gray700 : C.gray300}`, borderRadius: 12 }}>
                  <Users size={48} color={isDark ? C.gray700 : C.gray300} style={{ marginBottom: "1rem" }} />
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.gray400 : C.gray600 }}>No team members found</h3>
                  <p style={{ fontSize: 14, color: isDark ? C.gray500 : C.gray400, marginTop: 4 }}>You don't have access to view team members or none are assigned.</p>
                </div>
              )}

            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div style={s.panel}>
              <h2 style={s.panelTitle}>Notifications</h2>
              <p style={s.panelDesc}>Manage how you receive alerts, emails, and reminders.</p>
              
              <div style={s.fieldGroup}>
                {[
                  { id: "emailAlerts", label: "Email Notifications", desc: "Receive email updates about account activity and security.", icon: Mail },
                  { id: "browserNotifs", label: "Browser Notifications", desc: "Get real-time alerts on your desktop even when the app is closed.", icon: Monitor },
                  { id: "weeklyReport", label: "Weekly Digest", desc: "A summary of your school's performance and activity once a week.", icon: FileText },
                  { id: "loginAlerts", label: "Login Alerts", desc: "Get notified whenever someone logs into your account from a new device.", icon: Shield }
                ].map(item => (
                  <div key={item.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? C.gray800 : C.gray100, display: "flex", alignItems: "center", justifyContent: "center", color: C.purple600 }}>
                        <item.icon size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: isDark ? C.gray400 : C.gray500 }}>{item.desc}</div>
                      </div>
                    </div>
                    <div style={s.switch(notifs[item.id])} onClick={() => setNotifs({...notifs, [item.id]: !notifs[item.id]})}>
                      <div style={s.switchThumb(notifs[item.id])}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === "appearance" && (
            <div style={s.panel}>
              <h2 style={s.panelTitle}>Appearance</h2>
              <p style={s.panelDesc}>Customize the visual look and feel of your dashboard.</p>
              
              <div style={s.fieldGroup}>
                <label style={s.label}>Theme Preference</label>
                <div style={{ display: "flex", gap: "1rem" }}>
                  {[
                    { id: "light", label: "Light", icon: Palette },
                    { id: "dark", label: "Dark", icon: Monitor },
                    { id: "system", label: "System", icon: Settings }
                  ].map(t => (
                    <button 
                      key={t.id}
                      style={{ 
                        flex: 1, padding: "1rem", borderRadius: 12, border: `2px solid ${appearance.theme === t.id ? C.purple600 : (isDark ? C.gray800 : C.gray200)}`,
                        background: appearance.theme === t.id ? (isDark ? "rgba(91, 45, 142, 0.1)" : C.purple50) : "transparent",
                        cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.2s"
                      }}
                      onClick={() => setAppearance({...appearance, theme: t.id})}
                    >
                      <t.icon size={24} color={appearance.theme === t.id ? C.purple600 : (isDark ? C.gray400 : C.gray500)} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: appearance.theme === t.id ? C.purple600 : (isDark ? C.gray200 : C.gray700) }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Interface Density</label>
                <select 
                  style={s.input} 
                  value={appearance.density} 
                  onChange={(e) => setAppearance({...appearance, density: e.target.value})}
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="compact">Compact</option>
                </select>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Font Size</label>
                <input 
                  type="range" min="1" max="3" step="1" 
                  style={{ width: "100%", accentColor: C.purple600 }} 
                  value={appearance.fontSize === "small" ? 1 : appearance.fontSize === "medium" ? 2 : 3}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setAppearance({...appearance, fontSize: val === 1 ? "small" : val === 2 ? "medium" : "large"});
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: C.gray500 }}>
                  <span>Small</span>
                  <span>Medium</span>
                  <span>Large</span>
                </div>
              </div>
            </div>
          )}

          {/* LANGUAGE TAB */}
          {activeTab === "language" && (
            <div style={s.panel}>
              <h2 style={s.panelTitle}>Language & Region</h2>
              <p style={s.panelDesc}>Configure your preferred language, timezone, and date formats.</p>
              
              <div style={s.fieldGroup}>
                <label style={s.label}>Primary Language</label>
                <div style={{ position: "relative" }}>
                  <Globe size={16} style={{ position: "absolute", left: 14, top: 11, color: isDark ? C.gray500 : C.gray400 }} />
                  <select 
                    style={{ ...s.input, paddingLeft: 38 }} 
                    value={region.language}
                    onChange={(e) => setRegion({...region, language: e.target.value})}
                  >
                    <option value="english">English (US)</option>
                    <option value="spanish">Español</option>
                    <option value="french">Français</option>
                    <option value="german">Deutsch</option>
                  </select>
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Timezone</label>
                <select 
                  style={s.input} 
                  value={region.timezone}
                  onChange={(e) => setRegion({...region, timezone: e.target.value})}
                >
                  <option value="UTC">UTC (Greenwich Mean Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                </select>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Date Format</label>
                <select 
                  style={s.input} 
                  value={region.dateFormat}
                  onChange={(e) => setRegion({...region, dateFormat: e.target.value})}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2026)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-12-31)</option>
                </select>
              </div>
            </div>
          )}

          {/* ACCESSIBILITY TAB */}
          {activeTab === "accessibility" && (
            <div style={s.panel}>
              <h2 style={s.panelTitle}>Accessibility</h2>
              <p style={s.panelDesc}>Enhance your experience with inclusive features and settings.</p>
              
              <div style={s.fieldGroup}>
                {[
                  { id: "reduceMotion", label: "Reduce Motion", desc: "Minimize animations and transitions for a smoother experience.", icon: Smartphone },
                  { id: "highContrast", label: "High Contrast", desc: "Increase the contrast between text and background colors.", icon: Eye },
                  { id: "screenReader", label: "Screen Reader Support", desc: "Enable optimized markup and labels for assistive technologies.", icon: Monitor }
                ].map(item => (
                  <div key={item.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? C.gray800 : C.gray100, display: "flex", alignItems: "center", justifyContent: "center", color: C.purple600 }}>
                        <item.icon size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: isDark ? C.gray400 : C.gray500 }}>{item.desc}</div>
                      </div>
                    </div>
                    <div style={s.switch(access[item.id])} onClick={() => setAccess({...access, [item.id]: !access[item.id]})}>
                      <div style={s.switchThumb(access[item.id])}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRIVACY & SECURITY TAB */}
          {activeTab === "security" && (
            <div style={s.panel}>
              <h2 style={s.panelTitle}>Privacy & Security</h2>
              <p style={s.panelDesc}>Manage your login security and control how your data is used.</p>
              
              <div style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? "rgba(124, 58, 237, 0.1)" : C.purple50, display: "flex", alignItems: "center", justifyContent: "center", color: C.purple600 }}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>Two-Factor Authentication (2FA)</div>
                    <div style={{ fontSize: 12, color: isDark ? C.gray400 : C.gray500 }}>Add an extra layer of security to your account.</div>
                  </div>
                </div>
                <button 
                  style={twoFactor ? s.btnSecondary : s.btnPrimary}
                  onClick={() => setTwoFactor(!twoFactor)}
                >
                  {twoFactor ? "Disable" : "Enable"}
                </button>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, color: isDark ? C.white : C.gray900, marginBottom: "1rem" }}>Active Sessions</h3>
              <div style={{ borderRadius: 10, border: `1px solid ${isDark ? C.gray800 : C.gray200}`, overflow: "hidden", marginBottom: "2rem" }}>
                {[
                  { device: "MacBook Pro 14\"", location: "Accra, GH", current: true, time: "Now" },
                  { device: "iPhone 15 Pro", location: "Lagos, NG", current: false, time: "2 hours ago" }
                ].map((session, idx) => (
                  <div key={idx} style={{ 
                    display: "flex", justifyContent: "space-between", alignItems: "center", 
                    padding: "12px 16px", borderBottom: idx === 0 ? `1px solid ${isDark ? C.gray800 : C.gray200}` : "none",
                    background: isDark ? C.gray900 : C.white
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <Monitor size={16} color={isDark ? C.gray500 : C.gray400} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>
                          {session.device} {session.current && <span style={{ color: C.green500, fontSize: 11, marginLeft: 8 }}>(Current)</span>}
                        </div>
                        <div style={{ fontSize: 12, color: isDark ? C.gray400 : C.gray500 }}>{session.location} • {session.time}</div>
                      </div>
                    </div>
                    {!session.current && <button style={{ background: "none", border: "none", color: C.red500, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Revoke</button>}
                  </div>
                ))}
              </div>

              <div style={{ ...s.card, borderColor: isDark ? "#451a1a" : "#fee2e2", background: isDark ? "rgba(220, 38, 38, 0.05)" : "#fef2f2" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.red500, marginBottom: 8 }}>Danger Zone</h3>
                <p style={{ fontSize: 13, color: isDark ? C.gray400 : C.gray600, marginBottom: "1rem" }}>Once you delete your account, there is no going back. Please be certain.</p>
                <button style={{ ...s.btnSecondary, borderColor: C.red500, color: C.red500, background: "transparent" }}>Delete Account</button>
              </div>
            </div>
          )}

          {/* CONNECTED APPS TAB */}
          {activeTab === "apps" && (
            <div style={s.panel}>
              <h2 style={s.panelTitle}>Connected Apps</h2>
              <p style={s.panelDesc}>Manage third-party integrations and application access.</p>
              
              <div style={s.fieldGroup}>
                {[
                  { id: "google", label: "Google", desc: "Calendar, Meet and Drive integration.", icon: Globe },
                  { id: "slack", label: "Slack", desc: "Receive notifications and alerts in Slack.", icon: Bell },
                  { id: "zoom", label: "Zoom", desc: "Schedule and join virtual classrooms.", icon: Monitor }
                ].map(app => (
                  <div key={app.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: isDark ? C.gray800 : C.gray100, display: "flex", alignItems: "center", justifyContent: "center", color: C.purple600 }}>
                        <app.icon size={20} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{app.label}</div>
                        <div style={{ fontSize: 12, color: isDark ? C.gray400 : C.gray500 }}>{app.desc}</div>
                      </div>
                    </div>
                    <button style={s.btnSecondary}>Connect</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVITY LOG TAB */}
          {activeTab === "activity" && (
            <div style={s.panel}>
              <h2 style={s.panelTitle}>Activity Log</h2>
              <p style={s.panelDesc}>A comprehensive record of your account activity and login history.</p>
              
              <div style={{ borderRadius: 10, border: `1px solid ${isDark ? C.gray800 : C.gray200}`, overflow: "hidden" }}>
                {[
                  { action: "Profile Updated", details: "Changed display name and phone number", time: "Oct 24, 2026, 10:45 AM", icon: User },
                  { action: "Login Success", details: "Signed in from Chrome on macOS", time: "Oct 24, 2026, 09:12 AM", icon: LogOut },
                  { action: "Password Changed", details: "Security credentials updated successfully", time: "Oct 20, 2026, 02:30 PM", icon: Lock },
                  { action: "Billing Updated", details: "Subscription renewed for Enterprise Pro", time: "Oct 01, 2026, 12:00 AM", icon: CreditCard }
                ].map((item, idx) => (
                  <div key={idx} style={{ 
                    display: "flex", gap: "1rem", 
                    padding: "16px", borderBottom: idx !== 3 ? `1px solid ${isDark ? C.gray800 : C.gray200}` : "none",
                    background: isDark ? C.gray900 : C.white
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: isDark ? C.gray800 : C.gray100, display: "flex", alignItems: "center", justifyContent: "center", color: isDark ? C.gray400 : C.gray600 }}>
                      <item.icon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? C.white : C.gray900 }}>{item.action}</span>
                        <span style={{ fontSize: 12, color: isDark ? C.gray500 : C.gray400 }}>{item.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: isDark ? C.gray400 : C.gray500 }}>{item.details}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
