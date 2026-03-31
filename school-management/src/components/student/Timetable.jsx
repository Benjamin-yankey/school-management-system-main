import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Calendar, CheckSquare, Download, Inbox } from "lucide-react";
import "./StudentFeatures.css";

const StudentTimetable = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);

    return (
        <div className="student-portal-detail">
            <div className="detail-header">
                <Link to="/student/dashboard" className="back-link">
                    <ArrowLeft size={18} /> Back to Dashboard
                </Link>
                <h1>Academic Timetable</h1>
                <p>Plan your week and never miss a class</p>
                <div className="header-actions">
                    <button className="download-btn-header"><Download size={14} /> Download PDF</button>
                    <button className="calendar-sync-btn"><Calendar size={14} /> Sync to Google Calendar</button>
                </div>
            </div>

            <div className="detail-content">
                {timetable.length > 0 ? (
                    <div className="timetable-matrix">
                        {timetable.map(day => (
                            <div key={day.day} className="day-column">
                                <h3 className="day-header">{day.day}</h3>
                                <div className="day-classes">
                                    {day.classes.map(cls => (
                                        <div key={cls.id} className="class-card">
                                            <div className="class-subject">{cls.subject}</div>
                                            <div className="class-time"><Clock size={12} /> {cls.time}</div>
                                            <div className="class-duration"><CheckSquare size={12} /> {cls.duration}</div>
                                            <div className="class-room"><MapPin size={12} /> {cls.room}</div>
                                            <div className="class-teacher">👨‍🏫 {cls.teacher}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state-detail">
                        <Inbox size={48} />
                        <h3>Timetable not available</h3>
                        <p>Academic timetable is not yet available for this term. Please check back after registration is complete.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentTimetable;
