import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import "./EventCalendarContainer.css";

const EventCalendarContainer = ({ searchParams = {} }) => {
  const [selectedDate, setSelectedDate] = useState(
    searchParams.date ? new Date(searchParams.date) : new Date()
  );

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // In a real app, you might want to update the URL or call a callback
    // For now, we'll just update the local state
  };

  return (
    <div className="event-calendar-container">
      <div className="calendar-section">
        <div className="section-header">
          <h2 className="section-title">Event Calendar</h2>
          <button className="more-btn">
            <MoreHorizontal className="more-icon" />
          </button>
        </div>
        <EventCalendar
          onDateChange={handleDateChange}
          selectedDate={selectedDate}
        />
      </div>

      <div className="events-section">
        <div className="section-header">
          <h2 className="section-title">Events</h2>
          <button className="more-btn">
            <MoreHorizontal className="more-icon" />
          </button>
        </div>
        <EventList dateParam={selectedDate.toISOString().split("T")[0]} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
