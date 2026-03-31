import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../lib/api";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, BookOpen, Clock, CheckCircle, AlertCircle, BarChart3, GraduationCap, Inbox } from "lucide-react";
import "./StudentFeatures.css";

const StudentGrades = () => {
    const { user } = useAuth();
    const [grades, setGrades] = useState([]);
    const [gpa, setGpa] = useState("0.0");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrades = async () => {
            setLoading(true);
            try {
                const student = await api.getStudentPortalMe();
                const reportCard = await api.getStudentReportCard(student.id);
                const gradesData = Array.isArray(reportCard) ? reportCard : [];
                
                const mappedGrades = gradesData.map(g => ({
                    id: g.id,
                    subject: g.subject,
                    teacher: "Assigned Faculty",
                    grade: g.score >= 90 ? "A" : g.score >= 80 ? "B" : g.score >= 70 ? "C" : "D",
                    percentage: g.score,
                    credits: 3, // Mocked as not in DB yet
                    status: "Finished",
                    date: new Date(g.createdAt).toLocaleDateString()
                }));

                const avgScore = gradesData.length > 0 
                    ? gradesData.reduce((acc, curr) => acc + curr.score, 0) / gradesData.length 
                    : 0;
                
                setGrades(mappedGrades);
                setGpa((avgScore / 25).toFixed(1));
            } catch (err) {
                console.error("Failed to fetch grades:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGrades();
    }, []);

    if (loading) {
        return (
            <div className="student-portal-detail">
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading your academic records...</p>
                </div>
            </div>
        );
    }

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
                            <span className="gpa-value">{gpa}</span>
                        </div>
                    </div>
                </div>

                {grades.length > 0 ? (
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
                ) : (
                    <div className="empty-state-detail">
                        <Inbox size={48} />
                        <h3>No grades found</h3>
                        <p>We couldn't find any grade records for this term. Please check back after your assessments are graded.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentGrades;
