import React from "react";
import { generateTopPerformers } from "../lib/dashboardData";

const TopPerformers = () => {
  const performers = generateTopPerformers();

  const getRankIcon = (rank) => {
    const icons = {
      1: "🥇",
      2: "🥈",
      3: "🥉",
    };
    return icons[rank] || "🏆";
  };

  const getRankColor = (rank) => {
    const colors = {
      1: "#ffd700",
      2: "#c0c0c0",
      3: "#cd7f32",
    };
    return colors[rank] || "#667eea";
  };

  return (
    <div className="panel">
      <h3>Top Performers</h3>
      <div className="performers-list">
        {performers.map((performer) => (
          <div key={performer.id} className="performer-item">
            <div className="performer-rank">
              <span className="rank-icon">{getRankIcon(performer.rank)}</span>
              <span
                className="rank-number"
                style={{ color: getRankColor(performer.rank) }}
              >
                #{performer.rank}
              </span>
            </div>
            <div className="performer-info">
              <div className="performer-name">{performer.name}</div>
              <div className="performer-class">Class {performer.class}</div>
              <div className="performer-subject">{performer.subject}</div>
            </div>
            <div className="performer-score">
              <div className="score-value">{performer.score}%</div>
              <div className="score-label">Score</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformers;
