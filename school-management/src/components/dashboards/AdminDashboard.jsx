import React, { useState, useEffect } from "react";
import {
  generateStats,
  generateRecentStudents,
  generateAttendance,
  formatNumber,
  formatDate,
  getStatusColor,
} from "../../lib/dashboardData";
import QuickActions from "../QuickActions";
import Notifications from "../Notifications";
import UpcomingEvents from "../UpcomingEvents";
import TopPerformers from "../TopPerformers";
import "../Dashboard.css";
import "./DashboardStyles.css";

function StatCard({ title, value, change, color, icon, trend }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-title">{title}</div>
      <div className="stat-card-value">{formatNumber(value)}</div>
      {typeof change !== "undefined" && (
        <div
          className={`stat-card-change ${
            change >= 0 ? "positive" : "negative"
          }`}
        >
          {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
}

function RecentTable({ rows = [] }) {
  return (
    <table className="recent-table">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Class</th>
          <th>Registration Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((student) => (
          <tr key={student.id}>
            <td>
              <div className="student-info">
                <div className="student-avatar">{student.avatar}</div>
                <span className="student-name">{student.name}</span>
              </div>
            </td>
            <td>{student.className}</td>
            <td>{formatDate(student.date)}</td>
            <td>
              <span
                className="status-badge"
                style={{
                  backgroundColor: `${getStatusColor(student.status)}20`,
                  color: getStatusColor(student.status),
                }}
              >
                {student.status}
              </span>
            </td>
            <td>
              <button className="view-btn">View</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Student Form Modal Component
function StudentFormModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    class: "",
    phone: "",
    enrollmentDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      name: "",
      email: "",
      class: "",
      phone: "",
      enrollmentDate: "",
    });
    onClose();
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      email: "",
      class: "",
      phone: "",
      enrollmentDate: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Student</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter student's full name"
            />
          </div>

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="Enter student's email"
            />
          </div>

          <div className="form-group">
            <label>Class/Grade:</label>
            <select
              name="class"
              value={formData.class}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a class</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label>Enrollment Date:</label>
            <input
              type="date"
              name="enrollmentDate"
              value={formData.enrollmentDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit">Add Student</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add this after StudentFormModal component
function CreateClassModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    className: "",
    gradeLevel: "",
    section: "",
    teacher: "",
    subject: "",
    room: "",
    schedule: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      className: "",
      gradeLevel: "",
      section: "",
      teacher: "",
      subject: "",
      room: "",
      schedule: "",
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      className: "",
      gradeLevel: "",
      section: "",
      teacher: "",
      subject: "",
      room: "",
      schedule: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Class</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Class Name:</label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleInputChange}
              required
              placeholder="e.g., Mathematics, Science, English"
            />
          </div>

          <div className="form-group">
            <label>Grade Level:</label>
            <select
              name="gradeLevel"
              value={formData.gradeLevel}
              onChange={handleInputChange}
              required
            >
              <option value="">Select grade level</option>
              <option value="Kindergarten">Kindergarten</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div className="form-group">
            <label>Section:</label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleInputChange}
              required
              placeholder="e.g., A, B, C, D"
            />
          </div>

          <div className="form-group">
            <label>Teacher:</label>
            <input
              type="text"
              name="teacher"
              value={formData.teacher}
              onChange={handleInputChange}
              required
              placeholder="Enter teacher's name"
            />
          </div>

          <div className="form-group">
            <label>Subject:</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Enter subject name"
            />
          </div>

          <div className="form-group">
            <label>Room Number:</label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleInputChange}
              placeholder="e.g., Room 101"
            />
          </div>

          <div className="form-group">
            <label>Schedule:</label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={handleInputChange}
              placeholder="e.g., Mon-Wed-Fri 9:00-10:00 AM"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit">Create Class</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Generate Report Modal Component
function GenerateReportModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    reportType: "",
    dateRange: "",
    format: "",
    includeCharts: false,
    emailReport: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      reportType: "",
      dateRange: "",
      format: "",
      includeCharts: false,
      emailReport: false,
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      reportType: "",
      dateRange: "",
      format: "",
      includeCharts: false,
      emailReport: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Generate Report</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Report Type:</label>
            <select
              name="reportType"
              value={formData.reportType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select report type</option>
              <option value="student-performance">Student Performance</option>
              <option value="attendance-summary">Attendance Summary</option>
              <option value="financial-report">Financial Report</option>
              <option value="class-progress">Class Progress</option>
              <option value="teacher-performance">Teacher Performance</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date Range:</label>
            <select
              name="dateRange"
              value={formData.dateRange}
              onChange={handleInputChange}
              required
            >
              <option value="">Select date range</option>
              <option value="last-week">Last Week</option>
              <option value="last-month">Last Month</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="form-group">
            <label>Format:</label>
            <select
              name="format"
              value={formData.format}
              onChange={handleInputChange}
              required
            >
              <option value="">Select format</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="html">Web Page</option>
            </select>
          </div>

          <div className="form-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="includeCharts"
                checked={formData.includeCharts}
                onChange={handleInputChange}
              />
              Include Charts and Graphs
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="emailReport"
                checked={formData.emailReport}
                onChange={handleInputChange}
              />
              Email me the report
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit">Generate Report</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Manage Fees Modal Component
function ManageFeesModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    studentId: "",
    feeType: "",
    amount: "",
    dueDate: "",
    paymentStatus: "pending",
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      studentId: "",
      feeType: "",
      amount: "",
      dueDate: "",
      paymentStatus: "pending",
      description: "",
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      studentId: "",
      feeType: "",
      amount: "",
      dueDate: "",
      paymentStatus: "pending",
      description: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Manage Fees</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student ID/Name:</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              required
              placeholder="Enter student ID or name"
            />
          </div>

          <div className="form-group">
            <label>Fee Type:</label>
            <select
              name="feeType"
              value={formData.feeType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select fee type</option>
              <option value="tuition">Tuition Fee</option>
              <option value="registration">Registration Fee</option>
              <option value="exam">Examination Fee</option>
              <option value="transport">Transport Fee</option>
              <option value="hostel">Hostel Fee</option>
              <option value="library">Library Fee</option>
              <option value="sports">Sports Fee</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label>Amount ($):</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Due Date:</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Payment Status:</label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleInputChange}
              required
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional notes about the fee"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit">Save Fee Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// View Attendance Modal Component
function ViewAttendanceModal({ isOpen, onClose }) {
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedClass, setSelectedClass] = useState("");

  // Mock attendance data
  useEffect(() => {
    if (isOpen) {
      const mockData = [
        {
          id: 1,
          name: "Grade 1 - Section A",
          present: 22,
          total: 25,
          percentage: 88,
        },
        {
          id: 2,
          name: "Grade 2 - Section B",
          present: 18,
          total: 20,
          percentage: 90,
        },
        {
          id: 3,
          name: "Grade 3 - Section A",
          present: 24,
          total: 28,
          percentage: 86,
        },
        {
          id: 4,
          name: "Grade 4 - Section C",
          present: 20,
          total: 22,
          percentage: 91,
        },
        {
          id: 5,
          name: "Grade 5 - Section A",
          present: 19,
          total: 21,
          percentage: 90,
        },
      ];
      setAttendanceData(mockData);
    }
  }, [isOpen]);

  const handleClose = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedClass("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "800px" }}>
        <div className="modal-header">
          <h2>View Attendance</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="attendance-filters">
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">All Classes</option>
              <option value="grade1">Grade 1</option>
              <option value="grade2">Grade 2</option>
              <option value="grade3">Grade 3</option>
              <option value="grade4">Grade 4</option>
              <option value="grade5">Grade 5</option>
            </select>
          </div>
        </div>

        <div className="attendance-summary">
          <h3>Attendance Summary for {selectedDate}</h3>
          <div className="attendance-stats">
            {attendanceData.map((classData) => (
              <div key={classData.id} className="attendance-stat-card">
                <div className="attendance-class-name">{classData.name}</div>
                <div className="attendance-numbers">
                  <span className="present-count">{classData.present}</span>
                  <span className="total-count">/ {classData.total}</span>
                </div>
                <div className="attendance-percentage">
                  {classData.percentage}%
                </div>
                <div className="attendance-bar">
                  <div
                    className="attendance-fill"
                    style={{
                      width: `${classData.percentage}%`,
                      backgroundColor:
                        classData.percentage >= 90
                          ? "#48bb78"
                          : classData.percentage >= 80
                          ? "#ed8936"
                          : "#f56565",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleClose}>
            Close
          </button>
          <button type="button" className="btn-primary">
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// Send Notifications Modal Component
function SendNotificationsModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    notificationType: "",
    targetAudience: "",
    title: "",
    message: "",
    scheduleSend: false,
    sendDate: "",
    sendTime: "",
    priority: "normal",
    includeEmail: false,
    includeSMS: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      notificationType: "",
      targetAudience: "",
      title: "",
      message: "",
      scheduleSend: false,
      sendDate: "",
      sendTime: "",
      priority: "normal",
      includeEmail: false,
      includeSMS: false,
    });
    onClose();
  };

  const handleClose = () => {
    setFormData({
      notificationType: "",
      targetAudience: "",
      title: "",
      message: "",
      scheduleSend: false,
      sendDate: "",
      sendTime: "",
      priority: "normal",
      includeEmail: false,
      includeSMS: false,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: "700px" }}>
        <div className="modal-header">
          <h2>Send Notifications</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Notification Type:</label>
            <select
              name="notificationType"
              value={formData.notificationType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select type</option>
              <option value="announcement">General Announcement</option>
              <option value="reminder">Reminder</option>
              <option value="alert">Alert</option>
              <option value="update">System Update</option>
              <option value="event">Event Notification</option>
              <option value="academic">Academic Update</option>
            </select>
          </div>

          <div className="form-group">
            <label>Target Audience:</label>
            <select
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleInputChange}
              required
            >
              <option value="">Select audience</option>
              <option value="all">All Users</option>
              <option value="students">Students Only</option>
              <option value="teachers">Teachers Only</option>
              <option value="parents">Parents Only</option>
              <option value="staff">Staff Only</option>
              <option value="specific-class">Specific Class</option>
              <option value="specific-grade">Specific Grade</option>
            </select>
          </div>

          <div className="form-group">
            <label>Priority:</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter notification title"
              maxLength="100"
            />
          </div>

          <div className="form-group">
            <label>Message:</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              placeholder="Enter your notification message here..."
              rows="5"
              maxLength="1000"
            />
            <div className="char-count">
              {formData.message.length}/1000 characters
            </div>
          </div>

          <div className="form-checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="scheduleSend"
                checked={formData.scheduleSend}
                onChange={handleInputChange}
              />
              Schedule for later
            </label>
          </div>

          {formData.scheduleSend && (
            <div className="form-row">
              <div className="form-group">
                <label>Send Date:</label>
                <input
                  type="date"
                  name="sendDate"
                  value={formData.sendDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="form-group">
                <label>Send Time:</label>
                <input
                  type="time"
                  name="sendTime"
                  value={formData.sendTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          )}

          <div className="notification-channels">
            <h4>Delivery Channels</h4>
            <div className="form-checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="includeEmail"
                  checked={formData.includeEmail}
                  onChange={handleInputChange}
                />
                Send via Email
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="includeSMS"
                  checked={formData.includeSMS}
                  onChange={handleInputChange}
                />
                Send via SMS
              </label>
              <label
                className="checkbox-label"
                style={{ color: "#4299e1", fontWeight: "bold" }}
              >
                <input type="checkbox" checked readOnly disabled />
                In-app Notification (Always enabled)
              </label>
            </div>
          </div>

          <div className="notification-preview">
            <h4>Preview</h4>
            <div className="preview-card">
              <div className="preview-header">
                <strong>{formData.title || "Notification Title"}</strong>
                <span
                  className={`priority-badge priority-${formData.priority}`}
                >
                  {formData.priority}
                </span>
              </div>
              <div className="preview-message">
                {formData.message ||
                  "Your notification message will appear here..."}
              </div>
              <div className="preview-footer">
                <small>
                  Sent: {formData.scheduleSend ? "Scheduled" : "Now"}
                </small>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {formData.scheduleSend ? "Schedule Notification" : "Send Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main AdminDashboard Component - ONLY ONE OF THESE!
export default function AdminDashboard() {
  const [stats, setStats] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for the student form modal
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showFeesForm, setShowFeesForm] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStats(generateStats());
      setRecentStudents(generateRecentStudents());
      setAttendance(generateAttendance());
      setLoading(false);
    };

    loadData();
  }, []);

  // Handle quick action clicks
  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action.label}`, action);

    // Handle different quick actions
    switch (action.action) {
      case "addStudent":
        setShowStudentForm(true);
        break;
      case "createClass":
        setShowClassForm(true);
        break;
      case "generateReport":
        setShowReportForm(true);
        break;
      case "manageFees":
        setShowFeesForm(true);
        break;
      case "viewAttendance":
        setShowAttendanceModal(true);
        break;
      case "sendNotifications":
        setShowNotificationsModal(true);
        break;
      default:
        console.log("Unknown action:", action);
    }
  };

  // Handle form submission
  const handleAddStudent = (studentData) => {
    console.log("New student data:", studentData);
    alert(`Student ${studentData.name} added successfully!`);
  };

  const handleCreateClass = (classData) => {
    console.log("New class data:", classData);
    alert(`Class "${classData.className}" created successfully!`);
  };

  const handleGenerateReport = (reportData) => {
    console.log("Report configuration:", reportData);
    alert(`Report generation started! You will receive it shortly.`);
  };

  const handleManageFees = (feeData) => {
    console.log("Fee data:", feeData);
    alert(`Fee record saved successfully for student ${feeData.studentId}`);
  };
  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <div className="dashboard-sub">Loading...</div>
        </div>
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      </div>
    );
  }
  const handleSendNotifications = (notificationData) => {
    console.log("Notification data:", notificationData);

    const recipientCount =
      notificationData.targetAudience === "all"
        ? "all users"
        : notificationData.targetAudience;
    const deliveryMethod = [];

    if (notificationData.includeEmail) deliveryMethod.push("email");
    if (notificationData.includeSMS) deliveryMethod.push("SMS");
    deliveryMethod.push("in-app");

    if (notificationData.scheduleSend) {
      alert(
        `Notification scheduled for ${notificationData.sendDate} at ${
          notificationData.sendTime
        }! It will be sent to ${recipientCount} via ${deliveryMethod.join(
          ", "
        )}.`
      );
    } else {
      alert(
        `Notification sent successfully to ${recipientCount} via ${deliveryMethod.join(
          ", "
        )}!`
      );
    }
  };
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>School Management Dashboard</h2>
        <div className="dashboard-sub">
          Welcome back! Here's what's happening in your school today.
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onActionClick={handleQuickAction} />

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={showStudentForm}
        onClose={() => setShowStudentForm(false)}
        onSubmit={handleAddStudent}
      />
      <CreateClassModal
        isOpen={showClassForm}
        onClose={() => setShowClassForm(false)}
        onSubmit={handleCreateClass}
      />
      <GenerateReportModal
        isOpen={showReportForm}
        onClose={() => setShowReportForm(false)}
        onSubmit={handleGenerateReport}
      />
      <ManageFeesModal
        isOpen={showFeesForm}
        onClose={() => setShowFeesForm(false)}
        onSubmit={handleManageFees}
      />
      <ViewAttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
      />
      <SendNotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        onSubmit={handleSendNotifications}
      />

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Main Panels */}
      <div className="panels">
        {/* Recent Registrations */}
        <section className="panel recent-registrations">
          <h3>Recent Student Registrations</h3>
          <RecentTable rows={recentStudents} />
        </section>

        {/* Attendance */}
        <section className="panel attendance-panel">
          <h3>Today's Attendance</h3>
          <div className="attendance-list">
            {attendance.map((classData) => (
              <div className="attendance-row" key={classData.name}>
                <div className="attendance-meta">
                  <strong>Grade {classData.name}</strong>
                  <span>{classData.pct}%</span>
                </div>
                <div className="attendance-details">
                  <span className="attendance-count">
                    {classData.present}/{classData.total} students
                  </span>
                </div>
                <div className="attendance-bar">
                  <div
                    className="attendance-fill"
                    style={{
                      width: `${classData.pct}%`,
                      backgroundColor:
                        classData.pct >= 90
                          ? "#48bb78"
                          : classData.pct >= 80
                          ? "#ed8936"
                          : "#f56565",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <UpcomingEvents />

        {/* Notifications */}
        <Notifications />

        {/* Top Performers */}
        <TopPerformers />
      </div>
    </div>
  );
}
