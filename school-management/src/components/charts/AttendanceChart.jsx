import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AttendanceChart = ({ data = [] }) => {
  // Default data if none provided
  const defaultData = [
    { name: "Mon", present: 45, absent: 5 },
    { name: "Tue", present: 42, absent: 8 },
    { name: "Wed", present: 48, absent: 2 },
    { name: "Thu", present: 44, absent: 6 },
    { name: "Fri", present: 46, absent: 4 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const present = payload.find((p) => p.dataKey === "present")?.value || 0;
      const absent = payload.find((p) => p.dataKey === "absent")?.value || 0;
      const total = present + absent;
      const attendanceRate =
        total > 0 ? Math.round((present / total) * 100) : 0;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-green-600">Present: {present}</p>
          <p className="text-red-600">Absent: {absent}</p>
          <p className="text-blue-600 font-medium">
            Attendance: {attendanceRate}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            fontSize={12}
            fontWeight={500}
          />
          <YAxis stroke="#6b7280" fontSize={12} fontWeight={500} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="present"
            fill="#10b981"
            name="Present"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="absent"
            fill="#ef4444"
            name="Absent"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AttendanceChart;
