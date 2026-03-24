import React, { useState, useEffect } from "react";
import {
  generateStats,
  generateRecentStudents,
  generateAttendance,
  formatNumber,
  formatDate,
  getStatusColor,
} from "../lib/dashboardData";
import QuickActions from "./QuickActions";
import Notifications from "./Notifications";
import UpcomingEvents from "./UpcomingEvents";
import TopPerformers from "./TopPerformers";
import "./Dashboard.css";

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

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStats(generateStats());
      setRecentStudents(generateRecentStudents());
      setAttendance(generateAttendance());
      setLoading(false);
    };

    loadData();
  }, []);

  const handleQuickAction = (action) => {
    console.log(`Quick action: ${action.label}`, action);
    // Handle quick actions here
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Dashboard</h2>
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
        <h2>School Management Dashboard</h2>
        <div className="dashboard-sub">
          Welcome back! Here's what's happening in your school today.
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions onActionClick={handleQuickAction} />

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
