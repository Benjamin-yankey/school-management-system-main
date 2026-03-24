import React, { useState, useEffect } from "react";
import {
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./FinanceChart.css";

const FinanceChart = () => {
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("year");

  // Mock data for different periods
  const mockData = {
    year: [
      { name: "Jan", income: 40000, expense: 24000 },
      { name: "Feb", income: 30000, expense: 13980 },
      { name: "Mar", income: 20000, expense: 9800 },
      { name: "Apr", income: 27800, expense: 39080 },
      { name: "May", income: 18900, expense: 48000 },
      { name: "Jun", income: 23900, expense: 38000 },
      { name: "Jul", income: 34900, expense: 43000 },
      { name: "Aug", income: 34900, expense: 43000 },
      { name: "Sep", income: 34900, expense: 43000 },
      { name: "Oct", income: 34900, expense: 43000 },
      { name: "Nov", income: 34900, expense: 43000 },
      { name: "Dec", income: 34900, expense: 43000 },
    ],
    month: [
      { name: "Week 1", income: 8000, expense: 6000 },
      { name: "Week 2", income: 9500, expense: 7200 },
      { name: "Week 3", income: 8700, expense: 5800 },
      { name: "Week 4", income: 9200, expense: 6500 },
    ],
    quarter: [
      { name: "Q1", income: 90000, expense: 52000 },
      { name: "Q2", income: 85000, expense: 48000 },
      { name: "Q3", income: 105000, expense: 67000 },
      { name: "Q4", income: 95000, expense: 55000 },
    ],
  };

  useEffect(() => {
    const loadFinanceData = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setFinanceData(mockData[selectedPeriod] || mockData.year);
      setLoading(false);
    };

    loadFinanceData();
  }, [selectedPeriod]);

  const calculateTotals = () => {
    const totalIncome = financeData.reduce((sum, item) => sum + item.income, 0);
    const totalExpense = financeData.reduce(
      (sum, item) => sum + item.expense,
      0
    );
    const netProfit = totalIncome - totalExpense;
    const profitMargin =
      totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

    return { totalIncome, totalExpense, netProfit, profitMargin };
  };

  const { totalIncome, totalExpense, netProfit, profitMargin } =
    calculateTotals();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const income = payload.find((p) => p.dataKey === "income")?.value || 0;
      const expense = payload.find((p) => p.dataKey === "expense")?.value || 0;
      const profit = income - expense;

      return (
        <div className="finance-tooltip">
          <p className="tooltip-label">{label}</p>
          <div className="tooltip-content">
            <div className="tooltip-item income">
              <span className="tooltip-dot"></span>
              <span>Income: ${income.toLocaleString()}</span>
            </div>
            <div className="tooltip-item expense">
              <span className="tooltip-dot"></span>
              <span>Expense: ${expense.toLocaleString()}</span>
            </div>
            <div className="tooltip-item profit">
              <span className="tooltip-dot"></span>
              <span>Profit: ${profit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="finance-chart-container">
        <div className="chart-header">
          <h1 className="chart-title">Finance</h1>
          <MoreHorizontal className="more-icon" />
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-chart-container">
      <div className="chart-header">
        <h1 className="chart-title">Finance</h1>
        <div className="header-actions">
          <div className="period-selector">
            <button
              className={`period-btn ${
                selectedPeriod === "month" ? "active" : ""
              }`}
              onClick={() => setSelectedPeriod("month")}
            >
              Month
            </button>
            <button
              className={`period-btn ${
                selectedPeriod === "quarter" ? "active" : ""
              }`}
              onClick={() => setSelectedPeriod("quarter")}
            >
              Quarter
            </button>
            <button
              className={`period-btn ${
                selectedPeriod === "year" ? "active" : ""
              }`}
              onClick={() => setSelectedPeriod("year")}
            >
              Year
            </button>
          </div>
          <button className="more-btn">
            <MoreHorizontal className="more-icon" />
          </button>
        </div>
      </div>

      {/* Finance Summary */}
      <div className="finance-summary">
        <div className="summary-card income">
          <div className="summary-icon">
            <TrendingUp className="icon" />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Income</div>
            <div className="summary-value">${totalIncome.toLocaleString()}</div>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="summary-icon">
            <TrendingDown className="icon" />
          </div>
          <div className="summary-content">
            <div className="summary-label">Total Expense</div>
            <div className="summary-value">
              ${totalExpense.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="summary-card profit">
          <div className="summary-icon">
            <DollarSign className="icon" />
          </div>
          <div className="summary-content">
            <div className="summary-label">Net Profit</div>
            <div className="summary-value">
              ${netProfit.toLocaleString()}
              <span className="profit-margin">({profitMargin}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={financeData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              stroke="#6b7280"
              fontSize={12}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              fontWeight={500}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#60a5fa"
              strokeWidth={3}
              dot={{ fill: "#60a5fa", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#60a5fa", strokeWidth: 2 }}
              name="Income"
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke="#a78bfa"
              strokeWidth={3}
              dot={{ fill: "#a78bfa", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#a78bfa", strokeWidth: 2 }}
              name="Expense"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FinanceChart;
