import React, { useState, useEffect, useMemo } from "react";
import "./SuperAdminDashboard.css";

// ============ MOCK DATA GENERATORS ============

const generateSuperAdminStats = () => [
  { title: "Total Schools", value: 24, change: 12, color: "#667eea", icon: "🏫" },
  { title: "Total Students", value: 12450, change: 8, color: "#48bb78", icon: "👨‍🎓" },
  { title: "Total Teachers", value: 892, change: 5, color: "#ed8936", icon: "👨‍🏫" },
  { title: "Active Administrators", value: 48, change: 3, color: "#764ba2", icon: "👤" },
  { title: "System Health", value: 98, change: 2, color: "#38b2ac", icon: "💚", isPercentage: true },
  { title: "Revenue (MTD)", value: 284500, change: 15, color: "#f56565", icon: "💰" },
];

const generateSchoolsData = () => [
  { id: 1, name: "Greenwood Academy", location: "New York, NY", students: 1250, teachers: 85, status: "Active", principal: "Dr. Sarah Johnson", subscription: "Enterprise" },
  { id: 2, name: "Riverside High School", location: "Los Angeles, CA", students: 980, teachers: 72, status: "Active", principal: "Mr. Michael Chen", subscription: "Professional" },
  { id: 3, name: "Mountain View Institute", location: "Seattle, WA", students: 756, teachers: 54, status: "Active", principal: "Mrs. Emily Davis", subscription: "Professional" },
  { id: 4, name: "Sunrise Preparatory", location: "Miami, FL", students: 620, teachers: 45, status: "Pending", principal: "Dr. James Wilson", subscription: "Basic" },
  { id: 5, name: "Lakewood Elementary", location: "Chicago, IL", students: 1100, teachers: 78, status: "Active", principal: "Ms. Lisa Brown", subscription: "Enterprise" },
  { id: 6, name: "Pacific Coast Academy", location: "San Diego, CA", students: 890, teachers: 62, status: "Active", principal: "Mr. David Kim", subscription: "Professional" },
];

const generateUsersData = () => [
  { id: 1, name: "Dr. Sarah Johnson", role: "Principal", school: "Greenwood Academy", email: "sarah.johnson@greenwood.edu", status: "Active", lastActive: "2 hours ago" },
  { id: 2, name: "Mr. Michael Chen", role: "Principal", school: "Riverside High School", email: "michael.chen@riverside.edu", status: "Active", lastActive: "1 hour ago" },
  { id: 3, name: "Mrs. Jennifer Martinez", role: "Administrator", school: "System Admin", email: "j.martinez@system.edu", status: "Active", lastActive: "30 min ago" },
  { id: 4, name: "Mr. Robert Taylor", role: "Administrator", school: "System Admin", email: "r.taylor@system.edu", status: "Inactive", lastActive: "3 days ago" },
  { id: 5, name: "Dr. Amanda White", role: "Principal", school: "Mountain View Institute", email: "amanda.white@mountainview.edu", status: "Active", lastActive: "5 hours ago" },
  { id: 6, name: "Ms. Lisa Brown", role: "Principal", school: "Lakewood Elementary", email: "lisa.brown@lakewood.edu", status: "Active", lastActive: "1 day ago" },
  { id: 7, name: "Mr. David Kim", role: "Principal", school: "Pacific Coast Academy", email: "david.kim@pacificcoast.edu", status: "Active", lastActive: "4 hours ago" },
  { id: 8, name: "Mrs. Patricia Garcia", role: "Teacher", school: "Greenwood Academy", email: "patricia.g@greenwood.edu", status: "Active", lastActive: "2 hours ago" },
];

const generateRolesData = () => [
  { id: 1, name: "Super Admin", description: "Full system access", permissions: ["all"], userCount: 4, color: "#f56565" },
  { id: 2, name: "School Admin", description: "Full school access", permissions: ["school.all", "reports.view"], userCount: 24, color: "#667eea" },
  { id: 3, name: "Principal", description: "School principal access", permissions: ["school.read", "students.manage", "teachers.manage"], userCount: 20, color: "#48bb78" },
  { id: 4, name: "Teacher", description: "Teacher access", permissions: ["classroom.access", "results.edit", "attendance.edit"], userCount: 892, color: "#ed8936" },
  { id: 5, name: "Student", description: "Student access", permissions: ["own.profile", "own.results", "own.attendance"], userCount: 12450, color: "#38b2ac" },
  { id: 6, name: "Parent", description: "Parent access", permissions: ["own.children.view", "own.children.reports"], userCount: 3500, color: "#764ba2" },
];

const generateClassesData = () => [
  { id: 1, name: "Grade 10-A", school: "Greenwood Academy", students: 35, subjects: 8, teacher: "Mrs. Patricia Garcia" },
  { id: 2, name: "Grade 10-B", school: "Greenwood Academy", students: 32, subjects: 8, teacher: "Mr. John Smith" },
  { id: 3, name: "Grade 11 Science", school: "Riverside High School", students: 40, subjects: 10, teacher: "Mr. Michael Chen" },
  { id: 4, name: "Grade 9-A", school: "Mountain View Institute", students: 28, subjects: 7, teacher: "Ms. Emily Davis" },
];

