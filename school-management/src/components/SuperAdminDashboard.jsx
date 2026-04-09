import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { 
  Building2, Users, GraduationCap, DollarSign, Activity, 
  Plus, Search, Filter, MoreHorizontal, ShieldCheck,
  TrendingUp, Calendar, AlertCircle, CheckCircle2, ChevronRight,
  ArrowLeft, Mail, Trash2, UserPlus, UserCog, GraduationCap as StudentIcon,
  Heart, Menu, X, Bell, CreditCard, Zap, BarChart3, ArrowUpRight, ToggleLeft, ToggleRight
} from "lucide-react";
import { useEnrollmentStatus } from "../hooks/useEnrollmentStatus";
import "./SuperAdminDashboard.css";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, subValue, icon: Icon, color, trend }) => (
  <div className="super-stat-card">
    <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15`, color }}>
      <Icon size={24} />
    </div>
    <div className="stat-details">
      <h3>{value || '0'}</h3>
      <p>{title}</p>
      {trend && (
        <span className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '+' : ''}{trend}% this month
        </span>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [activeDetailTab, setActiveDetailTab] = useState("users"); // "users" or "academic"
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Global Academic Management State
  const [acadSchoolId, setAcadSchoolId] = useState("");
  const [acadTeachers, setAcadTeachers] = useState([]);
  const [acadLoading, setAcadLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [stats, setStats] = useState({
    schools: 0,
    students: 0,
    teachers: 0,
    revenue: 0,
    health: 100
  });
  const [alerts, setAlerts] = useState([]);
  
  const { isEnrollmentOpen, toggleEnrollmentStatus } = useEnrollmentStatus();

  // Onboarding states
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState("");
  const [schoolId, setCreatedSchoolId] = useState("");
  const [formData, setFormData] = useState({
    name: "", location: "", principalName: "",
    adminEmail: "", adminPassword: "", adminName: ""
  });
  const [searchTerm, setSearchTerm] = useState("");

  // School Deep Dive
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schoolUsers, setSchoolUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userFormData, setUserFormData] = useState({
    email: "", role: "teacher", firstName: "", lastName: "", middleName: ""
  });

  // Global Users State
  const [globalUsers, setGlobalUsers] = useState([]);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [userFilterRole, setUserFilterRole] = useState("all");
  const [loadingGlobalUsers, setLoadingGlobalUsers] = useState(false);

  useEffect(() => {
    fetchGlobalData();
    if (activeTab === 'academic') {
      fetchAcademicData();
    }
    if (activeTab === 'users') {
      fetchGlobalUsers();
    }
  }, [selectedSchool, activeTab]); // Re-fetch on select, clear or tab change

  const fetchGlobalUsers = async () => {
    setLoadingGlobalUsers(true);
    try {
      const data = await api.getGlobalUsers();
      const normalizedData = (Array.isArray(data) ? data : []).map(u => {
        const r = u.role?.toLowerCase();
        return {
          ...u,
          role: (r === 'admin' || r === 'administration') ? 'administration' : r
        };
      });
      setGlobalUsers(normalizedData);
    } catch (error) {
      console.error("Failed to fetch global users:", error);
    } finally {
      setLoadingGlobalUsers(false);
    }
  };

  // Academic Management
  const [academicYears, setAcademicYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [showYearModal, setShowYearModal] = useState(false);
  const [newYearName, setNewYearName] = useState("");
  const [showTermModal, setShowTermModal] = useState(false);
  const [selectedYearForTerm, setSelectedYearForTerm] = useState(null);
  const [newTermData, setNewTermData] = useState({
    name: "", startDate: "", endDate: "", isCurrent: false
  });

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      const schoolData = await api.getSchools();
      const schoolsArr = Array.isArray(schoolData) ? schoolData : [];
      setSchools(schoolsArr);
      
      // Fetch accurate global counts from the new endpoint
      const globalStats = await api.getSuperAdminStats();
      
      setStats({
        schools: globalStats.schools || schoolsArr.length,
        students: globalStats.students || 0,
        teachers: globalStats.teachers || 0,
        administrators: globalStats.administrators || 0,
        revenue: (globalStats.schools || schoolsArr.length) * 150,
        health: 100
      });

      setAlerts([
        { id: 1, type: 'info', msg: 'System Root active. Connectivity established.', time: 'Just now' }
      ]);

      if (selectedSchool) {
        fetchSchoolUsers(selectedSchool.id);
      }
      
      // Also fetch active year for the stats
      const active = await api.getActiveAcademicYear();
      setActiveYear(active);
      
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch teachers when school is selected in global Academic Tab
  useEffect(() => {
    if (activeTab === 'academic' && acadSchoolId) {
      setAcadLoading(true);
      api.getSchoolUsers(acadSchoolId)
        .then(users => {
          setAcadTeachers(users.filter(u => u.role === 'teacher'));
        })
        .catch(err => console.error("Failed to fetch teachers for assignments:", err))
        .finally(() => setAcadLoading(false));
    }
  }, [activeTab, acadSchoolId]);

  const fetchAcademicData = async () => {
    try {
      const years = await api.getAcademicYears();
      const yearsWithTerms = await Promise.all(
        years.map(async (y) => {
          const terms = await api.getAcademicTerms(y.id);
          return { ...y, terms };
        })
      );
      setAcademicYears(yearsWithTerms);
      const active = await api.getActiveAcademicYear();
      setActiveYear(active);
    } catch (error) {
      console.error("Failed to fetch academic data:", error);
    }
  };

  const handleCreateYear = async (e) => {
    e.preventDefault();
    setOnboardLoading(true);
    try {
      await api.createAcademicYear({ year: newYearName });
      setNewYearName("");
      setShowYearModal(false);
      fetchAcademicData();
    } catch (err) {
      setOnboardError(err.message);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleActivateYear = async (yearId) => {
    try {
      await api.setActiveAcademicYear(yearId);
      fetchAcademicData();
    } catch (err) {
      console.error("Failed to activate year:", err);
    }
  };

  const handleCreateTerm = async (e) => {
    e.preventDefault();
    setOnboardLoading(true);
    try {
      await api.createAcademicTerm({
        ...newTermData,
        academicYearId: selectedYearForTerm.id
      });
      setNewTermData({ name: "", startDate: "", endDate: "", isCurrent: false });
      setShowTermModal(false);
      fetchAcademicData();
    } catch (err) {
      setOnboardError(err.message);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleActivateTerm = async (termId) => {
    try {
      await api.setActiveAcademicTerm(termId);
      fetchAcademicData();
    } catch (err) {
      console.error("Failed to activate term:", err);
    }
  };

  const handleSeedClasses = async () => {
    setOnboardLoading(true);
    try {
      await api.seedClassLevels();
      fetchAcademicData();
    } catch (err) {
      console.error("Failed to seed classes:", err);
    } finally {
      setOnboardLoading(false);
    }
  };

  const fetchSchoolUsers = async (schoolId) => {
    setLoadingUsers(true);
    try {
      const users = await api.getSchoolUsers(schoolId);
      const normalizedUsers = (Array.isArray(users) ? users : []).map(u => {
        const r = u.role?.toLowerCase();
        return {
          ...u,
          role: (r === 'admin' || r === 'administration') ? 'administration' : r
        };
      });
      setSchoolUsers(normalizedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setSchoolUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setOnboardError("");
    setOnboardLoading(true);

    try {
      if (onboardStep === 1) {
        // Step 1: Create School
        const school = await api.createSchool({
          name: formData.name,
          location: formData.location,
          principalName: formData.principalName
        });
        setCreatedSchoolId(school.id);
        setOnboardStep(2);
      } else {
        // Step 2: Create Admin for that school
        await api.createAdministration({
          email: formData.adminEmail,
          schoolId: schoolId
        });
        
        setShowOnboardModal(false);
        setOnboardStep(1);
        setFormData({ name: "", location: "", principalName: "", adminEmail: "", adminPassword: "", adminName: "" });
        fetchGlobalData();
      }
    } catch (err) {
      setOnboardError(err.message);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setOnboardLoading(true);
    try {
      if (userFormData.role === 'administration') {
        await api.createAdministration({
          email: userFormData.email,
          schoolId: selectedSchool.id
        });
      } else {
        await api.createUserForSchool(selectedSchool.id, userFormData);
      }
      setShowAddUserModal(false);
      setUserFormData({ email: "", role: "teacher", firstName: "", lastName: "", middleName: "" });
      fetchSchoolUsers(selectedSchool.id);
    } catch (err) {
      setOnboardError(err.message);
    } finally {
      setOnboardLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.deleteUser(userId);
      fetchSchoolUsers(selectedSchool.id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      if (isActive) {
        await api.deactivateUser(userId);
      } else {
        await api.activateUser(userId);
      }
      fetchGlobalUsers();
      fetchGlobalData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm("Reset this user's password? They will receive a temporary password on their next login attempt.")) return;
    try {
      await api.resetUserPassword(userId);
      alert("Password reset successfully.");
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredGlobalUsers = useMemo(() => {
    return globalUsers.filter(u => {
      const matchesSearch = 
        u.email.toLowerCase().includes(globalSearchTerm.toLowerCase()) ||
        (u.firstName + " " + u.lastName).toLowerCase().includes(globalSearchTerm.toLowerCase());
      const matchesRole = userFilterRole === "all" || u.role === userFilterRole;
      return matchesSearch && matchesRole;
    });
  }, [globalUsers, globalSearchTerm, userFilterRole]);

  const filteredSchools = useMemo(() => {
    return schools.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [schools, searchTerm]);
  
  // Finance Data Mock
  const financeStats = useMemo(() => {
    const totalSchools = schools.length;
    const mrr = totalSchools * 499; // Assume $499 average
    const arr = mrr * 12;
    return { mrr, arr, totalSchools };
  }, [schools]);

  const recentTransactions = [
    { id: "TXN001", institution: "Yram Intl", amount: 499, date: "2024-03-25", status: "paid", plan: "Enterprise" },
    { id: "TXN002", institution: "Neo Academy", amount: 299, date: "2024-03-24", status: "pending", plan: "Professional" },
    { id: "TXN003", institution: "Global High", amount: 499, date: "2024-03-22", status: "paid", plan: "Enterprise" },
    { id: "TXN004", institution: "Zenith Prep", amount: 150, date: "2024-03-20", status: "failed", plan: "Basic" },
  ];

  if (loading) {
    return (
      <div className="super-loading">
        <div className="pulse-circle"><Activity className="spinner" size={32} /></div>
        <p>Synchronizing System Nodes...</p>
      </div>
    );
  }

  return (
    <div className="super-dashboard-container">
      {/* Mobile Toggle & Overlay */}
      <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
        <Menu size={24} />
      </button>
      <div 
        className={`mobile-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      />

      {/* Side Navigation */}
      <aside className={`super-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
          <X size={24} />
        </button>
        <div className="sidebar-brand">
          <ShieldCheck size={28} />
          <div className="brand-text">
            <span>System Root</span>
            <small>v2.4.0 Stable</small>
          </div>
        </div>
        <nav className="super-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}>
            <Activity size={20} /> Dashboard
          </button>
          <button className={activeTab === 'schools' ? 'active' : ''} onClick={() => { setActiveTab('schools'); setSidebarOpen(false); }}>
            <Building2 size={20} /> Institutions
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}>
            <Users size={20} /> Identity Control
          </button>
          <button className={activeTab === 'finance' ? 'active' : ''} onClick={() => { setActiveTab('finance'); setSidebarOpen(false); }}>
            <DollarSign size={20} /> Revenue & Plans
          </button>
          <button className={activeTab === 'academic' ? 'active' : ''} onClick={() => { setActiveTab('academic'); setSidebarOpen(false); }}>
            <Calendar size={20} /> Academic Control
          </button>
          <button onClick={() => navigate("/notifications")}>
            <Bell size={20} /> Notifications
          </button>
        </nav>
        
        <div className="sidebar-footer">
          <div className="system-health">
            <div className="health-bar"><div className="health-fill" style={{width: '98%'}}/></div>
            <span>System Health: 98%</span>
          </div>
        </div>
      </aside>

      {/* Primary Content */}
      <main className="super-main-content">
        <header className="super-content-header">
          <div>
            <h1>{selectedSchool ? selectedSchool.name : (activeTab.charAt(0).toUpperCase() + activeTab.slice(1))}</h1>
            <p className="subtitle">
              {selectedSchool 
                ? `Managing users and oversight for ${selectedSchool.name}` 
                : "Real-time system oversight and school management"}
            </p>
          </div>
          <div className="header-actions">
            <button 
              className={`btn-sync ${!isEnrollmentOpen ? "closed-state" : ""}`} 
              onClick={toggleEnrollmentStatus}
              style={{
                backgroundColor: isEnrollmentOpen ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                color: isEnrollmentOpen ? "#10b981" : "#ef4444",
                borderColor: isEnrollmentOpen ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
              }}
            >
              {isEnrollmentOpen ? <ToggleRight size={18} /> : <ToggleLeft size={18} />} 
              {isEnrollmentOpen ? "Enrollment Active" : "Enrollment Closed"}
            </button>
            <button className="btn-sync" onClick={fetchGlobalData}><Activity size={16} /> Force Sync</button>
            {activeTab === 'academic' && (
              <button className="btn-primary-super" onClick={() => setShowYearModal(true)}>
                <Plus size={18} /> Create Academic Year
              </button>
            )}
            {activeTab !== 'academic' && (
              <button className="btn-primary-super" onClick={() => setShowOnboardModal(true)}>
                <Plus size={18} /> Onboard School
              </button>
            )}
          </div>
        </header>

        {activeTab === 'overview' && !selectedSchool && (
          <div className="super-view-animate">
            <div className="super-stats-row">
              <StatCard title="Total Schools" value={stats.schools} color="#3b82f6" icon={Building2} trend={stats.schools > 0 ? 12 : null} />
              <StatCard title="Global Students" value={stats.students} color="#10b981" icon={GraduationCap} trend={stats.students > 0 ? 8 : null} />
              <StatCard title="Global Teachers" value={stats.teachers} color="#8b5cf6" icon={Users} trend={stats.teachers > 0 ? 5 : null} />
              <StatCard title="Global Admins" value={stats.administrators} color="#6366f1" icon={ShieldCheck} trend={stats.administrators > 0 ? 2 : null} />
              <StatCard title="Current Session" value={activeYear?.year || "None Active"} color="#f59e0b" icon={Calendar} />
            </div>

            <div className="super-grid">
              {/* Institution Pulse */}
              <section className="super-panel schools-pulse">
                <div className="panel-header">
                  <h3>Institution Pulse</h3>
                  {schools.length > 0 && <button className="btn-ghost" onClick={() => setActiveTab('schools')}>View Matrix</button>}
                </div>
                <div className="school-list-mini">
                  {schools.slice(0, 6).map(school => (
                    <div key={school.id} className="school-pulse-item">
                      <div className="school-icon">🏫</div>
                      <div className="school-pulse-info">
                        <strong>{school.name}</strong>
                        <span>{school.location || 'Pending Setup'}</span>
                      </div>
                      <div className="school-pulse-stats">
                        <Users size={14} /> {school.studentCount || 0}
                      </div>
                      <div className="status-indicator online">Active</div>
                    </div>
                  ))}
                  {schools.length === 0 && (
                    <div className="super-empty-state">
                      <Building2 size={48} />
                      <h4>No Active Institutions</h4>
                      <p>Start by onboarding your first school to the system.</p>
                      <button onClick={() => setShowOnboardModal(true)}>Onboard School Now</button>
                    </div>
                  )}
                </div>
              </section>

              {/* System Alerts */}
              <section className="super-panel system-alerts">
                <div className="panel-header">
                  <h3>Real-time Logs</h3>
                </div>
                <div className="alert-list">
                  {alerts.map(alert => (
                    <div key={alert.id} className={`alert-card-super ${alert.type}`}>
                      <div className="alert-icon-wrap"><AlertCircle size={16} /></div>
                      <div className="alert-content">
                        <p>{alert.msg}</p>
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'schools' && !selectedSchool && (
          <div className="super-view-animate">
            <div className="super-panel main-table-panel">
              <div className="table-filters">
                <div className="search-wrapper">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Filter schools (e.g. Yram)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn-filter"><Filter size={16} /> Advanced</button>
              </div>
              <div className="super-table-wrapper">
                <table className="super-table">
                  <thead>
                    <tr>
                      <th>Institution</th>
                      <th>Primary Lead</th>
                      <th>License</th>
                      <th>Population</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSchools.map(school => (
                      <tr key={school.id} onClick={() => setSelectedSchool(school)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div className="school-cell">
                            <strong>{school.name}</strong>
                            <span>UID: {school.id.slice(-8).toUpperCase()}</span>
                          </div>
                        </td>
                        <td>
                          <div className="lead-cell">
                            <span className="lead-avatar">{school.principalName?.[0] || 'P'}</span>
                            {school.principalName || 'Awaiting Setup'}
                          </div>
                        </td>
                        <td><span className="plan-badge">Enterprise v2</span></td>
                        <td>
                          <div className="cap-progress-wrap">
                            <div className="cap-text">{school.studentCount || 0} Students</div>
                            <div className="cap-bar"><div className="cap-fill" style={{ width: `${Math.min((school.studentCount || 0) / 10, 100)}%` }} /></div>
                          </div>
                        </td>
                        <td><span className="status-label active">Connected</span></td>
                        <td><button className="btn-icon-more" onClick={(e) => { e.stopPropagation(); setSelectedSchool(school); }}><ChevronRight size={20} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && !selectedSchool && (
          <div className="super-view-animate">
            <div className="super-stats-row" style={{ marginBottom: '1.5rem' }}>
              <StatCard title="Total Identities" value={globalUsers.length} color="#6366f1" icon={ShieldCheck} />
              <StatCard title="Active Users" value={globalUsers.filter(u => u.isActive).length} color="#10b981" icon={CheckCircle2} />
              <StatCard title="Deactivated" value={globalUsers.filter(u => !u.isActive).length} color="#f59e0b" icon={AlertCircle} />
            </div>

             <div className="super-panel main-table-panel">
               <div className="table-filters">
                <div className="search-wrapper">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Search globally by name or email..." 
                    value={globalSearchTerm}
                    onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <select 
                    className="super-select"
                    value={userFilterRole}
                    onChange={(e) => setUserFilterRole(e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="administration">Administrators</option>
                    <option value="teacher">Teachers</option>
                    <option value="student">Students</option>
                    <option value="parent">Parents</option>
                  </select>
                </div>
              </div>

              {loadingGlobalUsers ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}><Activity className="spin" size={32} /></div>
              ) : (
                <div className="super-table-wrapper">
                  <table className="super-table">
                    <thead>
                      <tr>
                        <th>Identity</th>
                        <th>Role & Scope</th>
                        <th>Status</th>
                        <th>Registered</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGlobalUsers.map(user => {
                        const school = schools.find(s => s.id === user.schoolId);
                        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
                        return (
                          <tr key={user.id}>
                            <td>
                              <div className="user-profile-cell">
                                <div className="user-avatar-small">{user.firstName?.[0] || user.email[0].toUpperCase()}</div>
                                <div>
                                  <strong>{fullName || user.email.split("@")[0]}</strong>
                                  <span>{user.email}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="role-scope-cell">
                                <span className={`role-badge ${user.role}`}>{user.role}</span>
                                <small>{school?.name || 'Global System'}</small>
                              </div>
                            </td>
                            <td>
                              <span className={`status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                                {user.isActive ? 'Active' : 'Deactivated'}
                              </span>
                            </td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div className="table-actions">
                                <button 
                                  className="btn-action-icon" 
                                  title="Reset Password"
                                  onClick={() => handleResetPassword(user.id)}
                                >
                                  <ShieldCheck size={16} />
                                </button>
                                <button 
                                  className={`btn-action-icon ${user.isActive ? 'deactivate' : 'activate'}`}
                                  title={user.isActive ? 'Deactivate' : 'Activate'}
                                  onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                                >
                                  {user.isActive ? <X size={16} /> : <CheckCircle2 size={16} />}
                                </button>
                                <button 
                                  className="btn-action-icon danger" 
                                  title="Delete Permanent"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
             </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="super-view-animate">
            <div className="super-stats-row">
              <StatCard title="Total MRR" value={`$${financeStats.mrr.toLocaleString()}`} color="#3b82f6" icon={DollarSign} trend={8} />
              <StatCard title="Annual Projection (ARR)" value={`$${financeStats.arr.toLocaleString()}`} color="#10b981" icon={BarChart3} trend={12} />
              <StatCard title="Avg. Revenue / School" value={`$${financeStats.totalSchools > 0 ? (financeStats.mrr / financeStats.totalSchools).toFixed(0) : '0'}`} color="#6366f1" icon={Zap} />
              <StatCard title="Pending Collections" value="$848" color="#f59e0b" icon={CreditCard} />
            </div>

            <div className="super-grid finance-main-grid">
              <section className="super-panel finance-chart-panel">
                <div className="panel-header-alt">
                  <h3><TrendingUp size={20} /> Revenue Forecast</h3>
                  <div className="time-filters">
                    <button className="active">6M</button>
                    <button>1Y</button>
                    <button>ALL</button>
                  </div>
                </div>
                <div className="mock-revenue-chart">
                  {[45, 52, 48, 61, 75, 88].map((val, i) => (
                    <div key={i} className="chart-bar-wrap">
                      <div className="chart-bar" style={{ height: `${val}%` }}>
                        <div className="chart-tooltip">${val}k</div>
                      </div>
                      <span className="chart-label">{['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'][i]}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="super-panel plan-distribution-panel">
                <div className="panel-header-alt">
                  <h3>Plan Distribution</h3>
                </div>
                <div className="plan-list-super">
                  <div className="plan-item">
                    <div className="plan-info">
                      <div className="plan-dot enterprise" />
                      <span>Enterprise Tier</span>
                    </div>
                    <strong>{Math.ceil(financeStats.totalSchools * 0.7)} Schools</strong>
                  </div>
                  <div className="plan-item">
                    <div className="plan-info">
                      <div className="plan-dot professional" />
                      <span>Professional Tier</span>
                    </div>
                    <strong>{Math.floor(financeStats.totalSchools * 0.2)} Schools</strong>
                  </div>
                  <div className="plan-item">
                    <div className="plan-info">
                      <div className="plan-dot basic" />
                      <span>Basic Tier</span>
                    </div>
                    <strong>{Math.floor(financeStats.totalSchools * 0.1)} Schools</strong>
                  </div>
                </div>
                <button className="btn-plans-action">Manage Pricing Tiers <ArrowUpRight size={16} /></button>
              </section>
            </div>

            <section className="super-panel transaction-ledger">
              <div className="panel-header-alt">
                <h3>Recent Fiscal Transmissions</h3>
                <button className="btn-export-finance">Download CSV Report</button>
              </div>
              <div className="super-table-wrapper">
                <table className="super-table">
                  <thead>
                    <tr>
                      <th>Ref ID</th>
                      <th>Institution</th>
                      <th>License Plan</th>
                      <th>Amount</th>
                      <th>Timestamp</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map(txn => (
                      <tr key={txn.id}>
                        <td><code style={{ fontSize: '0.75rem', opacity: 0.7 }}>{txn.id}</code></td>
                        <td><strong>{txn.institution}</strong></td>
                        <td><span className={`plan-pill-tiny ${txn.plan.toLowerCase()}`}>{txn.plan}</span></td>
                        <td><strong>${txn.amount}</strong></td>
                        <td>{new Date(txn.date).toLocaleDateString()}</td>
                        <td><span className={`txn-status ${txn.status}`}>{txn.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'academic' && !selectedSchool && (
          <div className="super-view-animate">
            <div className="super-stats-row">
              <StatCard title="Total Years" value={academicYears.length} color="#3b82f6" icon={Calendar} />
              <StatCard title="Active Session" value={activeYear?.year || "None"} color="#10b981" icon={ShieldCheck} />
              <StatCard title="Current Term" value={academicYears.find(y => y.isActive)?.terms?.find(t => t.isCurrent)?.name || "None"} color="#8b5cf6" icon={Activity} />
            </div>

            {/* Academic Years Management */}
            <div className="super-panel main-table-panel" style={{ marginBottom: '2rem' }}>
              <div className="panel-header">
                <h3>Academic Years Management</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn-ghost-super" onClick={handleSeedClasses} disabled={onboardLoading}>
                    {onboardLoading ? <Activity className="spin" size={14} /> : "Seed Standard Classes"}
                  </button>
                  <button className="btn-primary-super" onClick={() => setShowYearModal(true)}>
                    <Plus size={16} /> New Year
                  </button>
                </div>
              </div>
              
              <div className="super-table-wrapper">
                <table className="super-table">
                  <thead>
                    <tr>
                      <th>Academic Year</th>
                      <th>Terms</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicYears.map(year => (
                      <tr key={year.id}>
                        <td>
                          <div className="school-cell">
                            <strong>{year.year}</strong>
                            <span>ID: {year.id.slice(-8).toUpperCase()}</span>
                          </div>
                        </td>
                        <td>
                          <div className="terms-pill-container">
                            {year.terms?.map(term => (
                              <span key={term.id} className={`term-pill ${term.isCurrent ? 'active' : ''}`}>
                                {term.name}
                                {term.isCurrent && <CheckCircle2 size={10} style={{marginLeft: 4}} />}
                              </span>
                            ))}
                            <button className="btn-add-pill" onClick={() => {
                              setSelectedYearForTerm(year);
                              setShowTermModal(true);
                            }}><Plus size={12} /></button>
                          </div>
                        </td>
                        <td>
                          <span className={`status-label ${year.isActive ? 'active' : 'inactive'}`}>
                            {year.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            {!year.isActive && (
                              <button className="btn-ghost-super" onClick={() => handleActivateYear(year.id)}>
                                Set Active
                              </button>
                            )}
                            <button className="btn-icon-more"><MoreHorizontal size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* School Assignment Hub */}
            <div className="super-panel assignment-hub-panel">
              <div className="panel-header">
                <div>
                  <h3>Teacher-Section Assignments</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Select a school to manage its teaching personnel across sections.</p>
                </div>
                <div className="school-filter-super">
                  <select 
                    value={acadSchoolId} 
                    onChange={e => setAcadSchoolId(e.target.value)}
                    style={{ padding: '0.6rem 1rem', borderRadius: '12px', background: 'var(--glass)', color: 'var(--text)', border: '1px solid var(--border)', outline: 'none' }}
                  >
                    <option value="">-- Select School --</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {acadLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <Activity className="spin" size={32} color="var(--accent)" />
                  <p style={{ marginTop: '1rem', opacity: 0.6 }}>Synchronizing school data...</p>
                </div>
              ) : acadSchoolId ? (
                <div className="acad-structure-container" style={{ padding: '1rem' }}>
                  <SchoolAcademicSection 
                    school={schools.find(s => s.id === acadSchoolId)} 
                    schoolUsers={acadTeachers.map(t => ({ ...t, role: 'teacher' }))} 
                    activeYear={activeYear}
                  />
                </div>
              ) : (
                <div className="super-empty-state" style={{ padding: '4rem 2rem' }}>
                  <Users size={48} opacity={0.2} />
                  <p style={{ marginTop: '1.5rem', opacity: 0.6 }}>Select an institution from the dropdown to manage its academic structure.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedSchool && (
          <div className="super-view-animate school-detail-view">
            <div className="detail-view-header">
              <button className="btn-back" onClick={() => setSelectedSchool(null)}><ArrowLeft size={20} /></button>
              <div>
                <h2>{selectedSchool.name}</h2>
                <div className="school-meta">
                  <span className="meta-pill">
                    <Users size={14} /> {schoolUsers.filter(u => u.role === 'student').length} Students
                  </span>
                  <span className="meta-pill">
                    <Users size={14} /> {schoolUsers.filter(u => u.role === 'teacher').length} Teachers
                  </span>
                  <span className="meta-pill">
                    <ShieldCheck size={14} /> {schoolUsers.filter(u => u.role === 'administration').length} Admins
                  </span>
                  <span className="meta-pill"><Building2 size={14} /> {selectedSchool.location || 'No Location'}</span>
                  <span className="plan-badge">License: Enterprise v2</span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                 <button className="btn-primary-super" onClick={() => setShowAddUserModal(true)}>
                  <Plus size={18} /> Add User
                </button>
              </div>
            </div>

            <div className="detail-view-tabs" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <button 
                className={`detail-tab ${activeDetailTab === 'users' ? 'active' : ''}`} 
                onClick={() => setActiveDetailTab('users')}
                style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeDetailTab === 'users' ? '2px solid var(--accent)' : 'none', color: activeDetailTab === 'users' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Identities
              </button>
              <button 
                className={`detail-tab ${activeDetailTab === 'academic' ? 'active' : ''}`} 
                onClick={() => setActiveDetailTab('academic')}
                style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeDetailTab === 'academic' ? '2px solid var(--accent)' : 'none', color: activeDetailTab === 'academic' ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Academic Structure
              </button>
            </div>

            {activeDetailTab === 'users' && (
              <div className="school-users-section">
                {['administration', 'teacher', 'student', 'parent'].map(role => {
                  const users = schoolUsers.filter(u => u.role === role);
                  return (
                    <section key={role} className="role-group">
                      <div className="role-section-header">
                        <h3>
                          {role === 'administration' && <ShieldCheck size={20} color="#4338ca" />}
                          {role === 'teacher' && <Users size={20} color="#b45309" />}
                          {role === 'student' && <StudentIcon size={20} color="#15803d" />}
                          {role === 'parent' && <Heart size={20} color="#be185d" />}
                          {role === 'administration' ? 'Administrators' : (role.charAt(0).toUpperCase() + role.slice(1) + 's')}
                        </h3>
                        <span className="count-badge">{users.length} Total</span>
                      </div>
                      {loadingUsers ? (
                        <div className="loading-row">Synchronizing users...</div>
                      ) : users.length > 0 ? (
                        <div className="user-grid-super">
                          {users.map(user => {
                            const fullName = [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") || user.name;
                            return (
                              <div key={user.id} className="user-card-super">
                                <div className="user-avatar-super">{user.firstName?.[0] || user.email[0].toUpperCase()}</div>
                                <div className="user-info-super">
                                  <strong>{fullName || user.email.split("@")[0]}</strong>
                                  <span>{user.email}</span>
                                  <div className={`role-badge-super ${role}`}>
                                    {role === 'administration' ? 'Administration' : role.charAt(0).toUpperCase() + role.slice(1)}
                                  </div>
                                </div>
                                <button className="btn-user-action" onClick={() => handleDeleteUser(user.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="super-empty-state-small">No {role}s registered.</div>
                      )}
                    </section>
                  );
                })}
              </div>
            )}

            {activeDetailTab === 'academic' && (
              <SchoolAcademicSection school={selectedSchool} schoolUsers={schoolUsers} activeYear={activeYear} />
            )}
          </div>
        )}
      </main>

      {/* Onboarding Wizard Modal */}
      {showOnboardModal && (
        <div className="super-modal-overlay">
          <div className="super-modal-content">
            <div className="modal-wizard-header">
              <div className={`step-dot ${onboardStep >= 1 ? 'active' : ''}`}>1</div>
              <div className="step-line" />
              <div className={`step-dot ${onboardStep >= 2 ? 'active' : ''}`}>2</div>
            </div>
            
            <h3>{onboardStep === 1 ? "Step 1: School Profile" : "Step 2: Assign Administrator"}</h3>
            <p className="modal-sub">
              {onboardStep === 1 
                ? "Enter the physical and institutional details for the new school." 
                : "Create the primary admin account that will manage this school."}
            </p>

            <form onSubmit={handleOnboardSubmit} className="onboard-form">
              {onboardStep === 1 ? (
                <div className="form-sections-wrap">
                  <div className="input-group-super">
                    <label>School Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Neo-Matrix High School" />
                  </div>
                  <div className="input-group-super">
                    <label>Principal Name</label>
                    <input required value={formData.principalName} onChange={e => setFormData({...formData, principalName: e.target.value})} placeholder="e.g. Dr. Thomas Anderson" />
                  </div>
                  <div className="input-group-super">
                    <label>Location / City</label>
                    <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Takoradi, GH" />
                  </div>
                </div>
              ) : (
                <div className="form-sections-wrap">
                   <div className="input-group-super">
                    <label>Admin Full Name</label>
                    <input required value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} placeholder="e.g. Sarah Connor" />
                  </div>
                  <div className="input-group-super">
                    <label>Admin Email</label>
                    <input required type="email" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} placeholder="admin@school.com" />
                  </div>
                  <div className="input-group-super">
                    <label>Initial Password</label>
                    <input required type="password" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} placeholder="••••••••" />
                  </div>
                </div>
              )}

              {onboardError && <div className="super-error-msg">{onboardError}</div>}

              <div className="modal-footer-btns">
                <button type="button" className="btn-cancel-super" onClick={() => setShowOnboardModal(false)} disabled={onboardLoading}>Cancel</button>
                <button type="submit" className="btn-action-super" disabled={onboardLoading}>
                  {onboardLoading ? <Activity className="spin" size={16} /> : (onboardStep === 1 ? "Next: Admin Setup" : "Complete Onboarding")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="super-modal-overlay">
          <div className="super-modal-content">
            <h3>Add New User to {selectedSchool.name}</h3>
            <p className="modal-sub">Manually register a new account for this institution.</p>
            
            <form onSubmit={handleAddUserSubmit} className="onboard-form">
              <div className="form-sections-wrap">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                   <div className="input-group-super">
                    <label>First Name</label>
                    <input required value={userFormData.firstName} onChange={e => setUserFormData({...userFormData, firstName: e.target.value})} placeholder="John" />
                  </div>
                  <div className="input-group-super">
                    <label>Middle Name</label>
                    <input value={userFormData.middleName} onChange={e => setUserFormData({...userFormData, middleName: e.target.value})} placeholder="Quincy" />
                  </div>
                  <div className="input-group-super">
                    <label>Last Name</label>
                    <input required value={userFormData.lastName} onChange={e => setUserFormData({...userFormData, lastName: e.target.value})} placeholder="Doe" />
                  </div>
                </div>
                <div className="input-group-super">
                  <label>Email Address</label>
                  <input required type="email" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} placeholder="user@school.com" />
                </div>
                <div className="input-group-super">
                  <label>User Role</label>
                  <select 
                    value={userFormData.role} 
                    onChange={e => setUserFormData({...userFormData, role: e.target.value})}
                    style={{ padding: '0.85rem', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}
                  >
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="administration">Administrator</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer-btns">
                <button type="button" className="btn-cancel-super" onClick={() => setShowAddUserModal(false)}>Cancel</button>
                <button type="submit" className="btn-action-super" disabled={onboardLoading}>
                  {onboardLoading ? <Activity className="spin" size={16} /> : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Academic Year Modal */}
      {showYearModal && (
        <div className="super-modal-overlay">
          <div className="super-modal-content">
            <h3>Create Academic Year</h3>
            <p className="modal-sub">Define a new session (e.g., 2025/2026).</p>
            <form onSubmit={handleCreateYear} className="onboard-form">
              <div className="form-sections-wrap">
                <div className="input-group-super">
                  <label>Year Format (YYYY/YYYY)</label>
                  <input required value={newYearName} onChange={e => setNewYearName(e.target.value)} placeholder="2025/2026" />
                </div>
              </div>
              {onboardError && <div className="super-error-msg">{onboardError}</div>}
              <div className="modal-footer-btns">
                <button type="button" className="btn-cancel-super" onClick={() => { setShowYearModal(false); setOnboardError(""); }}>Cancel</button>
                <button type="submit" className="btn-action-super" disabled={onboardLoading}>
                  {onboardLoading ? <Activity className="spin" size={16} /> : "Create Year"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Term Modal */}
      {showTermModal && (
        <div className="super-modal-overlay">
          <div className="super-modal-content">
            <h3>Add Term to {selectedYearForTerm?.year}</h3>
            <p className="modal-sub">Define a new academic period (e.g., Term 1).</p>
            <form onSubmit={handleCreateTerm} className="onboard-form">
              <div className="form-sections-wrap">
                <div className="input-group-super">
                  <label>Term Name</label>
                  <input required value={newTermData.name} onChange={e => setNewTermData({...newTermData, name: e.target.value})} placeholder="e.g. Term 1" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group-super">
                    <label>Start Date</label>
                    <input required type="date" value={newTermData.startDate} onChange={e => setNewTermData({...newTermData, startDate: e.target.value})} />
                  </div>
                  <div className="input-group-super">
                    <label>End Date</label>
                    <input required type="date" value={newTermData.endDate} onChange={e => setNewTermData({...newTermData, endDate: e.target.value})} />
                  </div>
                </div>
                <div className="checkbox-group-super">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newTermData.isCurrent} onChange={e => setNewTermData({...newTermData, isCurrent: e.target.checked})} />
                    Set as Current Term
                  </label>
                </div>
              </div>
              {onboardError && <div className="super-error-msg">{onboardError}</div>}
              <div className="modal-footer-btns">
                <button type="button" className="btn-cancel-super" onClick={() => { setShowTermModal(false); setOnboardError(""); }}>Cancel</button>
                <button type="submit" className="btn-action-super" disabled={onboardLoading}>
                  {onboardLoading ? <Activity className="spin" size={16} /> : "Add Term"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
function SchoolAcademicSection({ school, schoolUsers, activeYear }) {
  const [classLevels, setClassLevels] = useState([]);
  const [expandedClass, setExpandedClass] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getClassLevels()
      .then(setClassLevels)
      .finally(() => setLoading(false));
  }, []);

  const teachers = schoolUsers.filter(u => u.role === 'teacher');

  return (
    <div className="school-academic-section">
      <div className="section-header-modern" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--accent)', padding: '0.75rem', borderRadius: '14px', color: '#fff' }}>
            <Calendar size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Academic Structure & Assignments</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Assigning personnel for <strong style={{ color: 'var(--text)' }}>{school.name}</strong> • {teachers.length} Teachers available
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Activity className="spin" size={32} color="var(--accent)" />
          <p style={{ marginTop: '1rem', opacity: 0.6 }}>Loading class structure...</p>
        </div>
      ) : (
        <div className="modern-class-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          {classLevels.map(cl => (
            <div 
              key={cl.id} 
              className={`modern-class-card ${expandedClass === cl.id ? 'expanded' : ''}`}
              style={{ 
                background: 'var(--glass)', 
                border: '1px solid var(--border)', 
                borderRadius: '24px', 
                padding: '1.5rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: expandedClass === cl.id ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expandedClass === cl.id ? '1.5rem' : '0' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid var(--border)' }}>
                     {cl.name.charAt(0)}
                   </div>
                   <div>
                     <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{cl.name}</h4>
                     <span className="level-badge" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.6 }}>{cl.level}</span>
                   </div>
                 </div>
                 <button 
                  className={`btn-manage-sections ${expandedClass === cl.id ? 'active' : ''}`}
                  onClick={() => setExpandedClass(expandedClass === cl.id ? null : cl.id)}
                  style={{ 
                    padding: '0.5rem 1rem', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: expandedClass === cl.id ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                    color: expandedClass === cl.id ? '#fff' : 'var(--text)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s'
                  }}
                 >
                   {expandedClass === cl.id ? 'Close' : 'Manage Sections'}
                 </button>
              </div>
              
              {expandedClass === cl.id && (
                <div className="sections-expansion-area" style={{ animation: 'slideDown 0.3s ease-out' }}>
                  <SchoolSectionList classLevelId={cl.id} teachers={teachers} activeYear={activeYear} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SchoolSectionList({ classLevelId, teachers, activeYear }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigningTo, setAssigningTo] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCapacity, setNewCapacity] = useState("40");
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchSections = useCallback(() => {
    setLoading(true);
    api.getClassSections(classLevelId)
      .then(setSections)
      .catch(err => console.error("Error fetching sections:", err))
      .finally(() => setLoading(false));
  }, [classLevelId]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleCreateSection = async (e) => {
    e.preventDefault();
    if (!newName) return;
    if (!activeYear) {
      alert("No active academic year found. Please create/activate an academic year first.");
      return;
    }

    try {
      await api.createSection(classLevelId, { 
        name: newName, 
        capacity: parseInt(newCapacity),
        academicYearId: activeYear.id
      });
      setNewName("");
      setIsCreating(false);
      fetchSections();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAssign = async (sectionId) => {
    if (!selectedTeacherId) return;
    try {
      await api.assignTeacherToSection(selectedTeacherId, sectionId);
      setAssigningTo(null);
      setSelectedTeacherId("");
      setRefreshKey(prev => prev + 1);
      fetchSections();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleUnassign = async (teacherUserId, sectionId) => {
    if (!window.confirm("Are you sure you want to unassign this teacher?")) return;
    try {
      await api.unassignTeacherFromSection(teacherUserId, sectionId);
      setRefreshKey(prev => prev + 1);
      fetchSections();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading && !sections.length) return <div style={{ padding: '1rem', textAlign: 'center', opacity: 0.5 }}>Syncing sections...</div>;

  return (
    <div className="school-sections-modern-list" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h5 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7 }}>Active Sections</h5>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text)', cursor: 'pointer' }}
          >
            + Add Section
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreateSection} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(var(--accent-rgb), 0.05)', borderRadius: '16px', border: '1px solid var(--accent)', animation: 'slideDown 0.2s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px auto', gap: '0.5rem', alignItems: 'end' }}>
            <div className="input-group-tiny">
              <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Section Name</label>
              <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. A" style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
            </div>
            <div className="input-group-tiny">
              <label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block', marginBottom: '4px' }}>Cap.</label>
              <input required type="number" value={newCapacity} onChange={e => setNewCapacity(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
               <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>Add</button>
               <button type="button" onClick={() => setIsCreating(false)} style={{ padding: '0.5rem', borderRadius: '8px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sections.map(s => (
          <div key={s.id} className="modern-section-item" style={{ 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '16px', 
            border: '1px solid var(--border)',
            transition: 'transform 0.2s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Section {s.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <Users size={12} opacity={0.5} />
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Capacity: {s.capacity} Students</span>
                </div>
              </div>
              <span className={`status-dot ${s.isFull ? 'red' : 'green'}`}></span>
            </div>
            
            <SchoolSectionPersonnel sectionId={s.id} teachers={teachers} onUnassign={(tid) => handleUnassign(tid, s.id)} refreshTrigger={refreshKey} />

            {assigningTo === s.id ? (
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', animation: 'fadeIn 0.2s' }}>
                <select 
                  value={selectedTeacherId} 
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  style={{ 
                    flex: 1, 
                    padding: '0.6rem', 
                    borderRadius: '10px', 
                    background: 'var(--surface)', 
                    color: 'var(--text)', 
                    border: '1.5px solid var(--border)', 
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="">Choose Teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                  ))}
                </select>
                <button 
                  onClick={() => handleAssign(s.id)} 
                  disabled={!selectedTeacherId}
                  style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', opacity: selectedTeacherId ? 1 : 0.5 }}
                >
                  Assign
                </button>
                <button 
                  onClick={() => setAssigningTo(null)} 
                  style={{ padding: '0.6rem', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button 
                className="btn-add-teacher-trigger"
                onClick={() => setAssigningTo(s.id)} 
                style={{ 
                  width: '100%', 
                  padding: '0.6rem', 
                  marginTop: '0.75rem', 
                  borderRadius: '10px', 
                  border: '1.5px dashed var(--border)', 
                  color: 'var(--text-secondary)', 
                  background: 'none', 
                  fontSize: '0.8rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <Plus size={14} /> Assign New Teacher
              </button>
            )}
          </div>
        ))}
      </div>
      {!sections.length && !isCreating && (
        <div style={{ textAlign: 'center', padding: '2.5rem', opacity: 0.6, background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
          <ShieldCheck size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>No established sections for this level.</p>
          <button 
            onClick={() => setIsCreating(true)}
            style={{ padding: '0.6rem 1.25rem', borderRadius: '12px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Create First Section
          </button>
        </div>
      )}
    </div>
  );
}

function SchoolSectionPersonnel({ sectionId, teachers, onUnassign, refreshTrigger }) {
  const [assigned, setAssigned] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssigned = useCallback(() => {
    setLoading(true);
    api.listTeachersForSection(sectionId)
      .then(setAssigned)
      .finally(() => setLoading(false));
  }, [sectionId, refreshTrigger]);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned, refreshTrigger]);

  if (loading && !assigned.length) return <div style={{ fontSize: '0.75rem', opacity: 0.4, padding: '4px 0' }}>Updating personnel...</div>;

  return (
    <div className="personnel-list-modern" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {assigned.map(a => {
        const t = teachers.find(ts => ts.id === a.teacherUserId);
        return (
          <div 
            key={a.teacherUserId} 
            className="assigned-teacher-row"
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: 'rgba(59, 130, 246, 0.05)', 
              padding: '8px 12px', 
              borderRadius: '10px', 
              fontSize: '0.85rem',
              border: '1px solid rgba(59, 130, 246, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgb(59, 130, 246)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>
                {t?.firstName?.[0] || 'T'}
              </div>
              <span style={{ fontWeight: 500 }}>{t ? `${t.firstName} ${t.lastName}` : 'Teacher Account'}</span>
            </div>
            <button 
              onClick={() => onUnassign(a.teacherUserId)} 
              style={{ 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: 'none', 
                color: '#ef4444', 
                width: '24px', 
                height: '24px', 
                borderRadius: '6px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Unassign"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      })}
      {!assigned.length && !loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.5, padding: '4px 0' }}>
          <AlertCircle size={14} />
          <span style={{ fontSize: '0.75rem' }}>No lead teacher assigned</span>
        </div>
      )}
    </div>
  );
}
