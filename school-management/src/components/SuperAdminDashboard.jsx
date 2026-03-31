import React, { useState, useEffect, useMemo } from "react";
import api from "../lib/api";
import { 
  Building2, Users, GraduationCap, DollarSign, Activity, 
  Plus, Search, Filter, MoreHorizontal, ShieldCheck,
  TrendingUp, Calendar, AlertCircle, CheckCircle2, ChevronRight,
  ArrowLeft, Mail, Trash2, UserPlus, UserCog, GraduationCap as StudentIcon,
  Heart
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("overview");
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
    email: "", role: "teacher", firstName: "", lastName: ""
  });

  useEffect(() => {
    fetchGlobalData();
  }, [selectedSchool]); // Re-fetch on select or clear

  const fetchGlobalData = async () => {
    setLoading(true);
    try {
      const schoolData = await api.getSchools();
      const schoolsArr = Array.isArray(schoolData) ? schoolData : [];
      setSchools(schoolsArr);
      
      const totalStudents = schoolsArr.reduce((acc, s) => acc + (s.studentCount || 0), 0);
      const totalTeachers = schoolsArr.reduce((acc, s) => acc + (s.teacherCount || 0), 0);
      
      setStats({
        schools: schoolsArr.length,
        students: totalStudents,
        teachers: totalTeachers,
        revenue: schoolsArr.length * 150,
        health: 100
      });

      setAlerts([
        { id: 1, type: 'info', msg: 'System Root active. Connectivity established.', time: 'Just now' }
      ]);

      if (selectedSchool) {
        fetchSchoolUsers(selectedSchool.id);
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolUsers = async (schoolId) => {
    setLoadingUsers(true);
    try {
      const users = await api.getSchoolUsers(schoolId);
      setSchoolUsers(Array.isArray(users) ? users : []);
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
      await api.createUserForSchool(selectedSchool.id, userFormData);
      setShowAddUserModal(false);
      setUserFormData({ email: "", role: "teacher", firstName: "", lastName: "" });
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

  const filteredSchools = useMemo(() => {
    return schools.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [schools, searchTerm]);

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
      {/* Side Navigation */}
      <aside className="super-sidebar">
        <div className="sidebar-brand">
          <ShieldCheck size={28} />
          <div className="brand-text">
            <span>System Root</span>
            <small>v2.4.0 Stable</small>
          </div>
        </div>
        <nav className="super-nav">
          <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
            <Activity size={20} /> Dashboard
          </button>
          <button className={activeTab === 'schools' ? 'active' : ''} onClick={() => setActiveTab('schools')}>
            <Building2 size={20} /> Institutions
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <Users size={20} /> Identity Control
          </button>
          <button className={activeTab === 'finance' ? 'active' : ''} onClick={() => setActiveTab('finance')}>
            <DollarSign size={20} /> Revenue & Plans
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
            <button className="btn-sync" onClick={fetchGlobalData}><Activity size={16} /> Force Sync</button>
            <button className="btn-primary-super" onClick={() => setShowOnboardModal(true)}>
              <Plus size={18} /> Onboard School
            </button>
          </div>
        </header>

        {activeTab === 'overview' && !selectedSchool && (
          <div className="super-view-animate">
            <div className="super-stats-row">
              <StatCard title="Total Schools" value={stats.schools} color="#3b82f6" icon={Building2} trend={stats.schools > 0 ? 12 : 0} />
              <StatCard title="Global Students" value={stats.students} color="#10b981" icon={GraduationCap} trend={stats.students > 0 ? 8 : 0} />
              <StatCard title="Global Teachers" value={stats.teachers} color="#8b5cf6" icon={Users} trend={stats.teachers > 0 ? 5 : 0} />
              <StatCard title="Est. Revenue" value={`$${stats.revenue.toLocaleString()}`} color="#f59e0b" icon={DollarSign} />
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
             <div className="super-panel main-table-panel">
               <div className="table-filters">
                <div className="search-wrapper">
                  <Search size={18} />
                  <input type="text" placeholder="Search across all institutions..." readOnly />
                </div>
              </div>
              <div className="super-empty-state">
                <Users size={48} />
                <h4>Global User Directory</h4>
                <p>Select a specific institution from the <strong>Institutions</strong> tab to deep-dive into its students, teachers, and admins.</p>
                <button onClick={() => setActiveTab('schools')}>Go to Institutions</button>
              </div>
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
                  <span className="meta-pill"><Building2 size={14} /> {selectedSchool.location || 'No Location'}</span>
                  <span className="meta-pill"><Users size={14} /> {selectedSchool.studentCount || 0} Students</span>
                  <span className="meta-pill"><ShieldCheck size={14} /> License: Enterprise v2</span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                 <button className="btn-primary-super" onClick={() => setShowAddUserModal(true)}>
                  <Plus size={18} /> Add User
                </button>
              </div>
            </div>

            <div className="school-users-section">
              {['admin', 'teacher', 'student', 'parent'].map(role => {
                const users = schoolUsers.filter(u => u.role === role);
                return (
                  <section key={role} className="role-group">
                    <div className="role-section-header">
                      <h3>
                        {role === 'admin' && <ShieldCheck size={20} color="#4338ca" />}
                        {role === 'teacher' && <Users size={20} color="#b45309" />}
                        {role === 'student' && <StudentIcon size={20} color="#15803d" />}
                        {role === 'parent' && <Heart size={20} color="#be185d" />}
                        {role.charAt(0).toUpperCase() + role.slice(1)}s
                      </h3>
                      <span className="count-badge">{users.length} Total</span>
                    </div>
                    {loadingUsers ? (
                      <div className="loading-row">Synchronizing users...</div>
                    ) : users.length > 0 ? (
                      <div className="user-grid-super">
                        {users.map(user => (
                          <div key={user.id} className="user-card-super">
                            <div className="user-avatar-super">{user.firstName?.[0] || user.email[0].toUpperCase()}</div>
                            <div className="user-info-super">
                              <strong>{user.firstName} {user.lastName}</strong>
                              <span>{user.email}</span>
                              <div className={`role-badge-super ${role}`}>{role}</div>
                            </div>
                            <button className="btn-user-action" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="super-empty-state-small">No {role}s registered.</div>
                    )}
                  </section>
                );
              })}
            </div>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div className="input-group-super">
                    <label>First Name</label>
                    <input required value={userFormData.firstName} onChange={e => setUserFormData({...userFormData, firstName: e.target.value})} placeholder="John" />
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
                    <option value="admin">Administrator</option>
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
    </div>
  );
}
