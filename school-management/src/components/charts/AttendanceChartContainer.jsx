import React, { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import AttendanceChart from "./AttendanceChart";
import "./AttendanceChartContainer.css";

const AttendanceChartContainer = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get attendance data
    const fetchAttendanceData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock attendance data for the current week
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      // Generate mock data for the current week
      const mockData = [
        {
          name: "Mon",
          present: Math.floor(Math.random() * 20) + 30, // 30-50
          absent: Math.floor(Math.random() * 8) + 2, // 2-10
        },
        {
          name: "Tue",
          present: Math.floor(Math.random() * 20) + 30,
          absent: Math.floor(Math.random() * 8) + 2,
        },
        {
          name: "Wed",
          present: Math.floor(Math.random() * 20) + 30,
          absent: Math.floor(Math.random() * 8) + 2,
        },
        {
          name: "Thu",
          present: Math.floor(Math.random() * 20) + 30,
          absent: Math.floor(Math.random() * 8) + 2,
        },
        {
          name: "Fri",
          present: Math.floor(Math.random() * 20) + 30,
          absent: Math.floor(Math.random() * 8) + 2,
        },
      ];

      setAttendanceData(mockData);
      setLoading(false);
    };

    fetchAttendanceData();
  }, []);

  const totalPresent = attendanceData.reduce(
    (sum, day) => sum + day.present,
    0
  );
  const totalAbsent = attendanceData.reduce((sum, day) => sum + day.absent, 0);
  const totalStudents = totalPresent + totalAbsent;
  const attendanceRate =
    totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0;

  if (loading) {
    return (
      <div className="attendance-chart-container">
        <div className="chart-header">
          <h1 className="chart-title">Attendance</h1>
          <MoreHorizontal className="more-icon" />
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-chart-container">
      <div className="chart-header">
        <h1 className="chart-title">Attendance</h1>
        <button className="more-btn">
          <MoreHorizontal className="more-icon" />
        </button>
      </div>

      <div className="attendance-summary">
        <div className="summary-item">
          <span className="summary-label">Total Students</span>
          <span className="summary-value">{totalStudents}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Attendance Rate</span>
          <span
            className={`summary-value ${
              attendanceRate >= 90
                ? "high"
                : attendanceRate >= 80
                ? "medium"
                : "low"
            }`}
          >
            {attendanceRate}%
          </span>
        </div>
      </div>

      <AttendanceChart data={attendanceData} />

      <div className="attendance-legend">
        <div className="legend-item">
          <div className="legend-dot present"></div>
          <span className="legend-label">Present ({totalPresent})</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot absent"></div>
          <span className="legend-label">Absent ({totalAbsent})</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceChartContainer;
