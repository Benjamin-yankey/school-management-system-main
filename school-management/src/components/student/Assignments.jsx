import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock, CheckCircle, AlertCircle, Inbox } from "lucide-react";
import "./StudentFeatures.css";

const StudentAssignments = () => {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Placeholder for future API integration
    useEffect(() => {
        // Fetch assignments when service is available
        // setAssignments(fetchedData);
    }, []);

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
                {assignments.length > 0 ? (
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
                ) : (
                    <div className="empty-state-detail">
                        <Inbox size={48} />
                        <h3>No assignments found</h3>
                        <p>Your dashboard is clear! Enjoy your free time or check back later for new tasks.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAssignments;
