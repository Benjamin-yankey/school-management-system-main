import React, { useState, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import CountChart from "./CountChart";
import "./CountChartContainer.css";

const CountChartContainer = () => {
  const [studentData, setStudentData] = useState({ boys: 0, girls: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get student data
    const fetchStudentData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock student data - in real app this would come from your database
      const mockData = {
        boys: Math.floor(Math.random() * 200) + 150, // 150-350 boys
        girls: Math.floor(Math.random() * 200) + 120, // 120-320 girls
      };

      setStudentData(mockData);
      setLoading(false);
    };

    fetchStudentData();
  }, []);

  const { boys, girls } = studentData;
  const total = boys + girls;

  if (loading) {
    return (
      <div className="count-chart-container">
        <div className="chart-header">
          <h1 className="chart-title">Students</h1>
          <MoreHorizontal className="more-icon" />
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="count-chart-container">
      <div className="chart-header">
        <h1 className="chart-title">Students</h1>
        <button className="more-btn">
          <MoreHorizontal className="more-icon" />
        </button>
      </div>

      {/* Chart */}
      <div className="chart-section">
        <CountChart boys={boys} girls={girls} />
      </div>

      {/* Statistics */}
      <div className="stats-section">
        <div className="stat-item">
          <div className="stat-icon boys">
            <div className="stat-dot"></div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{boys}</div>
            <div className="stat-label">
              Boys ({total > 0 ? Math.round((boys / total) * 100) : 0}%)
            </div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon girls">
            <div className="stat-dot"></div>
          </div>
          <div className="stat-content">
            <div className="stat-number">{girls}</div>
            <div className="stat-label">
              Girls ({total > 0 ? Math.round((girls / total) * 100) : 0}%)
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="additional-info">
        <div className="info-item">
          <span className="info-label">Total Students</span>
          <span className="info-value">{total}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Gender Ratio</span>
          <span className="info-value">
            {boys > girls
              ? `${Math.round((boys / girls) * 10) / 10}:1`
              : `${Math.round((girls / boys) * 10) / 10}:1`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CountChartContainer;
