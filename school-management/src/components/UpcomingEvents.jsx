import React from "react";
import { generateUpcomingEvents } from "../lib/dashboardData";

const UpcomingEvents = () => {
  const events = generateUpcomingEvents();

  const getEventIcon = (type) => {
    const icons = {
      meeting: "👥",
      exam: "📝",
      event: "🎉",
      holiday: "🏖️",
    };
    return icons[type] || "📅";
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: { color: "#f56565", text: "High" },
      medium: { color: "#ed8936", text: "Medium" },
      low: { color: "#48bb78", text: "Low" },
    };
    return badges[priority] || badges.medium;
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="panel">
      <h3>Upcoming Events</h3>
      <div className="events-list">
        {events.map((event) => {
          const priorityBadge = getPriorityBadge(event.priority);
          return (
            <div key={event.id} className="event-item">
              <div className="event-icon">{getEventIcon(event.type)}</div>
              <div className="event-content">
                <div className="event-header">
                  <h4 className="event-title">{event.title}</h4>
                  <span
                    className="priority-badge"
                    style={{
                      backgroundColor: `${priorityBadge.color}20`,
                      color: priorityBadge.color,
                    }}
                  >
                    {priorityBadge.text}
                  </span>
                </div>
                <div className="event-details">
                  <span className="event-date">
                    📅 {formatEventDate(event.date)}
                  </span>
                  <span className="event-time">🕐 {event.time}</span>
                </div>
                <div className="event-type">
                  Type: <span className="type-badge">{event.type}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingEvents;
