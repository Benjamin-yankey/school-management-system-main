import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Calendar, CheckSquare, Download } from "lucide-react";
import "./StudentFeatures.css";

const StudentTimetable = () => {
    const { user } = useAuth();

    const timetable = [
        {
            day: "Monday",
            classes: [
                { id: 1, subject: "Mathematics", time: "9:00 AM", duration: "1h 30m", room: "Room 101", teacher: "Mr. Johnson" },
                { id: 2, subject: "Physics", time: "11:00 AM", duration: "1h 30m", room: "Lab 2", teacher: "Dr. Smith" }
            ]
        },
        {
            day: "Tuesday",
            classes: [
                { id: 3, subject: "English", time: "10:00 AM", duration: "1h", room: "Room 205", teacher: "Mrs. Wilson" },
                { id: 4, subject: "Biology", time: "2:00 PM", duration: "1h 30m", room: "Lab 1", teacher: "Ms. Davis" }
            ]
        },
        {
            day: "Wednesday",
            classes: [
                { id: 5, subject: "Mathematics", time: "9:00 AM", duration: "1h 30m", room: "Room 101", teacher: "Mr. Johnson" },
                { id: 6, subject: "Chemistry", time: "11:30 AM", duration: "1h 30m", room: "Lab 1", teacher: "Ms. Davis" }
            ]
        },
        {
            day: "Thursday",
            classes: [
                { id: 7, subject: "Physics", time: "10:00 AM", duration: "1h 30m", room: "Room 101", teacher: "Dr. Smith" },
                { id: 8, subject: "Art", time: "1:00 PM", duration: "2h", room: "Studio 1", teacher: "Ms. Green" }
            ]
        },
        {
            day: "Friday",
            classes: [
                { id: 9, subject: "History", time: "9:00 AM", duration: "1h 30m", room: "Room 205", teacher: "Mr. Brown" },
                { id: 10, subject: "Physical Education", time: "11:00 AM", duration: "1h 30m", room: "Gym", teacher: "Ms. Taylor" }
            ]
        }
    ];

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
            </div>
        </div>
    );
};

export default StudentTimetable;