const generateSubjectsData = () => [
  { id: 1, name: "Mathematics", code: "MATH101", classes: 24, teachers: 12, school: "All Schools" },
  { id: 2, name: "English Literature", code: "ENG201", classes: 20, teachers: 8, school: "All Schools" },
  { id: 3, name: "Physics", code: "PHY301", classes: 15, teachers: 6, school: "All Schools" },
  { id: 4, name: "Chemistry", code: "CHEM301", classes: 15, teachers: 6, school: "All Schools" },
  { id: 5, name: "Computer Science", code: "CS101", classes: 18, teachers: 5, school: "All Schools" },
  { id: 6, name: "History", code: "HIST101", classes: 12, teachers: 4, school: "All Schools" },
];

const generateFinanceData = () => [
  { id: 1, school: "Greenwood Academy", plan: "Enterprise", amount: 2500, status: "Paid", nextBilling: "2024-02-01", users: 1335 },
  { id: 2, school: "Riverside High School", plan: "Professional", amount: 1200, status: "Paid", nextBilling: "2024-02-05", users: 1052 },
  { id: 3, school: "Mountain View Institute", plan: "Professional", amount: 1200, status: "Pending", nextBilling: "2024-02-10", users: 810 },
  { id: 4, school: "Sunrise Preparatory", plan: "Basic", amount: 500, status: "Overdue", nextBilling: "2024-01-15", users: 665 },
  { id: 5, school: "Lakewood Elementary", plan: "Enterprise", amount: 2500, status: "Paid", nextBilling: "2024-02-15", users: 1178 },
  { id: 6, school: "Pacific Coast Academy", plan: "Professional", amount: 1200, status: "Paid", nextBilling: "2024-02-20", users: 952 },
];

const generateNotificationsData = () => [
  { id: 1, type: "info", title: "New School Registration", message: "Sunrise Preparatory submitted registration for approval", time: "2 hours ago", recipients: "All Admins" },
  { id: 2, type: "success", title: "System Update Complete", message: "Version 2.5.1 deployed successfully across all schools", time: "5 hours ago", recipients: "All Users" },
  { id: 3, type: "warning", title: "Payment Due Soon", message: "Mountain View Institute subscription renewal in 5 days", time: "1 day ago", recipients: "Finance Team" },
  { id: 4, type: "info", title: "Performance Report Ready", message: "Quarterly school performance reports are ready for review", time: "1 day ago", recipients: "School Admins" },
  { id: 5, type: "alert", title: "Security Alert", message: "Multiple failed login attempts detected from IP 192.168.1.45", time: "2 days ago", recipients: "Security Team" },
];

const generateReportsData = () => [
  { id: 1, name: "Student Performance Summary", type: "Academic", generated: "2024-01-20", downloads: 156 },
  { id: 2, name: "Attendance Report - January", type: "Attendance", generated: "2024-01-25", downloads: 89 },
  { id: 3, name: "Financial Summary Q4 2023", type: "Financial", generated: "2024-01-15", downloads: 45 },
  { id: 4, name: "System Usage Analytics", type: "System", generated: "2024-01-28", downloads: 67 },
  { id: 5, name: "Teacher Performance Report", type: "HR", generated: "2024-01-22", downloads: 34 },
];

const generateActivityLogs = () => [
  { id: 1, action: "User Login", user: "Dr. Sarah Johnson", details: "Logged in from New York, NY", time: "2 min ago", ip: "192.168.1.100" },
  { id: 2, action: "Student Created", user: "Mr. Michael Chen", details: "Added new student: Emma Wilson", time: "15 min ago", ip: "192.168.1.105" },
  { id: 3, action: "Report Generated", user: "Mrs. Jennifer Martinez", details: "Generated monthly attendance report", time: "1 hour ago", ip: "192.168.1.110" },
  { id: 4, action: "Permission Changed", user: "Super Admin", details: "Updated role permissions for Principal", time: "2 hours ago", ip: "192.168.1.1" },
  { id: 5, action: "School Settings Updated", user: "Dr. Amanda White", details: "Modified school configuration", time: "3 hours ago", ip: "192.168.1.115" },
];

const generateEnrollmentData = () => [
  { month: "Aug", students: 10500 },
  { month: "Sep", students: 11200 },
  { month: "Oct", students: 11500 },
  { month: "Nov", students: 11800 },
  { month: "Dec", students: 12100 },
  { month: "Jan", students: 12450 },
];

const generateAttendanceData = () => [
  { week: "Week 1", attendance: 94 },
  { week: "Week 2", attendance: 92 },
  { week: "Week 3", attendance: 96 },
  { week: "Week 4", attendance: 95 },
];

// ============ UTILITY FUNCTIONS ============

const formatNumber = (num) => num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";

const formatCurrency = (num) => "$" + formatNumber(num);

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const getStatusColor = (status) => {
  const colors = { Active: "#48bb78", Pending: "#ed8936", Inactive: "#718096", Paid: "#48bb78", Overdue: "#f56565" };
  return colors[status] || "#718096";
};

const getNotificationColor = (type) => {
  const colors = { info: "#667eea", success: "#48bb78", warning: "#ed8936", alert: "#f56565" };
  return colors[type] || "#667eea";
};

// ============ ICONS ============
const Icons = {
  dashboard: "📊",
  users: "👥",
  school: "🏫",
  roles: "🔐",
  academic: "📚",
  finance: "💰",
  reports: "📈",
  notifications: "🔔",
  add: "➕",
  edit: "✏️",
  delete: "🗑️",
  view: "👁️",
  export: "📤",
  import: "📥",
  search: "🔍",
  filter: "⚙️",
  close: "✕",
  check: "✓",
  warning: "⚠️",
  success: "✅",
  info: "ℹ️",
};

