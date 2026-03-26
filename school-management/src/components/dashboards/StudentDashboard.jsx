import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import "../Dashboard.css";
import "./DashboardStyles.css";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real app, we'd fetch specific student stats
        // For now, we use the user info and some default values
        setStats([
          {
            title: "Current GPA",
            value: "0.0",
            change: 0,
            color: "#8b5cf6",
            icon: "📊",
          },
          {
            title: "Attendance",
            value: "0%",
            change: 0,
            color: "#10b981",
            icon: "✅",
          },
          {
            title: "Assignments Due",
            value: 0,
            change: 0,
            color: "#f59e0b",
            icon: "📝",
          },
          {
            title: "Upcoming Exams",
            value: 0,
            change: 0,
            color: "#ef4444",
            icon: "📚",
          },
        ]);
      } catch (err) {
        console.error("Failed to load student dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const mySubjects = [
    {
      name: "Mathematics",
      teacher: "Mr. Johnson",
      grade: "A-",
      nextClass: "Today 10:00 AM",
      room: "Room 101",
    },
    {
      name: "Physics",
      teacher: "Dr. Smith",
      grade: "B+",
      nextClass: "Tomorrow 11:30 AM",
      room: "Lab 2",
    },
    {
      name: "Chemistry",
      teacher: "Ms. Davis",
      grade: "A",
      nextClass: "Friday 2:00 PM",
      room: "Lab 1",
    },
    {
      name: "English",
      teacher: "Mrs. Wilson",
      grade: "A-",
      nextClass: "Monday 9:00 AM",
      room: "Room 205",
    },
  ];

  const upcomingAssignments = [
    {
      subject: "Mathematics",
      title: "Trigonometry Problem Set",
      due: "Tomorrow",
      priority: "High",
      points: 50,
    },
    {
      subject: "Physics",
      title: "Lab Report - Forces",
      due: "Friday",
      priority: "Medium",
      points: 75,
    },
    {
      subject: "Chemistry",
      title: "Chemical Reactions Essay",
      due: "Next Week",
      priority: "Low",
      points: 100,
    },
  ];

  const recentGrades = [
    {
      subject: "Mathematics",
      assignment: "Algebra Test",
      grade: "A-",
      points: "42/50",
      date: "Last Week",
    },
    {
      subject: "Physics",
      assignment: "Motion Lab",
      grade: "B+",
      points: "35/40",
      date: "Last Week",
    },
    {
      subject: "Chemistry",
      assignment: "Periodic Table Quiz",
      grade: "A",
      points: "48/50",
      date: "2 weeks ago",
    },
  ];

  const examSchedule = [
    {
      subject: "Mathematics",
      date: "Jan 25",
      time: "9:00 AM",
      room: "Room 101",
      type: "Mid-term",
    },
    {
      subject: "Physics",
      date: "Jan 28",
      time: "11:00 AM",
      room: "Lab 2",
      type: "Lab Exam",
    },
    {
      subject: "Chemistry",
      date: "Feb 1",
      time: "2:00 PM",
      room: "Lab 1",
      type: "Written",
    },
  ];

  const announcements = [
    {
      title: "School Assembly",
      message: "Assembly scheduled for tomorrow at 8:00 AM",
      date: "Today",
    },
    {
      title: "Library Hours",
      message: "Library will be open until 6:00 PM this week",
      date: "Yesterday",
    },
    {
      title: "Sports Day",
      message: "Annual sports day on February 15th",
      date: "2 days ago",
    },
  ];

  const quickActions = [
    { label: "View Assignments", icon: "📝", color: "#8b5cf6" },
    { label: "Check Grades", icon: "📊", color: "#10b981" },
    { label: "Download Timetable", icon: "📅", color: "#f59e0b" },
    { label: "Pay Fees", icon: "💰", color: "#ef4444" },
  ];

  const getPriorityColor = (priority) => {
    const colors = {
      High: "#ef4444",
      Medium: "#f59e0b",
      Low: "#10b981",
    };
    return colors[priority] || "#6b7280";
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Student Dashboard</h2>
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
        <h2>Student Dashboard</h2>
        <div className="dashboard-sub">
          Welcome back, {user?.name || "Student"}! Track your academic progress and stay organized.
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
        {/* My Subjects */}
        <section className="panel">
          <h3>My Subjects</h3>
          <div className="subjects-list">
            {mySubjects.map((subject, index) => (
              <div key={index} className="subject-item">
                <div className="subject-info">
                  <h4 className="subject-name">{subject.name}</h4>
                  <div className="subject-teacher">👨‍🏫 {subject.teacher}</div>
                  <div className="subject-next">🕐 {subject.nextClass}</div>
                </div>
                <div className="subject-grade">
                  <div className="grade-value">{subject.grade}</div>
                  <div className="grade-label">Current</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Assignments */}
        <section className="panel">
          <h3>Upcoming Assignments</h3>
          <div className="assignments-list">
            {upcomingAssignments.map((assignment, index) => (
              <div key={index} className="assignment-item">
                <div className="assignment-info">
                  <div className="assignment-title">{assignment.title}</div>
                  <div className="assignment-subject">{assignment.subject}</div>
                  <div className="assignment-points">
                    {assignment.points} points
                  </div>
                </div>
                <div className="assignment-due">
                  <div className="due-text">Due: {assignment.due}</div>
                  <span
                    className="priority-badge"
                    style={{
                      backgroundColor: `${getPriorityColor(
                        assignment.priority
                      )}20`,
                      color: getPriorityColor(assignment.priority),
                    }}
                  >
                    {assignment.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Grades */}
        <section className="panel">
          <h3>Recent Grades</h3>
          <div className="grades-list">
            {recentGrades.map((grade, index) => (
              <div key={index} className="grade-item">
                <div className="grade-info">
                  <div className="grade-assignment">{grade.assignment}</div>
                  <div className="grade-subject">{grade.subject}</div>
                  <div className="grade-date">{grade.date}</div>
                </div>
                <div className="grade-score">
                  <div className="score-value">{grade.grade}</div>
                  <div className="score-points">{grade.points}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Exam Schedule */}
        <section className="panel">
          <h3>Exam Schedule</h3>
          <div className="exam-list">
            {examSchedule.map((exam, index) => (
              <div key={index} className="exam-item">
                <div className="exam-info">
                  <div className="exam-subject">{exam.subject}</div>
                  <div className="exam-type">{exam.type}</div>
                  <div className="exam-room">📍 {exam.room}</div>
                </div>
                <div className="exam-time">
                  <div className="exam-date">{exam.date}</div>
                  <div className="exam-time-text">{exam.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Announcements */}
        <section className="panel">
          <h3>School Announcements</h3>
          <div className="announcements-list">
            {announcements.map((announcement, index) => (
              <div key={index} className="announcement-item">
                <div className="announcement-title">{announcement.title}</div>
                <div className="announcement-message">
                  {announcement.message}
                </div>
                <div className="announcement-date">{announcement.date}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
