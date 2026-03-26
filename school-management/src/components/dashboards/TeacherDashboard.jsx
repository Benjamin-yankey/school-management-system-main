import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import "../Dashboard.css";
import "./DashboardStyles.css";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  CheckSquare,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

const TeacherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [studentsData, statsData] = await Promise.all([
          api.getStudents(),
          api.getDashboardStats()
        ]);
        
        setStudents(Array.isArray(studentsData) ? studentsData : []);
        
        setStats([
          { title: "My Classes", value: 0, change: 0, color: "#10b981", icon: "📚" },
          {
            title: "Total Students",
            value: studentsData.length || 0,
            change: 0,
            color: "#3b82f6",
            icon: "👥",
          },
          {
            title: "Pending Grades",
            value: 0,
            change: 0,
            color: "#f59e0b",
            icon: "📝",
          },
          {
            title: "Upcoming Meetings",
            value: 0,
            change: 0,
            color: "#8b5cf6",
            icon: "👨‍👩‍👧‍👦",
          },
        ]);
      } catch (err) {
        console.error("Failed to load teacher dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const myClasses = [
    {
      name: "Mathematics 10-A",
      students: 32,
      attendance: 94,
      nextClass: "10:00 AM",
    },
  ];

  const todaysSchedule = [
    {
      time: "09:00",
      subject: "Mathematics 10-A",
      room: "Room 101",
      duration: "50 min",
    },
  ];

  const pendingGrades = [];
  const upcomingMeetings = [];

  const quickActions = [
    { label: "Mark Attendance", icon: "✅", color: "#10b981" },
    { label: "Create Assignment", icon: "📝", color: "#3b82f6" },
    { label: "Enter Grades", icon: "📊", color: "#f59e0b" },
    { label: "Send Notice", icon: "📢", color: "#8b5cf6" },
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Teacher Dashboard</h2>
          <div className="dashboard-sub">Loading...</div>
        </div>
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Teacher Dashboard</h2>
        <div className="dashboard-sub">
          Welcome back! Manage your classes and students effectively.
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button key={index} className="action-btn">
            <div
              className="icon"
              style={{ backgroundColor: `${action.color}20` }}
            >
              {action.icon}
            </div>
            <div className="text">{action.label}</div>
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="stat-card"
            style={{ borderLeftColor: stat.color }}
          >
            <div className="stat-card-icon">{stat.icon}</div>
            <div className="stat-card-title">{stat.title}</div>
            <div className="stat-card-value">{stat.value}</div>
            {typeof stat.change !== "undefined" && (
              <div
                className={`stat-card-change ${
                  stat.change >= 0 ? "positive" : "negative"
                }`}
              >
                {stat.change >= 0 ? "▲" : "▼"} {Math.abs(stat.change)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Panels */}
      <div className="panels">
        {/* My Classes */}
        <section className="panel">
          <h3>My Classes</h3>
          <div className="classes-list">
            {myClasses.map((cls, index) => (
              <div key={index} className="class-item">
                <div className="class-info">
                  <h4 className="class-name">{cls.name}</h4>
                  <div className="class-stats">
                    <span className="stat">👥 {cls.students} students</span>
                    <span className="stat">
                      📊 {cls.attendance}% attendance
                    </span>
                  </div>
                </div>
                <div className="class-next">
                  <div className="next-time">{cls.nextClass}</div>
                  <button className="view-btn">View Class</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Today's Schedule */}
        <section className="panel">
          <h3>Today's Schedule</h3>
          <div className="schedule-list">
            {todaysSchedule.map((item, index) => (
              <div key={index} className="schedule-item">
                <div className="schedule-time">{item.time}</div>
                <div className="schedule-details">
                  <div className="schedule-subject">{item.subject}</div>
                  <div className="schedule-room">
                    📍 {item.room} • {item.duration}
                  </div>
                </div>
                <div className="schedule-status">
                  {index === 0 ? (
                    <span
                      className="status-badge"
                      style={{ backgroundColor: "#fef5e7", color: "#744210" }}
                    >
                      Current
                    </span>
                  ) : index === 1 ? (
                    <span
                      className="status-badge"
                      style={{ backgroundColor: "#e6f3ff", color: "#1e40af" }}
                    >
                      Next
                    </span>
                  ) : (
                    <span
                      className="status-badge"
                      style={{ backgroundColor: "#f0f0f0", color: "#6b7280" }}
                    >
                      Upcoming
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pending Grades */}
        <section className="panel">
          <h3>Pending Grades</h3>
          <div className="grades-list">
            {pendingGrades.map((grade, index) => (
              <div key={index} className="grade-item">
                <div className="grade-info">
                  <div className="grade-student">{grade.student}</div>
                  <div className="grade-assignment">{grade.assignment}</div>
                  <div className="grade-subject">{grade.subject}</div>
                </div>
                <div className="grade-due">
                  <div className="due-text">Due: {grade.due}</div>
                  <button className="view-btn">Grade</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Meetings */}
        <section className="panel">
          <h3>Upcoming Parent Meetings</h3>
          <div className="meetings-list">
            {upcomingMeetings.map((meeting, index) => (
              <div key={index} className="meeting-item">
                <div className="meeting-info">
                  <div className="meeting-parent">{meeting.parent}</div>
                  <div className="meeting-student">
                    Student: {meeting.student}
                  </div>
                  <div className="meeting-subject">
                    Subject: {meeting.subject}
                  </div>
                </div>
                <div className="meeting-time">
                  <div className="meeting-date">{meeting.date}</div>
                  <div className="meeting-time-text">{meeting.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherDashboard;
