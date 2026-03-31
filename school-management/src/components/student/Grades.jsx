import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, BookOpen, Clock, CheckCircle, AlertCircle, BarChart3, GraduationCap } from "lucide-react";
import "./StudentFeatures.css";

const StudentGrades = () => {
    const { user } = useAuth();

    const currentGpa = 3.8;
    const previousGpa = 3.6;

    const grades = [
        {
            id: 1,
            subject: "Mathematics",
            teacher: "Mr. Johnson",
            grade: "A-",
            percentage: 92,
            credits: 4,
            status: "Finished",
            date: "Last Week"
        },
        {
            id: 2,
            subject: "Physics",
            teacher: "Dr. Smith",
            grade: "B+",
            percentage: 88,
            credits: 4,
            status: "In Progress",
            date: "Last Month"
        },
        {
            id: 3,
            subject: "Chemistry",
            teacher: "Ms. Davis",
            grade: "A",
            percentage: 95,
            credits: 3,
            status: "Finished",
            date: "2 Weeks Ago"
        },
        {
            id: 4,
            subject: "English",
            teacher: "Mrs. Wilson",
            grade: "A-",
            percentage: 91,
            credits: 3,
            status: "Finished",
            date: "Last Semester"
        }
    ];

    return (
        <div className="student-portal-detail">
            <div className="detail-header">
                <Link to="/student/dashboard" className="back-link">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>
                <h1>Check Grades</h1>
                <p>Monitor your academic performance</p>
            </div>

            <div className="detail-content">
                <div className="gpa-summary-card">
                    <div className="gpa-info">
                        <div className="gpa-value-row">
                            <GraduationCap size={24} color="#8b5cf6" />
                            <span className="gpa-label">Cumulative GPA</span>
                            <span className="gpa-value">{currentGpa}</span>
                        </div>
                        <div className={`gpa-trend ${currentGpa > previousGpa ? 'up' : 'down'}`}>
                            <TrendingUp size={16} /> {currentGpa > previousGpa ? `+${(currentGpa - previousGpa).toFixed(1)} Up from last term` : `${(previousGpa - currentGpa).toFixed(1)} Down`}
                        </div>
                    </div>
                </div>

                <div className="grades-matrix">
                    <div className="matrix-header">
                        <span className="column">Subject</span>
                        <span className="column">Teacher</span>
                        <span className="column">Grade</span>
                        <span className="column">Percentage</span>
                        <span className="column hide-mobile">Credits</span>
                        <span className="column hide-mobile">Status</span>
                        <span className="column">Action</span>
                    </div>
                    {grades.map(grade => (
                        <div key={grade.id} className="grade-row">
                            <span className="column primary">{grade.subject}</span>
                            <span className="column text-dim"><span className="teacher-icon">👨‍🏫</span> {grade.teacher}</span>
                            <span className="column grade-badge">{grade.grade}</span>
                            <span className="column">{grade.percentage}%</span>
                            <span className="column hide-mobile">{grade.credits} Credits</span>
                            <span className="column hide-mobile status-text">{grade.status}</span>
                            <span className="column"><button className="view-btn-small">Full Report</button></span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudentGrades;
