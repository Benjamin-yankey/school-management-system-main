import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import "../Dashboard.css";
import "./DashboardStyles.css";
import Announcements from "../Announcements";
import { useTheme } from "../../contexts/ThemeContext";

import StudentAssignments from "../student/Assignments";
import StudentGrades from "../student/Grades";
import StudentTimetable from "../student/Timetable";
import StudentPayments from "../student/Payments";
import NotificationServicePage from "../../lib/NotificationService";

const SvgIcon = ({ d }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const STUDENT_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <SvgIcon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" /> },
  { id: "assignments", label: "Assignments", icon: <SvgIcon d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"]} /> },
  { id: "grades", label: "Grades", icon: <SvgIcon d={["M18 20V10", "M12 20V4", "M6 20v-6"]} /> },
  { id: "timetable", label: "Timetable", icon: <SvgIcon d={["M3 4h18v18H3z", "M16 2v4", "M8 2v4", "M3 10h18"]} /> },
  { id: "payments", label: "Payments", icon: <SvgIcon d={["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]} /> },
  { id: "notifications", label: "Notifications", icon: <SvgIcon d={["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"]} /> },
];

const StudentDashboard = () => {
  const { user, activeAcademicYear } = useAuth();
  const { formatDate } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");
  const [stats, setStats] = useState([]);
  const [mySubjects, setMySubjects] = useState([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const examSchedule = [];

  const token = localStorage.getItem("token");
  const serviceUrl = import.meta.env.VITE_NOTIFICATION_URL || "http://localhost:3000";

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const student = await api.getStudentPortalMe();
        const studentId = student.id;

        const [attendanceSummary, reportCard, feeBalance] = await Promise.all([
          api.getStudentAttendanceSummary(studentId),
          api.getStudentReportCard(studentId),
          api.getStudentFeeBalance(studentId),
        ]);

        const grades = Array.isArray(reportCard) ? reportCard : [];
        const avgScore =
          grades.length > 0
            ? grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length
            : 0;
        const gpa = (avgScore / 25).toFixed(1);

        const subjectsList = grades.map((g) => ({
          name: g.subject,
          teacher: "Assigned Faculty",
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
            value: 0,
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

        const mappedGrades = grades.slice(0, 5).map((g) => ({
          assignment: `Final Assessment: ${g.subject}`,
          subject: g.subject,
          date: formatDate(g.createdAt),
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
    if (currentView === "dashboard") loadData();
    else setLoading(false);
  }, [formatDate, activeAcademicYear, currentView]);

  const getPriorityColor = (priority) => {
    const colors = {
      High: "#ef4444",
      Medium: "#f59e0b",
      Low: "#10b981",
    };
    return colors[priority] || "#6b7280";
  };

  const PAGE_TITLES = {
    dashboard: "Student Dashboard",
    assignments: "Assignments",
    grades: "Check Grades",
    timetable: "Academic Timetable",
    payments: "Fees & Finances",
    notifications: "Notifications",
  };

  if (loading) {
    return (
      <DashboardLayout 
        navItems={STUDENT_NAV_ITEMS} 
        activeItem={currentView} 
        onNavigate={setCurrentView} 
        pageTitle={PAGE_TITLES[currentView] || "Student Dashboard"} 
        portalLabel="Student Portal v2.0"
      >
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>{PAGE_TITLES[currentView]}</h2>
          <div className="dashboard-sub">Loading...</div>
        </div>
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case "assignments":
        return <StudentAssignments />;
      case "grades":
        return <StudentGrades />;
      case "timetable":
        return <StudentTimetable />;
      case "payments":
        return <StudentPayments />;
      case "notifications":
        return (
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <NotificationServicePage token={token} serviceUrl={serviceUrl} userId={user?.id} />
          </div>
        );
      default:
        return (
          <div className="dashboard dashboard-animate">
            {/* Stats Grid */}
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
                  <div className="stat-card-icon">{stat.icon}</div>
                  <div className="stat-card-title">{stat.title}</div>
                  <div className="stat-card-value">{stat.value}</div>
                  {typeof stat.change !== "undefined" && (
                    <div className={`stat-card-change ${stat.change >= 0 ? "positive" : "negative"}`}>
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
                  <button className="view-more-link" onClick={() => setCurrentView("grades")}>
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
                          <div className="assignment-subject">{assignment.subject}</div>
                          <div className="assignment-points">{assignment.points} points</div>
                        </div>
                        <div className="assignment-due">
                          <div className="due-text">Due: {assignment.due}</div>
                          <span className="priority-badge" style={{ backgroundColor: `${getPriorityColor(assignment.priority)}20`, color: getPriorityColor(assignment.priority) }}>
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
                  <button className="view-more-link" onClick={() => setCurrentView("assignments")}>
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
                  <button className="view-more-link" onClick={() => setCurrentView("grades")}>
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
                  <button className="view-more-link" onClick={() => setCurrentView("timetable")}>
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
    }
  };

  return (
    <DashboardLayout 
      navItems={STUDENT_NAV_ITEMS} 
      activeItem={currentView} 
      onNavigate={setCurrentView} 
      pageTitle={PAGE_TITLES[currentView] || "Student Dashboard"} 
      portalLabel="Student Portal v2.0"
    >
      <div className="dashboard admin-dashboard-container">
        <style>{`
          .admin-dashboard-container { animation: fadeIn 0.4s ease-out; box-sizing: border-box; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        {renderView()}
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
