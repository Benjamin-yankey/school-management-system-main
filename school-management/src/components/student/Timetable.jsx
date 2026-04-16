import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Calendar, CheckSquare, Download, Inbox } from "lucide-react";
import api from "../../lib/api";
import "./StudentFeatures.css";
import { generateTimetablePDF } from "../../pages/generateTimetablePDF";
import { generateTimetableICS } from "../../lib/generateICS";

const StudentTimetable = () => {
    const { user } = useAuth();
    const [timetable, setTimetable] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimetable = async () => {
            setLoading(true);
            try {
                if (user?.id) {
                    const data = await api.getStudentTimetable(user.id);
                    setTimetable(Array.isArray(data) ? data : []);
                }
            } catch (err) {
                console.error("Failed to fetch timetable:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTimetable();
    }, [user]);

    const handleDownloadPDF = () => {
        generateTimetablePDF(user, timetable);
    };

    const handleSyncCalendar = () => {
        generateTimetableICS(timetable);
    };

    if (loading) {
        return (
            <div className="student-portal-detail">
                <div className="loading-container">
                    <div className="loader"></div>
                    <p>Loading timetable...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="student-portal-detail">
            <div className="detail-header">
                <h1>Academic Timetable</h1>
                <p>Plan your week and never miss a class</p>
                <div className="header-actions">
                    <button className="download-btn-header" onClick={handleDownloadPDF}><Download size={14} /> Download PDF</button>
                    <button className="calendar-sync-btn" onClick={handleSyncCalendar}><Calendar size={14} /> Sync to Device Calendar</button>
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