// ============ COMPONENTS ============

function StatCard({ title, value, change, color, icon, isPercentage, isCurrency }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-card-header">
        <span className="stat-card-icon">{icon}</span>
        <span className="stat-card-title">{title}</span>
      </div>
      <div className="stat-card-value" style={{ color }}>
        {isCurrency ? formatCurrency(value) : isPercentage ? `${value}%` : formatNumber(value)}
      </div>
      {typeof change !== "undefined" && (
        <div className={`stat-card-change ${change >= 0 ? "positive" : "negative"}`}>
          {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}

function DataTable({ columns, data, onRowClick, emptyMessage = "No data available" }) {
  if (!data || data.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }
  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx} onClick={() => onRowClick?.(row)}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row[col.key], row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children, size = "medium" }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${size}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>{Icons.close}</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

function Badge({ children, color, type = "default" }) {
  return (
    <span className={`badge badge-${type}`} style={{ backgroundColor: `${color}20`, color }}>
      {children}
    </span>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, required, options, multiple }) {
  return (
    <div className="form-group">
      <label>{label}{required && <span className="required">*</span>}</label>
      {type === "select" ? (
        <select value={value} onChange={onChange} multiple={multiple}>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} />
      )}
    </div>
  );
}

// ============ TAB COMPONENTS ============

function DashboardTab({ stats, schools, enrollmentData, activities, notifications }) {
  const maxEnrollment = Math.max(...enrollmentData.map((d) => d.students));

  return (
    <div className="tab-content">
      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="dashboard-panels">
        <section className="panel">
          <div className="panel-header">
            <h3>📊 System Overview</h3>
          </div>
          <div className="enrollment-chart">
            <div className="chart-header">
              <h4>Student Enrollment Trends</h4>
              <span className="chart-period">Last 6 Months</span>
            </div>
            <div className="chart-bars">
              {enrollmentData.map((item) => (
                <div className="chart-bar-container" key={item.month}>
                  <div className="chart-value">{formatNumber(item.students)}</div>
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: `${(item.students / maxEnrollment) * 100}%` }}>
                      <div className="chart-bar-shimmer"></div>
                    </div>
                  </div>
                  <div className="chart-label">{item.month}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>🔔 Recent Notifications</h3>
            <button className="btn-link">View All</button>
          </div>
          <div className="notifications-list">
            {notifications.slice(0, 4).map((notification) => (
              <div key={notification.id} className="notification-item" style={{ borderLeftColor: getNotificationColor(notification.type) }}>
                <div className="notification-icon">{Icons[notification.type]}</div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{notification.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>📋 System Activities</h3>
            <button className="btn-link">View All Logs</button>
          </div>
          <div className="activity-list">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-dot"></div>
                <div className="activity-content">
                  <div className="activity-action">{activity.action}</div>
                  <div className="activity-details">{activity.details}</div>
                  <div className="activity-meta">
                    <span>{activity.user}</span> • <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h3>🏫 Active Schools</h3>
            <button className="btn-link">Manage Schools</button>
          </div>
          <div className="schools-grid">
            {schools.slice(0, 4).map((school) => (
              <div key={school.id} className="school-card">
                <div className="school-icon">🏫</div>
                <div className="school-info">
                  <div className="school-name">{school.name}</div>
                  <div className="school-location">{school.location}</div>
                  <div className="school-stats">
                    <span>👨‍🎓 {formatNumber(school.students)}</span>
                    <span>👨‍🏫 {formatNumber(school.teachers)}</span>
                  </div>
                </div>
                <span className="school-status" style={{ color: getStatusColor(school.status) }}>{school.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function UserManagementTab({ users }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role.toLowerCase() === roleFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const columns = [
    { key: "name", label: "User", render: (val, row) => (
      <div className="user-cell">
        <div className="user-avatar">{row.name.split(" ").map((n) => n[0]).join("")}</div>
        <div className="user-info">
          <div className="user-name">{row.name}</div>
          <div className="user-email">{row.email}</div>
        </div>
      </div>
    )},
    { key: "role", label: "Role", render: (val) => <Badge color="#667eea">{val}</Badge> },
    { key: "school", label: "School/Organization" },
    { key: "status", label: "Status", render: (val) => <Badge type="status" color={getStatusColor(val)}>{val}</Badge> },
    { key: "lastActive", label: "Last Active" },
    { key: "actions", label: "Actions", render: (_, row) => (
      <div className="action-buttons">
        <button className="btn-icon" onClick={() => setSelectedUser(row)}>{Icons.edit}</button>
        <button className="btn-icon btn-danger">{Icons.delete}</button>
      </div>
    )},
  ];

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>User Management</h2>
        <div className="tab-actions">
          <button className="btn btn-secondary" onClick={() => {}}>{Icons.import} Import</button>
          <button className="btn btn-secondary" onClick={() => {}}>{Icons.export} Export</button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>{Icons.add} Add User</button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">{Icons.search}</span>
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="principal">Principal</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredUsers} />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User" size="large">
        <form className="modal-form">
          <div className="form-row">
            <Input label="Full Name" placeholder="Enter full name" required />
            <Input label="Email Address" type="email" placeholder="Enter email" required />
          </div>
          <div className="form-row">
            <Input label="Role" type="select" options={[
              { value: "admin", label: "Administrator" },
              { value: "principal", label: "Principal" },
              { value: "teacher", label: "Teacher" },
              { value: "student", label: "Student" },
              { value: "parent", label: "Parent" },
            ]} />
            <Input label="School" type="select" options={[
              { value: "1", label: "Greenwood Academy" },
              { value: "2", label: "Riverside High School" },
              { value: "3", label: "Mountain View Institute" },
            ]} />
          </div>
          <div className="form-row">
            <Input label="Initial Password" type="password" placeholder="Enter temporary password" required />
            <Input label="Confirm Password" type="password" placeholder="Confirm password" required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create User</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="Edit User" size="large">
        {selectedUser && (
          <form className="modal-form">
            <div className="form-row">
              <Input label="Full Name" value={selectedUser.name} />
              <Input label="Email Address" type="email" value={selectedUser.email} />
            </div>
            <div className="form-row">
              <Input label="Role" type="select" value={selectedUser.role} options={[{ value: selectedUser.role, label: selectedUser.role }]} />
              <Input label="Status" type="select" value={selectedUser.status} options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]} />
            </div>
            <div className="form-section">
              <h4>Quick Actions</h4>
              <div className="quick-actions">
                <button type="button" className="btn btn-secondary">{Icons.key} Reset Password</button>
                <button type="button" className="btn btn-secondary">{Icons.activity} View Activity</button>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function SchoolManagementTab({ schools }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);

  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) || school.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || school.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [schools, searchTerm, statusFilter]);

  const columns = [
    { key: "name", label: "School", render: (val, row) => (
      <div className="school-cell">
        <div className="school-icon-lg">🏫</div>
        <div className="school-info">
          <div className="school-name">{row.name}</div>
          <div className="school-principal">Principal: {row.principal}</div>
        </div>
      </div>
    )},
    { key: "location", label: "Location" },
    { key: "students", label: "Students", render: (val) => formatNumber(val) },
    { key: "teachers", label: "Teachers", render: (val) => formatNumber(val) },
    { key: "subscription", label: "Plan", render: (val) => <Badge color="#38b2ac">{val}</Badge> },
    { key: "status", label: "Status", render: (val) => <Badge type="status" color={getStatusColor(val)}>{val}</Badge> },
    { key: "actions", label: "Actions", render: (_, row) => (
      <div className="action-buttons">
        <button className="btn-icon" onClick={() => setSelectedSchool(row)}>{Icons.view}</button>
        <button className="btn-icon" onClick={() => setSelectedSchool(row)}>{Icons.edit}</button>
        <button className="btn-icon btn-danger">{Icons.delete}</button>
      </div>
    )},
  ];

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>School / Institution Management</h2>
        <div className="tab-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>{Icons.add} Add School</button>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <span className="search-icon">{Icons.search}</span>
          <input type="text" placeholder="Search schools..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="school-stats-summary">
        <div className="summary-card">
          <span className="summary-value">{schools.length}</span>
          <span className="summary-label">Total Schools</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{schools.filter((s) => s.status === "Active").length}</span>
          <span className="summary-label">Active</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{schools.reduce((acc, s) => acc + s.students, 0)}</span>
          <span className="summary-label">Total Students</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{schools.reduce((acc, s) => acc + s.teachers, 0)}</span>
          <span className="summary-label">Total Teachers</span>
        </div>
      </div>

      <DataTable columns={columns} data={filteredSchools} />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New School" size="large">
        <form className="modal-form">
          <div className="form-row">
            <Input label="School Name" placeholder="Enter school name" required />
            <Input label="School Code" placeholder="e.g., GRN-001" required />
          </div>
          <div className="form-row">
            <Input label="Location/Address" placeholder="Enter full address" required />
            <Input label="City" placeholder="Enter city" required />
          </div>
          <div className="form-row">
            <Input label="Principal Name" placeholder="Enter principal name" required />
            <Input label="Contact Email" type="email" placeholder="Enter contact email" required />
          </div>
          <div className="form-row">
            <Input label="Subscription Plan" type="select" options={[
              { value: "basic", label: "Basic - $500/month" },
              { value: "professional", label: "Professional - $1200/month" },
              { value: "enterprise", label: "Enterprise - $2500/month" },
            ]} />
            <Input label="Initial Status" type="select" value="Pending" options={[{ value: "Pending", label: "Pending" }, { value: "Active", label: "Active" }]} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create School</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function RolesPermissionsTab({ roles }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const permissionCategories = [
    { name: "Users", permissions: ["users.create", "users.read", "users.update", "users.delete"] },
    { name: "Schools", permissions: ["schools.create", "schools.read", "schools.update", "schools.delete"] },
    { name: "Students", permissions: ["students.create", "students.read", "students.update", "students.delete"] },
    { name: "Teachers", permissions: ["teachers.create", "teachers.read", "teachers.update", "teachers.delete"] },
    { name: "Classes", permissions: ["classes.create", "classes.read", "classes.update", "classes.delete"] },
    { name: "Subjects", permissions: ["subjects.create", "subjects.read", "subjects.update", "subjects.delete"] },
    { name: "Attendance", permissions: ["attendance.create", "attendance.read", "attendance.update", "attendance.delete"] },
    { name: "Results", permissions: ["results.create", "results.read", "results.update", "results.delete"] },
    { name: "Reports", permissions: ["reports.create", "reports.read", "reports.export"] },
    { name: "Finance", permissions: ["finance.read", "finance.manage", "finance.reports"] },
    { name: "Settings", permissions: ["settings.manage", "settings.roles", "settings.permissions"] },
  ];

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Role & Permission Management</h2>
        <div className="tab-actions">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>{Icons.add} Create Role</button>
        </div>
      </div>

      <div className="roles-content">
        <div className="roles-list">
          <h3>System Roles</h3>
          {roles.map((role) => (
            <div key={role.id} className={`role-card ${selectedRole?.id === role.id ? "selected" : ""}`} onClick={() => setSelectedRole(role)}>
              <div className="role-color" style={{ backgroundColor: role.color }}></div>
              <div className="role-info">
                <div className="role-name">{role.name}</div>
                <div className="role-description">{role.description}</div>
                <div className="role-meta">
                  <span>{role.userCount} users</span> • <span>{role.permissions.length} permissions</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="permissions-panel">
          {selectedRole ? (
            <>
              <div className="permissions-header">
                <h3>{selectedRole.name} Permissions</h3>
                <button className="btn btn-secondary">{Icons.edit} Edit Role</button>
              </div>
              <div className="permissions-grid">
                {permissionCategories.map((category) => (
                  <div key={category.name} className="permission-category">
                    <h4>{category.name}</h4>
                    <div className="permission-items">
                      {category.permissions.map((perm) => (
                        <label key={perm} className="permission-item">
                          <input type="checkbox" checked={selectedRole.permissions.includes("all") || selectedRole.permissions.includes(perm)} readOnly />
                          <span>{perm.split(".")[1]}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔐</div>
              <p>Select a role to view its permissions</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Role" size="medium">
        <form className="modal-form">
          <Input label="Role Name" placeholder="Enter role name" required />
          <Input label="Description" placeholder="Brief description of this role" />
          <div className="form-section">
            <h4>Base Permissions</h4>
            <p className="form-help">Start with existing permissions template</p>
            <Input label="Template" type="select" options={[
              { value: "empty", label: "Start from scratch" },
              { value: "teacher", label: "Based on Teacher" },
              { value: "admin", label: "Based on School Admin" },
            ]} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Role</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function AcademicManagementTab({ classes, subjects }) {
  const [activeSubTab, setActiveSubTab] = useState("classes");
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);

  const classColumns = [
    { key: "name", label: "Class", render: (val) => <Badge color="#667eea">{val}</Badge> },
    { key: "school", label: "School" },
    { key: "students", label: "Students" },
    { key: "subjects", label: "Subjects" },
    { key: "teacher", label: "Class Teacher" },
    { key: "actions", label: "Actions", render: () => (
      <div className="action-buttons">
        <button className="btn-icon">{Icons.edit}</button>
        <button className="btn-icon btn-danger">{Icons.delete}</button>
      </div>
    )},
  ];

  const subjectColumns = [
    { key: "name", label: "Subject", render: (val, row) => (
      <div className="subject-cell">
        <span className="subject-code">{row.code}</span>
        <span className="subject-name">{val}</span>
      </div>
    )},
    { key: "classes", label: "Classes" },
    { key: "teachers", label: "Teachers" },
    { key: "school", label: "Applies To" },
    { key: "actions", label: "Actions", render: () => (
      <div className="action-buttons">
        <button className="btn-icon">{Icons.edit}</button>
        <button className="btn-icon btn-danger">{Icons.delete}</button>
      </div>
    )},
  ];

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Academic Management</h2>
        <div className="tab-actions">
          <button className="btn btn-primary" onClick={() => activeSubTab === "classes" ? setShowAddClassModal(true) : setShowAddSubjectModal(true)}>
            {Icons.add} Add {activeSubTab === "classes" ? "Class" : "Subject"}
          </button>
        </div>
      </div>

      <div className="sub-tabs">
        <button className={`sub-tab ${activeSubTab === "classes" ? "active" : ""}`} onClick={() => setActiveSubTab("classes")}>
          📚 Classes ({classes.length})
        </button>
        <button className={`sub-tab ${activeSubTab === "subjects" ? "active" : ""}`} onClick={() => setActiveSubTab("subjects")}>
          📖 Subjects ({subjects.length})
        </button>
        <button className={`sub-tab ${activeSubTab === "sessions" ? "active" : ""}`} onClick={() => setActiveSubTab("sessions")}>
          📅 Academic Sessions
        </button>
      </div>

      {activeSubTab === "classes" && <DataTable columns={classColumns} data={classes} />}
      {activeSubTab === "subjects" && <DataTable columns={subjectColumns} data={subjects} />}
      {activeSubTab === "sessions" && (
        <div className="academic-sessions">
          <div className="session-card">
            <div className="session-year">2023 - 2024</div>
            <div className="session-status active">Current</div>
            <div className="session-dates">Aug 15, 2023 - May 30, 2024</div>
            <div className="session-terms">
              <span className="term completed">Term 1: Aug - Dec</span>
              <span className="term active">Term 2: Jan - May</span>
            </div>
          </div>
          <div className="session-card">
            <div className="session-year">2024 - 2025</div>
            <div className="session-status">Upcoming</div>
            <div className="session-dates">Aug 15, 2024 - May 30, 2025</div>
            <div className="session-actions">
              <button className="btn btn-secondary">{Icons.edit} Configure</button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showAddClassModal} onClose={() => setShowAddClassModal(false)} title="Add New Class" size="medium">
        <form className="modal-form">
          <div className="form-row">
            <Input label="Class Name" placeholder="e.g., Grade 10-A" required />
            <Input label="School" type="select" options={[{ value: "1", label: "Greenwood Academy" }, { value: "2", label: "Riverside High School" }]} />
          </div>
          <div className="form-row">
            <Input label="Class Teacher" type="select" options={[{ value: "1", label: "Select Teacher" }]} />
            <Input label="Maximum Students" type="number" placeholder="40" />
          </div>
          <Input label="Subjects" type="select" multiple options={[
            { value: "math", label: "Mathematics" },
            { value: "eng", label: "English" },
            { value: "sci", label: "Science" },
          ]} />
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddClassModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Class</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAddSubjectModal} onClose={() => setShowAddSubjectModal(false)} title="Add New Subject" size="medium">
        <form className="modal-form">
          <div className="form-row">
            <Input label="Subject Name" placeholder="e.g., Mathematics" required />
            <Input label="Subject Code" placeholder="e.g., MATH101" required />
          </div>
          <Input label="Description" placeholder="Brief description" />
          <Input label="Assigned Schools" type="select" multiple options={[
            { value: "all", label: "All Schools" },
            { value: "1", label: "Greenwood Academy" },
            { value: "2", label: "Riverside High School" },
          ]} />
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddSubjectModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Subject</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FinanceBillingTab({ financeData }) {
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredData = useMemo(() => {
    return financeData.filter((item) => {
      const matchesPlan = planFilter === "all" || item.plan.toLowerCase() === planFilter.toLowerCase();
      const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesPlan && matchesStatus;
    });
  }, [financeData, planFilter, statusFilter]);

  const totalRevenue = financeData.reduce((acc, item) => acc + item.amount, 0);
  const paidRevenue = financeData.filter((item) => item.status === "Paid").reduce((acc, item) => acc + item.amount, 0);
  const pendingRevenue = financeData.filter((item) => item.status === "Pending").reduce((acc, item) => acc + item.amount, 0);
  const overdueRevenue = financeData.filter((item) => item.status === "Overdue").reduce((acc, item) => acc + item.amount, 0);

  const columns = [
    { key: "school", label: "School", render: (val) => <span className="school-name-cell">{val}</span> },
    { key: "plan", label: "Plan", render: (val) => <Badge color="#38b2ac">{val}</Badge> },
    { key: "users", label: "Users", render: (val) => formatNumber(val) },
    { key: "amount", label: "Amount", render: (val) => <span className="amount-cell">{formatCurrency(val)}</span> },
    { key: "status", label: "Status", render: (val) => <Badge type="status" color={getStatusColor(val)}>{val}</Badge> },
    { key: "nextBilling", label: "Next Billing" },
    { key: "actions", label: "Actions", render: () => (
      <div className="action-buttons">
        <button className="btn-icon">{Icons.view}</button>
        <button className="btn-icon">{Icons.edit}</button>
      </div>
    )},
  ];

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Finance & Billing Control</h2>
        <div className="tab-actions">
          <button className="btn btn-secondary">{Icons.reports} Generate Report</button>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>{Icons.add} Add Subscription</button>
        </div>
      </div>

      <div className="finance-summary">
        <div className="finance-card total">
          <div className="finance-icon">💰</div>
          <div className="finance-info">
            <div className="finance-value">{formatCurrency(totalRevenue)}</div>
            <div className="finance-label">Total Monthly Revenue</div>
          </div>
        </div>
        <div className="finance-card paid">
          <div className="finance-icon">✅</div>
          <div className="finance-info">
            <div className="finance-value">{formatCurrency(paidRevenue)}</div>
            <div className="finance-label">Collected</div>
          </div>
        </div>
        <div className="finance-card pending">
          <div className="finance-icon">⏳</div>
          <div className="finance-info">
            <div className="finance-value">{formatCurrency(pendingRevenue)}</div>
            <div className="finance-label">Pending</div>
          </div>
        </div>
        <div className="finance-card overdue">
          <div className="finance-icon">⚠️</div>
          <div className="finance-info">
            <div className="finance-value">{formatCurrency(overdueRevenue)}</div>
            <div className="finance-label">Overdue</div>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
          <option value="all">All Plans</option>
          <option value="basic">Basic</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <DataTable columns={columns} data={filteredData} />

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Subscription" size="medium">
        <form className="modal-form">
          <Input label="School" type="select" options={[
            { value: "1", label: "Greenwood Academy" },
            { value: "2", label: "Riverside High School" },
          ]} />
          <Input label="Plan" type="select" options={[
            { value: "basic", label: "Basic - $500/month" },
            { value: "professional", label: "Professional - $1200/month" },
            { value: "enterprise", label: "Enterprise - $2500/month" },
          ]} />
          <Input label="Billing Cycle" type="select" options={[
            { value: "monthly", label: "Monthly" },
            { value: "quarterly", label: "Quarterly" },
            { value: "yearly", label: "Yearly" },
          ]} />
          <Input label="Start Date" type="date" />
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Subscription</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ReportsAnalyticsTab({ reports, stats }) {
  const [reportType, setReportType] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesType = reportType === "all" || report.type.toLowerCase() === reportType.toLowerCase();
      return matchesType;
    });
  }, [reports, reportType]);

  const reportColumns = [
    { key: "name", label: "Report Name", render: (val) => <span className="report-name">{val}</span> },
    { key: "type", label: "Type", render: (val) => <Badge color="#667eea">{val}</Badge> },
    { key: "generated", label: "Generated" },
    { key: "downloads", label: "Downloads", render: (val) => formatNumber(val) },
    { key: "actions", label: "Actions", render: () => (
      <div className="action-buttons">
        <button className="btn btn-small">{Icons.view} View</button>
        <button className="btn btn-small btn-secondary">{Icons.export} Export</button>
      </div>
    )},
  ];

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Reports & Analytics</h2>
        <div className="tab-actions">
          <button className="btn btn-primary">{Icons.add} Generate New Report</button>
        </div>
      </div>

      <div className="analytics-overview">
        <div className="analytics-card">
          <h3>📊 Quick Analytics</h3>
          <div className="analytics-metrics">
            <div className="metric">
              <span className="metric-value">{formatNumber(stats[1]?.value || 0)}</span>
              <span className="metric-label">Total Students</span>
              <span className="metric-change positive">▲ {stats[1]?.change || 0}%</span>
            </div>
            <div className="metric">
              <span className="metric-value">{formatNumber(stats[2]?.value || 0)}</span>
              <span className="metric-label">Total Teachers</span>
              <span className="metric-change positive">▲ {stats[2]?.change || 0}%</span>
            </div>
            <div className="metric">
              <span className="metric-value">{stats[4]?.value || 0}%</span>
              <span className="metric-label">System Uptime</span>
              <span className="metric-change positive">▲ {stats[4]?.change || 0}%</span>
            </div>
            <div className="metric">
              <span className="metric-value">{formatNumber(stats[5]?.value || 0)}</span>
              <span className="metric-label">Revenue (MTD)</span>
              <span className="metric-change positive">▲ {stats[5]?.change || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="filters-bar">
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="academic">Academic</option>
          <option value="attendance">Attendance</option>
          <option value="financial">Financial</option>
          <option value="system">System</option>
          <option value="hr">HR</option>
        </select>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
          <option value="all">All Time</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">This Year</option>
        </select>
        <button className="btn btn-secondary">{Icons.export} Export All</button>
      </div>

      <DataTable columns={reportColumns} data={filteredReports} />

      <div className="report-templates">
        <h3>Quick Report Templates</h3>
        <div className="template-grid">
          <button className="template-card">
            <span className="template-icon">📊</span>
            <span className="template-name">Student Performance</span>
            <span className="template-desc">Comprehensive student grades and progress</span>
          </button>
          <button className="template-card">
            <span className="template-icon">📅</span>
            <span className="template-name">Attendance Summary</span>
            <span className="template-desc">Daily and monthly attendance statistics</span>
          </button>
          <button className="template-card">
            <span className="template-icon">💰</span>
            <span className="template-name">Financial Report</span>
            <span className="template-desc">Revenue, expenses, and projections</span>
          </button>
          <button className="template-card">
            <span className="template-icon">👥</span>
            <span className="template-name">User Activity</span>
            <span className="template-desc">System usage and user engagement</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function NotificationsTab({ notifications }) {
  const [showCompose, setShowCompose] = useState(false);
  const [recipientType, setRecipientType] = useState("all");
  const [messageType, setMessageType] = useState("announcement");

  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>Notifications & Communication</h2>
        <div className="tab-actions">
          <button className="btn btn-secondary">{Icons.email} Email Templates</button>
          <button className="btn btn-primary" onClick={() => setShowCompose(true)}>{Icons.add} Compose Message</button>
        </div>
      </div>

      <div className="filters-bar">
        <select value={recipientType} onChange={(e) => setRecipientType(e.target.value)}>
          <option value="all">All Notifications</option>
          <option value="info">Info</option>
          <option value="warning">Warnings</option>
          <option value="success">Success</option>
          <option value="alert">Alerts</option>
        </select>
      </div>

      <div className="notifications-panel">
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div key={notification.id} className="notification-card" style={{ borderLeftColor: getNotificationColor(notification.type) }}>
              <div className="notification-header">
                <span className="notification-type">{notification.type.toUpperCase()}</span>
                <span className="notification-time">{notification.time}</span>
              </div>
              <h4 className="notification-title">{notification.title}</h4>
              <p className="notification-message">{notification.message}</p>
              <div className="notification-footer">
                <span className="notification-recipients">To: {notification.recipients}</span>
                <div className="notification-actions">
                  <button className="btn btn-small">{Icons.view} View</button>
                  <button className="btn btn-small btn-secondary">{Icons.reports} Resend</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="broadcast-panel">
          <h3>📢 Quick Broadcast</h3>
          <div className="broadcast-options">
            <button className={`broadcast-btn ${messageType === "announcement" ? "active" : ""}`} onClick={() => setMessageType("announcement")}>
              📢 Announcement
            </button>
            <button className={`broadcast-btn ${messageType === "alert" ? "active" : ""}`} onClick={() => setMessageType("alert")}>
              🚨 Alert
            </button>
            <button className={`broadcast-btn ${messageType === "reminder" ? "active" : ""}`} onClick={() => setMessageType("reminder")}>
              ⏰ Reminder
            </button>
          </div>
          <div className="recipient-selector">
            <h4>Select Recipients</h4>
            <div className="recipient-options">
              <label className="recipient-option">
                <input type="checkbox" defaultChecked />
                <span>All Schools</span>
              </label>
              <label className="recipient-option">
                <input type="checkbox" />
                <span>All Administrators</span>
              </label>
              <label className="recipient-option">
                <input type="checkbox" />
                <span>All Teachers</span>
              </label>
              <label className="recipient-option">
                <input type="checkbox" />
                <span>All Students</span>
              </label>
              <label className="recipient-option">
                <input type="checkbox" />
                <span>All Parents</span>
              </label>
            </div>
          </div>
          <textarea className="broadcast-message" placeholder="Type your message here..." rows={4}></textarea>
          <div className="broadcast-actions">
            <button className="btn btn-primary">Send Broadcast</button>
          </div>
        </div>
      </div>

      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="Compose Message" size="large">
        <form className="modal-form">
          <div className="form-row">
            <Input label="Message Type" type="select" value={messageType} options={[
              { value: "announcement", label: "Announcement" },
              { value: "alert", label: "Alert" },
              { value: "reminder", label: "Reminder" },
              { value: "update", label: "System Update" },
            ]} />
            <Input label="Priority" type="select" options={[
              { value: "normal", label: "Normal" },
              { value: "high", label: "High" },
              { value: "urgent", label: "Urgent" },
            ]} />
          </div>
          <Input label="Subject" placeholder="Enter message subject" required />
          <div className="form-group">
            <label>Recipients</label>
            <div className="recipient-checkboxes">
              <label><input type="checkbox" /> All Schools</label>
              <label><input type="checkbox" /> School Admins</label>
              <label><input type="checkbox" /> Teachers</label>
              <label><input type="checkbox" /> Students</label>
              <label><input type="checkbox" /> Parents</label>
            </div>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea rows={6} placeholder="Enter your message content..."></textarea>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" /> Send as Email
            </label>
            <label className="checkbox-label">
              <input type="checkbox" /> Send as SMS
            </label>
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked /> Send as Push Notification
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCompose(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// ============ MAIN COMPONENT ============

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState([]);
  const [schools, setSchools] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [finance, setFinance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [activities, setActivities] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStats(generateSuperAdminStats());
      setSchools(generateSchoolsData());
      setUsers(generateUsersData());
      setRoles(generateRolesData());
      setClasses(generateClassesData());
      setSubjects(generateSubjectsData());
      setFinance(generateFinanceData());
      setNotifications(generateNotificationsData());
      setReports(generateReportsData());
      setActivities(generateActivityLogs());
      setEnrollmentData(generateEnrollmentData());

      setLoading(false);
    };

    loadData();
  }, []);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Icons.dashboard },
    { id: "users", label: "User Management", icon: Icons.users },
    { id: "schools", label: "Schools", icon: Icons.school },
    { id: "roles", label: "Roles & Permissions", icon: Icons.roles },
    { id: "academic", label: "Academic", icon: Icons.academic },
    { id: "finance", label: "Finance", icon: Icons.finance },
    { id: "reports", label: "Reports", icon: Icons.reports },
    { id: "notifications", label: "Notifications", icon: Icons.notifications },
  ];

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action}`);
  };

  if (loading) {
    return (
      <div className="superadmin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading Superadmin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      <div className="superadmin-header">
        <div className="header-content">
          <div className="school-logo-container">
            <img src="/images/schoolLogo.jpeg" alt="School Logo" className="school-logo-img" />
            <span className="school-logo-text" style={{color: 'white'}}>GEOZIIE INTERNATIONAL SCHOOL</span>
          </div>
          <div className="header-title">
            <p>Comprehensive system management and oversight</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => handleQuickAction("System Settings")}>
              ⚙️ Settings
            </button>
            <button className="btn btn-primary" onClick={() => handleQuickAction("View Logs")}>
              📋 Activity Logs
            </button>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => setActiveTab("schools")}>
          <span className="qa-icon">🏫</span>
          <span className="qa-label">Add School</span>
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab("users")}>
          <span className="qa-icon">👤</span>
          <span className="qa-label">Add User</span>
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab("reports")}>
          <span className="qa-icon">📊</span>
          <span className="qa-label">Generate Report</span>
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab("notifications")}>
          <span className="qa-icon">📢</span>
          <span className="qa-label">Broadcast</span>
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab("finance")}>
          <span className="qa-icon">💰</span>
          <span className="qa-label">Invoices</span>
        </button>
        <button className="quick-action-btn" onClick={() => setActiveTab("academic")}>
          <span className="qa-icon">📚</span>
          <span className="qa-label">Academic Setup</span>
        </button>
      </div>

      <div className="tabs-container">
        <div className="tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="tab-panel">
          {activeTab === "dashboard" && (
            <DashboardTab
              stats={stats}
              schools={schools}
              enrollmentData={enrollmentData}
              activities={activities}
              notifications={notifications}
            />
          )}
          {activeTab === "users" && <UserManagementTab users={users} />}
          {activeTab === "schools" && <SchoolManagementTab schools={schools} />}
          {activeTab === "roles" && <RolesPermissionsTab roles={roles} />}
          {activeTab === "academic" && <AcademicManagementTab classes={classes} subjects={subjects} />}
          {activeTab === "finance" && <FinanceBillingTab financeData={finance} />}
          {activeTab === "reports" && <ReportsAnalyticsTab reports={reports} stats={stats} />}
          {activeTab === "notifications" && <NotificationsTab notifications={notifications} />}
        </div>
      </div>
    </div>
  );
}
