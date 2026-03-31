import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, CheckCircle, AlertCircle } from "lucide-react";
import "./StudentFeatures.css";

const StudentAssignments = () => {
    const { user } = useAuth();

    const assignments = [
        {
            id: 1,
            subject: "Mathematics",
            title: "Trigonometry Problem Set",
            due: "Tomorrow",
            status: "Pending",
            priority: "High",
            points: 50
        },
        {
            id: 2,
            subject: "Physics",
            title: "Lab Report - Forces",
            due: "Friday",
            status: "Submitted",
            priority: "Medium",
            points: 75
        },
        {
            id: 3,
            subject: "Chemistry",
            title: "Chemical Reactions Essay",
            due: "Next Week",
            status: "Draft",
            priority: "Low",
            points: 100
        }
    ];

    return (
        <div className="student-portal-detail">
            <div className="detail-header">
                <Link to="/student/dashboard" className="back-link">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>
                <h1>Assignments</h1>
                <p>Track and manage your academic tasks</p>
            </div>

            <div className="detail-content">
                <div className="assignments-container">
                    {assignments.map(assignment => (
                        <div key={assignment.id} className={`assignment-card ${assignment.status.toLowerCase()}`}>
                            <div className="assignment-meta">
                                <span className={`status-badge ${assignment.status.toLowerCase()}`}>
                                    {assignment.status}
                                </span>
                                <span className={`priority-badge ${assignment.priority.toLowerCase()}`}>
                                    {assignment.priority} Priority
                                </span>
                            </div>
                            <h3 className="assignment-title">{assignment.title}</h3>
                            <div className="subject-line">
                                <BookOpen size={14} /> {assignment.subject}
                            </div>
                            <div className="footer-line">
                                <span className="due-date"><Clock size={14} /> Due: {assignment.due}</span>
                                <span className="points">{assignment.points} Points</span>
                            </div>
                            <div className="actions">
                                {assignment.status === "Pending" && <button className="submit-btn highlight">Submit Homework</button>}
                                {assignment.status === "Submitted" && <button className="view-btn">View Result</button>}
                                {assignment.status === "Draft" && <button className="edit-btn">Continue Writing</button>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentAssignments;
