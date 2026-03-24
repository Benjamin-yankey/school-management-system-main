import React from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, Cell } from "recharts";
import { Users, User, UserCheck } from "lucide-react";
import "./CountChart.css";

const CountChart = ({ boys = 0, girls = 0 }) => {
  const total = boys + girls;

  const data = [
    {
      name: "Total",
      count: total,
      fill: "#e5e7eb",
    },
    {
      name: "Girls",
      count: girls,
      fill: "#fbbf24", // Gold color for girls
    },
    {
      name: "Boys",
      count: boys,
      fill: "#60a5fa", // Blue color for boys
    },
  ];

  const boysPercentage = total > 0 ? Math.round((boys / total) * 100) : 0;
  const girlsPercentage = total > 0 ? Math.round((girls / total) * 100) : 0;

  return (
    <div className="count-chart-container">
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="40%"
            outerRadius="100%"
            barSize={32}
            data={data}
            startAngle={90}
            endAngle={450}
          >
            <RadialBar dataKey="count" cornerRadius={8} fill="#8884d8" />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center Icon */}
        <div className="chart-center">
          <div className="center-icon">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <div className="center-text">
            <span className="total-number">{total}</span>
            <span className="total-label">Total</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-icon boys">
            <User className="w-4 h-4" />
          </div>
          <div className="legend-content">
            <div className="legend-number">{boys}</div>
            <div className="legend-label">Boys ({boysPercentage}%)</div>
          </div>
        </div>

        <div className="legend-item">
          <div className="legend-icon girls">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="legend-content">
            <div className="legend-number">{girls}</div>
            <div className="legend-label">Girls ({girlsPercentage}%)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountChart;
