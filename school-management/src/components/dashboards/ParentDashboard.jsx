import React, { useState, useEffect } from "react";
import api from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { generateReportCardPDF } from "../../pages/generateReportCardPDF";
import DashboardLayout from "./DashboardLayout";
import "../Dashboard.css";
import "./DashboardStyles.css";
import { useTheme } from "../../contexts/ThemeContext";

const SvgIcon = ({ d }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const PARENT_NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <SvgIcon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" /> },
  { id: "performance", label: "Performance", icon: <SvgIcon d={["M18 20V10", "M12 20V4", "M6 20v-6"]} /> },
  { id: "attendance", label: "Attendance", icon: <SvgIcon d={["M22 11.08V12a10 10 0 1 1-5.93-9.14", "M22 4L12 14.01l-3-3"]} /> },
  { id: "fees", label: "Fee History", icon: <SvgIcon d={["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]} /> },
  { id: "meetings", label: "Meetings", icon: <SvgIcon d={["M3 4h18v18H3z", "M16 2v4", "M8 2v4", "M3 10h18"]} /> },
  { id: "notifications", label: "Notifications", icon: <SvgIcon d={["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"]} />, action: "/notifications" },
];
const ParentDashboard = () => {
  const { user } = useAuth();
  const { formatDate } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [children, setChildren] = useState([]);
  const [childPerformance, setChildPerformance] = useState([]);
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const linkedChildren = await api.getLinkedChildren();
        const childrenData = Array.isArray(linkedChildren) ? linkedChildren : [];
        setChildren(childrenData);

        if (childrenData.length > 0) {
            await loadChildDetail(childrenData[0].studentId);
        }

        setStats([
          { title: "Overall GPA", value: "3.5", change: 0.1, color: "#f59e0b", icon: "📊" },
          { title: "Attendance", value: "94%", change: 1.2, color: "#10b981", icon: "✅" },
          { title: "Pending Fees", value: "$450", change: -50, color: "#ef4444", icon: "💰" },
          { title: "Upcoming Meetings", value: 1, change: 0, color: "#8b5cf6", icon: "👨‍👩‍👧‍👦" },
        ]);
      } catch (err) {
        console.error("Failed to load parent dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const loadChildDetail = async (studentId) => {
    try {
      const reportCard = await api.getStudentReportCard(studentId);
      setChildPerformance(Array.isArray(reportCard) ? reportCard : []);
    } catch (err) {
      console.error("Failed to load child detail:", err);
    }
  };

  const handleChildSelect = async (index) => {
    setSelectedChildIndex(index);
    await loadChildDetail(children[index].studentId);
  };

  const currentChild = children[selectedChildIndex]?.student;

  const handleDownloadReportCard = () => {
    if (!currentChild || childPerformance.length === 0) return;
    generateReportCardPDF(currentChild, childPerformance);
  };

  const attendanceRecord = [
    {
      date: "Jan 15",
      status: "Present",
      subject: "Mathematics",
      teacher: "Mr. Johnson",
    },
    {
      date: "Jan 14",
      status: "Present",
      subject: "Physics",
      teacher: "Dr. Smith",
    },
    {
      date: "Jan 13",
      status: "Absent",
      subject: "Chemistry",
      teacher: "Ms. Davis",
    },
    {
      date: "Jan 12",
      status: "Present",
      subject: "English",
      teacher: "Mrs. Wilson",
    },
  ];

  const feeHistory = [
    {
      month: "January 2025",
      amount: "$500",
      status: "Paid",
      dueDate: "Jan 5",
      paidDate: "Jan 3",
    },
    {
      month: "December 2024",
      amount: "$500",
      status: "Paid",
      dueDate: "Dec 5",
      paidDate: "Dec 2",
    },
    {
      month: "November 2024",
      amount: "$500",
      status: "Paid",
      dueDate: "Nov 5",
      paidDate: "Nov 4",
    },
    {
      month: "February 2025",
      amount: "$500",
      status: "Pending",
      dueDate: "Feb 5",
      paidDate: "-",
    },
  ];

  const upcomingMeetings = [
    {
      teacher: "Mr. Johnson",
      subject: "Mathematics",
      date: "Tomorrow",
      time: "2:00 PM",
      type: "Progress Review",
    },
    {
      teacher: "Dr. Smith",
      subject: "Physics",
      date: "Next Week",
      time: "3:30 PM",
      type: "Concern Discussion",
    },
  ];

  const schoolEvents = [
    {
      title: "Parent-Teacher Conference",
      date: "Feb 15",
      time: "9:00 AM - 5:00 PM",
      type: "Conference",
    },
    {
      title: "Science Fair",
      date: "Feb 20",
      time: "10:00 AM - 3:00 PM",
      type: "Event",
    },
    {
      title: "Sports Day",
      date: "Feb 25",
      time: "8:00 AM - 4:00 PM",
      type: "Sports",
    },
  ];

  const quickActions = [
    {
      id: "qa-pay",
      label: "Pay Fees",
      icon: <SvgIcon d={["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]} />,
      color: "#f59e0b",
      action: () => navigate("/student/payments")
    },
    {
      id: "qa-meeting",
      label: "Schedule Meeting",
      icon: <SvgIcon d={["M3 4h18v18H3z", "M16 2v4", "M8 2v4", "M3 10h18"]} />,
      color: "#8b5cf6",
      action: () => {}
    },
    {
      id: "qa-report",
      label: "View Report Card",
      icon: <SvgIcon d={["M18 20V10", "M12 20V4", "M6 20v-6"]} />,
      color: "#10b981",
      action: handleDownloadReportCard
    },
    {
      id: "qa-contact",
      label: "Contact Teacher",
      icon: <SvgIcon d={["M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"]} />,
      color: "#3b82f6",
      action: () => {}
    },
  ];

  if (loading) {
    return (
      <DashboardLayout navItems={PARENT_NAV_ITEMS} activeItem="dashboard" onNavigate={() => {}} pageTitle="Parent Dashboard" portalLabel="Parent Portal v2.0">
      <div className="dashboard">
        <div className="dashboard-header" style={{ paddingBottom: "var(--dash-gap)" }}>
          <h2>Parent Dashboard</h2>
          <div className="dashboard-sub">Loading...</div>
        </div>
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      navItems={PARENT_NAV_ITEMS} 
      activeItem="dashboard" 
      onNavigate={() => {}} 
      pageTitle="Parent Dashboard" 
      portalLabel="Parent Portal v2.0"
      quickActions={quickActions}
    >
    <div className="dashboard dashboard-animate" style={{ padding: 0 }}>
      <div className="dashboard-header" style={{ marginBottom: "var(--dash-gap)" }}>
        <h2>Parent Dashboard</h2>
        <div className="dashboard-sub">
          Welcome back, {user?.name || "Parent"}! Stay connected with your child's academic journey.
        </div>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div className="child-selector mb-6">
          <div className="flex gap-2">
            {children.map((linked, index) => (
              <button
                key={linked.id}
                onClick={() => handleChildSelect(index)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedChildIndex === index
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
                    {linked.student?.firstName[0]}{linked.student?.lastName[0]}
                  </div>
                  <span className="font-medium">{linked.student?.firstName} {linked.student?.lastName}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}


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
        {/* Academic Performance */}
        <section className="panel">
          <h3>{currentChild?.firstName}'s Academic Performance</h3>
          <div className="performance-list">
            {childPerformance.map((subject, index) => (
              <div key={index} className="performance-item">
                <div className="performance-info">
                  <h4 className="subject-name">{subject.subject}</h4>
                  <div className="subject-teacher">👨‍🏫 {subject.teacherNote || "Report Summary"}</div>
                </div>
                <div className="performance-grade">
                  <div className="grade-value">{subject.score >= 90 ? "A" : subject.score >= 80 ? "B" : subject.score >= 70 ? "C" : "D"}</div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${subject.score}%`,
                        backgroundColor:
                          subject.score >= 90
                            ? "#10b981"
                            : subject.score >= 80
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Attendance Record */}
        <section className="panel">
          <h3>Recent Attendance</h3>
          <div className="attendance-list">
            {attendanceRecord.map((record, index) => (
              <div key={index} className="attendance-item">
                <div className="attendance-info">
                  <div className="attendance-date">{record.date}</div>
                  <div className="attendance-subject">{record.subject}</div>
                  <div className="attendance-teacher">👨‍🏫 {record.teacher}</div>
                </div>
                <div className="attendance-status">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor:
                        record.status === "Present" ? "#f0fff4" : "#fed7d7",
                      color:
                        record.status === "Present" ? "#22543d" : "#742a2a",
                    }}
                  >
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fee History */}
        <section className="panel">
          <h3>Fee Payment History</h3>
          <div className="fee-list">
            {feeHistory.map((fee, index) => (
              <div key={index} className="fee-item">
                <div className="fee-info">
                  <div className="fee-month">{fee.month}</div>
                  <div className="fee-amount">{fee.amount}</div>
                  <div className="fee-due">Due: {fee.dueDate}</div>
                </div>
                <div className="fee-status">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor:
                        fee.status === "Paid" ? "#f0fff4" : "#fef5e7",
                      color: fee.status === "Paid" ? "#22543d" : "#744210",
                    }}
                  >
                    {fee.status}
                  </span>
                  {fee.status === "Paid" && (
                    <div className="fee-paid">Paid: {fee.paidDate}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Meetings */}
        <section className="panel">
          <h3>Upcoming Parent-Teacher Meetings</h3>
          <div className="meetings-list">
            {upcomingMeetings.map((meeting, index) => (
              <div key={index} className="meeting-item">
                <div className="meeting-info">
                  <div className="meeting-teacher">{meeting.teacher}</div>
                  <div className="meeting-subject">{meeting.subject}</div>
                  <div className="meeting-type">{meeting.type}</div>
                </div>
                <div className="meeting-time">
                  <div className="meeting-date">{meeting.date}</div>
                  <div className="meeting-time-text">{meeting.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* School Events */}
        <section className="panel">
          <h3>Upcoming School Events</h3>
          <div className="events-list">
            {schoolEvents.map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-info">
                  <div className="event-title">{event.title}</div>
                  <div className="event-type">{event.type}</div>
                </div>
                <div className="event-time">
                  <div className="event-date">{event.date}</div>
                  <div className="event-time-text">{event.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
