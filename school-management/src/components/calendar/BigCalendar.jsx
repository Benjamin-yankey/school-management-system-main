import React, { useState } from "react";
import { Calendar, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./BigCalendar.css";

const localizer = Calendar.momentLocalizer(moment);

const BigCalendar = ({ data = [] }) => {
  const [view, setView] = useState(Views.WORK_WEEK);

  // Default mock data if none provided
  const defaultData = [
    {
      title: "Mathematics - Grade 10A",
      start: new Date(2025, 0, 20, 9, 0),
      end: new Date(2025, 0, 20, 10, 0),
    },
    {
      title: "Physics - Grade 11B",
      start: new Date(2025, 0, 20, 10, 30),
      end: new Date(2025, 0, 20, 11, 30),
    },
    {
      title: "English - Grade 9C",
      start: new Date(2025, 0, 20, 14, 0),
      end: new Date(2025, 0, 20, 15, 0),
    },
    {
      title: "Chemistry Lab - Grade 12A",
      start: new Date(2025, 0, 21, 9, 0),
      end: new Date(2025, 0, 21, 11, 0),
    },
    {
      title: "History - Grade 10B",
      start: new Date(2025, 0, 21, 11, 30),
      end: new Date(2025, 0, 21, 12, 30),
    },
    {
      title: "Mathematics - Grade 11A",
      start: new Date(2025, 0, 22, 9, 0),
      end: new Date(2025, 0, 22, 10, 0),
    },
    {
      title: "Biology - Grade 9A",
      start: new Date(2025, 0, 22, 10, 30),
      end: new Date(2025, 0, 22, 11, 30),
    },
    {
      title: "Computer Science - Grade 12B",
      start: new Date(2025, 0, 23, 14, 0),
      end: new Date(2025, 0, 23, 15, 30),
    },
    {
      title: "Geography - Grade 10C",
      start: new Date(2025, 0, 24, 9, 0),
      end: new Date(2025, 0, 24, 10, 0),
    },
  ];

  const events = data.length > 0 ? data : defaultData;

  const handleOnChangeView = (selectedView) => {
    setView(selectedView);
  };

  const eventStyleGetter = (event) => {
    // Color coding based on subject type
    let backgroundColor = "#3b82f6";

    if (event.title.includes("Mathematics")) backgroundColor = "#ef4444";
    else if (event.title.includes("Physics")) backgroundColor = "#8b5cf6";
    else if (event.title.includes("Chemistry")) backgroundColor = "#10b981";
    else if (event.title.includes("Biology")) backgroundColor = "#f59e0b";
    else if (event.title.includes("English")) backgroundColor = "#06b6d4";
    else if (event.title.includes("History")) backgroundColor = "#84cc16";
    else if (event.title.includes("Computer Science"))
      backgroundColor = "#6366f1";
    else if (event.title.includes("Geography")) backgroundColor = "#ec4899";

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: 0.8,
        color: "white",
        border: "none",
        fontSize: "12px",
        fontWeight: "500",
      },
    };
  };

  return (
    <div className="big-calendar-container">
      <div className="calendar-controls">
        <div className="view-selector">
          <button
            className={`view-btn ${view === Views.WORK_WEEK ? "active" : ""}`}
            onClick={() => setView(Views.WORK_WEEK)}
          >
            Work Week
          </button>
          <button
            className={`view-btn ${view === Views.DAY ? "active" : ""}`}
            onClick={() => setView(Views.DAY)}
          >
            Day
          </button>
        </div>
      </div>

      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          views={[Views.WORK_WEEK, Views.DAY]}
          view={view}
          onView={handleOnChangeView}
          min={new Date(2025, 0, 0, 8, 0, 0)}
          max={new Date(2025, 0, 0, 17, 0, 0)}
          eventPropGetter={eventStyleGetter}
          style={{ height: "500px" }}
          step={30}
          timeslots={2}
          popup={true}
          showMultiDayTimes={false}
          formats={{
            dayFormat: "dddd",
            dayHeaderFormat: "dddd, MMM Do",
            dayRangeHeaderFormat: ({ start, end }) =>
              `${moment(start).format("MMM Do")} - ${moment(end).format(
                "MMM Do, YYYY"
              )}`,
            timeGutterFormat: "HH:mm",
            eventTimeRangeFormat: ({ start, end }) =>
              `${moment(start).format("HH:mm")} - ${moment(end).format(
                "HH:mm"
              )}`,
          }}
        />
      </div>
    </div>
  );
};

export default BigCalendar;
