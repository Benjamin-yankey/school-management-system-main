import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import Navbar from "../components/Navbar";
import api from "../lib/api";
import { 
  User, Settings, CreditCard, Users, Mail, Lock, 
  Camera, Check, Shield, Plus, MoreHorizontal, FileText, ArrowUpRight,
  Loader2, AlertCircle
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
  const navigate = useNavigate();
  
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

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "account", "billing", "team"].includes(tab)) {
      setActiveTab(tab);
    }
    fetchProfile();
  }, [searchParams]);

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
        password: "TemporaryPassword123!" // Typically system generated
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
    })
  });

  const s = getStyle(isDark);

  const TABS = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "account", label: "Account Settings", icon: Settings },
    { id: "billing", label: "Billing & Plans", icon: CreditCard },
    { id: "team", label: "Team & Members", icon: Users }
  ];

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

        </div>
      </div>
    </div>
  );
}
