import React from "react";
import { generateNotifications } from "../lib/dashboardData";

const Notifications = () => {
  const notifications = generateNotifications();

  const getNotificationIcon = (type) => {
    const icons = {
      info: "🔵",
      warning: "🟡",
      success: "🟢",
      error: "🔴",
    };
    return icons[type] || "🔵";
  };

  const getNotificationBgColor = (type) => {
    const colors = {
      info: "#e6f3ff",
      warning: "#fff3cd",
      success: "#d4edda",
      error: "#f8d7da",
    };
    return colors[type] || "#e6f3ff";
  };

  const getNotificationBorderColor = (type) => {
    const colors = {
      info: "#007bff",
      warning: "#ffc107",
      success: "#28a745",
      error: "#dc3545",
    };
    return colors[type] || "#007bff";
  };

  return (
    <div className="panel">
      <h3>Recent Notifications</h3>
      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="notification"
            style={{
              borderLeftColor: getNotificationBorderColor(notification.type),
              backgroundColor: getNotificationBgColor(notification.type),
            }}
          >
            <div
              className="notification-icon"
              style={{
                backgroundColor: `${getNotificationBorderColor(
                  notification.type
                )}20`,
              }}
            >
              {getNotificationIcon(notification.type)}
            </div>
            <div className="notification-content">
              <div className="notification-title">{notification.title}</div>
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">{notification.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
