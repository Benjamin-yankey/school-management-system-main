import React from "react";
import { generateQuickActions } from "../lib/dashboardData";

const QuickActions = ({ onActionClick }) => {
  const actions = generateQuickActions();

  const handleClick = (action) => {
    if (onActionClick) {
      onActionClick(action);
    } else {
      console.log(`Quick action clicked: ${action.label}`);
    }
  };

  return (
    <div className="quick-actions">
      {actions.map((action) => (
        <button
          key={action.id}
          className="action-btn"
          onClick={() => handleClick(action)}
        >
          <div
            className="icon"
            style={{ backgroundColor: `${action.color}20` }}
          >
            {action.icon}
          </div>
          <div className="text">{action.label}</div>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
