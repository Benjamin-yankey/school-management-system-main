import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./EventCalendar.css";

const EventCalendar = ({ onDateChange, selectedDate = new Date() }) => {
  const [value, setValue] = useState(selectedDate);

  const handleDateChange = (newValue) => {
    setValue(newValue);
    if (onDateChange) {
      onDateChange(newValue);
    }
  };

  // Custom tile content to show events on calendar
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      // Mock events data - in real app this would come from props or context
      const mockEvents = [
        { date: "2025-01-20", count: 2 },
        { date: "2025-01-21", count: 1 },
        { date: "2025-01-25", count: 3 },
        { date: "2025-01-28", count: 1 },
        { date: "2025-02-01", count: 2 },
        { date: "2025-02-05", count: 1 },
      ];

      const dateString = date.toISOString().split("T")[0];
      const dayEvents = mockEvents.find((event) => event.date === dateString);

      if (dayEvents) {
        return (
          <div className="calendar-event-indicator">
            <span className="event-dot" />
            {dayEvents.count > 1 && (
              <span className="event-count">+{dayEvents.count - 1}</span>
            )}
          </div>
        );
      }
    }
    return null;
  };

  // Highlight today
  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const today = new Date();
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        return "calendar-today";
      }

      // Highlight selected date
      if (
        date.getDate() === value.getDate() &&
        date.getMonth() === value.getMonth() &&
        date.getFullYear() === value.getFullYear()
      ) {
        return "calendar-selected";
      }
    }
    return null;
  };

  return (
    <div className="event-calendar-container">
      <Calendar
        onChange={handleDateChange}
        value={value}
        tileContent={tileContent}
        tileClassName={tileClassName}
        calendarType="US"
        showNeighboringMonth={false}
        formatShortWeekday={(locale, date) => {
          const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          return weekdays[date.getDay()];
        }}
        formatMonthYear={(locale, date) => {
          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          return `${months[date.getMonth()]} ${date.getFullYear()}`;
        }}
        next2Label={null}
        prev2Label={null}
      />
    </div>
  );
};

export default EventCalendar;
