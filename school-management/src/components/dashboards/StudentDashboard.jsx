import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  BarChart2, 
  Calendar, 
  DollarSign, 
  Bell 
} from "lucide-react";
import "../Dashboard.css";
import "./DashboardStyles.css";
import Announcements from "../Announcements";

const StudentDashboard = () => {
  const { user, activeAcademicYear } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Get the detailed student record using account email
        const student = await api.getStudentPortalMe();
        const studentId = student.id;

        // 2. Fetch all student-related data in parallel
        const [attendanceSummary, reportCard, feeBalance] = await Promise.all([
          api.getStudentAttendanceSummary(studentId),
          api.getStudentReportCard(studentId),
          api.getStudentFeeBalance(studentId),
        ]);

        // 3. Compute GPA (average of scores/25 to get a 4.0 scale roughly)
        const grades = Array.isArray(reportCard) ? reportCard : [];
        const avgScore =
          grades.length > 0
            ? grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length
            : 0;
        const gpa = (avgScore / 25).toFixed(1);

        // 4. Map subjects from report card or enrollment
        const subjectsList = grades.map((g) => ({
          name: g.subject,
          teacher: "Assigned Faculty", // backend doesn't store teacher name in grade table yet
          nextClass: "Refer to timetable",
          grade:
            g.score >= 90
              ? "A"
              : g.score >= 80
                ? "B"
                : g.score >= 70
                  ? "C"
                  : "D",
          status: "Current",
        }));

        setMySubjects(subjectsList);

        // 5. Update stats with real values
        setStats([
          {
            title: "Current Session",
            value: activeAcademicYear?.year || "None Set",
            color: "#3b82f6",
          },
          {
            title: "Current GPA",
            value: gpa || "0.0",
            change: 0,
            color: "#8b5cf6",
          },
          {
            title: "Attendance",
            value: attendanceSummary?.percentage
              ? `${attendanceSummary.percentage}%`
              : "0%",
            change: 0,
            color: "#10b981",
          },
          {
            title: "Assignments Due",
            value: 0, // Assignment Microservice is not yet live
            change: 0,
            color: "#f59e0b",
          },
          {
            title: "Fee Balance",
            value: feeBalance?.balance ? `$${feeBalance.balance}` : "$0",
            change: 0,
            color: "#ef4444",
          },
        ]);

        // Map recent grades to UI
        const mappedGrades = grades.slice(0, 5).map((g) => ({
          assignment: `Final Assessment: ${g.subject}`,
          subject: g.subject,
          date: new Date(g.createdAt).toLocaleDateString(),
          grade:
            g.score >= 90
              ? "A"
              : g.score >= 80
                ? "B"
                : g.score >= 70
                  ? "C"
                  : "D",
          points: `${g.score}/100`,
        }));
        setRecentGrades(mappedGrades);
      } catch (err) {
        console.error("Failed to sync student dashboard with backend:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const [mySubjects, setMySubjects] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const examSchedule = [];

  const quickActions = [
    {
      label: "View Assignments",
      color: "#8b5cf6",
      path: "/student/assignments",
      icon: <FileText size={20} />
    },
    {
      label: "Check Grades",
      color: "#10b981",
      path: "/student/grades",
      icon: <BarChart2 size={20} />
    },
    {
      label: "Download Timetable",
      color: "#f59e0b",
      path: "/student/timetable",
      icon: <Calendar size={20} />
    },
    {
      label: "Pay Fees",
      color: "#ef4444",
      path: "/student/payments",
      icon: <DollarSign size={20} />
    },
    {
      label: "Notifications",
      color: "#3b82f6",
      path: "/notifications",
      icon: <Bell size={20} />
    },
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
      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="action-btn"
            onClick={() => navigate(action.path)}
          >
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
            {mySubjects.length > 0 ? (
              mySubjects.map((subject, index) => (
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
              ))
            ) : (
              <div className="empty-state">No active subjects found.</div>
            )}
          </div>
          <div className="panel-footer">
            <button
              className="view-more-link"
              onClick={() => navigate("/student/grades")}
            >
              Review Full Academic Record →
            </button>
          </div>
        </section>

        {/* Upcoming Assignments */}
        <section className="panel">
          <h3>Upcoming Assignments</h3>
          <div className="assignments-list">
            {upcomingAssignments.length > 0 ? (
              upcomingAssignments.map((assignment, index) => (
                <div key={index} className="assignment-item">
                  <div className="assignment-info">
                    <div className="assignment-title">{assignment.title}</div>
                    <div className="assignment-subject">
                      {assignment.subject}
                    </div>
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
                          assignment.priority,
                        )}20`,
                        color: getPriorityColor(assignment.priority),
                      }}
                    >
                      {assignment.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No upcoming assignments.</div>
            )}
          </div>
          <div className="panel-footer">
            <button
              className="view-more-link"
              onClick={() => navigate("/student/assignments")}
            >
              Go to Submission Portal →
            </button>
          </div>
        </section>

        {/* Recent Grades */}
        <section className="panel">
          <h3>Recent Grades</h3>
          <div className="grades-list">
            {recentGrades.length > 0 ? (
              recentGrades.map((grade, index) => (
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
              ))
            ) : (
              <div className="empty-state">No recent grades available.</div>
            )}
          </div>
          <div className="panel-footer">
            <button
              className="view-more-link"
              onClick={() => navigate("/student/grades")}
            >
              View Grade Analysis →
            </button>
          </div>
        </section>

        {/* Exam Schedule */}
        <section className="panel">
          <h3>Exam Schedule</h3>
          <div className="exam-list">
            {examSchedule.length > 0 ? (
              examSchedule.map((exam, index) => (
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
              ))
            ) : (
              <div className="empty-state">No upcoming exams scheduled.</div>
            )}
          </div>
          <div className="panel-footer">
            <button
              className="view-more-link"
              onClick={() => navigate("/student/timetable")}
            >
              Download Full Timetable →
            </button>
          </div>
        </section>

        {/* Announcements */}
        <section className="panel">
          <Announcements userRole="student" />
        </section>
      </div>
    </div>
  );
};

export default StudentDashboard;
