import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";
import "./DashboardStyles.css";
import Announcements from "../Announcements";

const StudentDashboard = () => {
  const { user } = useAuth();
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
        const avgScore = grades.length > 0 
          ? grades.reduce((acc, curr) => acc + curr.score, 0) / grades.length 
          : 0;
        const gpa = (avgScore / 25).toFixed(1);

        // 4. Map subjects from report card or enrollment
        const subjectsList = grades.map(g => ({
          name: g.subject,
          teacher: "Assigned Faculty", // backend doesn't store teacher name in grade table yet
          nextClass: "Refer to timetable",
          grade: g.score >= 90 ? "A" : g.score >= 80 ? "B" : g.score >= 70 ? "C" : "D",
          status: "Current"
        }));

        setMySubjects(subjectsList.length > 0 ? subjectsList : [
          { name: "Mathematics - Calculus", teacher: "Mr. Johnson", nextClass: "Today 10:00 AM", grade: "A-", status: "Current" },
          { name: "Advanced Physics - Robotics", teacher: "Dr. Smith", nextClass: "Tomorrow 11:30 AM", grade: "B+", status: "Current" }
        ]);

        // 5. Update stats with real values
        setStats([
          {
            title: "Current GPA",
            value: gpa || "0.0",
            change: 0.2, // Mock change for UI
            color: "#8b5cf6",
            icon: "📊",
          },
          {
            title: "Attendance",
            value: attendanceSummary?.percentage ? `${attendanceSummary.percentage}%` : "0%",
            change: 2,
            color: "#10b981",
            icon: "✅",
          },
          {
            title: "Assignments Due",
            value: 3, // Mocked until Assignment Microservice is live
            change: -1,
            color: "#f59e0b",
            icon: "📝",
          },
          {
            title: "Fee Balance", // Replaced upcoming exams with finance balance
            value: feeBalance?.balance ? `$${feeBalance.balance}` : "$0",
            change: 0,
            color: "#ef4444",
            icon: "💰",
          },
        ]);

        // Map recent grades to UI
        const mappedGrades = grades.slice(0, 5).map(g => ({
          assignment: `Final Assessment: ${g.subject}`,
          subject: g.subject,
          date: new Date(g.createdAt).toLocaleDateString(),
          grade: g.score >= 90 ? "A" : g.score >= 80 ? "B" : g.score >= 70 ? "C" : "D",
          points: `${g.score}/100`
        }));
        setRecentGrades(mappedGrades.length > 0 ? mappedGrades : recentGrades);

      } catch (err) {
        console.error("Failed to sync student dashboard with backend:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const [mySubjects, setMySubjects] = useState([]);

  const [upcomingAssignments, setUpcomingAssignments] = useState([
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
  ]);

  const [recentGrades, setRecentGrades] = useState([
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
  ]);

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


  const quickActions = [
    { label: "View Assignments", icon: "📝", color: "#8b5cf6", path: "/student/assignments" },
    { label: "Check Grades", icon: "📊", color: "#10b981", path: "/student/grades" },
    { label: "Download Timetable", icon: "📅", color: "#f59e0b", path: "/student/timetable" },
    { label: "Pay Fees", icon: "💰", color: "#ef4444", path: "/student/payments" },
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
        <h2>Student Portal</h2>
        <div className="dashboard-sub">
          Welcome back to GEOZIIE INTERNATIONAL SCHOOL, {user?.name || "Student"}! Track your academic progress and stay organized.
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        {quickActions.map((action, index) => (
          <button key={index} className="action-btn" onClick={() => navigate(action.path)}>
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
          <div className="panel-footer">
            <button className="view-more-link" onClick={() => navigate("/student/grades")}>Review Full Academic Record →</button>
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
          <div className="panel-footer">
            <button className="view-more-link" onClick={() => navigate("/student/assignments")}>Go to Submission Portal →</button>
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
          <div className="panel-footer">
            <button className="view-more-link" onClick={() => navigate("/student/grades")}>View Grade Analysis →</button>
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
          <div className="panel-footer">
            <button className="view-more-link" onClick={() => navigate("/student/timetable")}>Download Full Timetable →</button>
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
