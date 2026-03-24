import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Users, AlertCircle } from "lucide-react";
import "./EventList.css";

const EventList = ({ dateParam = null, events = [] }) => {
  const [eventList, setEventList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to get events for the selected date
    const fetchEvents = async () => {
      setLoading(true);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock events data - in real app this would come from your database
      const mockEvents = [
        {
          id: 1,
          title: "Parent-Teacher Meeting",
          description:
            "Monthly parent-teacher conference for Grade 10 students",
          startTime: new Date(2025, 0, 20, 10, 0),
          endTime: new Date(2025, 0, 20, 11, 0),
          location: "Main Hall",
          type: "meeting",
          attendees: ["Parents", "Teachers"],
          priority: "high",
        },
        {
          id: 2,
          title: "Mid-Term Examinations",
          description: "Mathematics and Science mid-term exams for all grades",
          startTime: new Date(2025, 0, 20, 9, 0),
          endTime: new Date(2025, 0, 20, 12, 0),
          location: "Classrooms",
          type: "exam",
          attendees: ["Students", "Teachers"],
          priority: "high",
        },
        {
          id: 3,
          title: "Science Fair",
          description: "Student science project exhibition and competition",
          startTime: new Date(2025, 0, 21, 9, 0),
          endTime: new Date(2025, 0, 21, 15, 0),
          location: "Science Lab",
          type: "event",
          attendees: ["Students", "Teachers", "Parents"],
          priority: "medium",
        },
        {
          id: 4,
          title: "Sports Day",
          description: "Annual sports day with various competitions",
          startTime: new Date(2025, 0, 22, 8, 0),
          endTime: new Date(2025, 0, 22, 16, 0),
          location: "Sports Ground",
          type: "event",
          attendees: ["Students", "Teachers", "Parents"],
          priority: "medium",
        },
        {
          id: 5,
          title: "Staff Meeting",
          description: "Weekly staff meeting to discuss school matters",
          startTime: new Date(2025, 0, 23, 14, 0),
          endTime: new Date(2025, 0, 23, 15, 30),
          location: "Conference Room",
          type: "meeting",
          attendees: ["Staff"],
          priority: "low",
        },
      ];

      // Filter events by date if dateParam is provided
      let filteredEvents = mockEvents;
      if (dateParam) {
        const selectedDate = new Date(dateParam);
        filteredEvents = mockEvents.filter((event) => {
          const eventDate = new Date(event.startTime);
          return (
            eventDate.getDate() === selectedDate.getDate() &&
            eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear()
          );
        });
      }

      // Use provided events or filtered mock events
      setEventList(events.length > 0 ? events : filteredEvents);
      setLoading(false);
    };

    fetchEvents();
  }, [dateParam, events]);

  const getEventTypeColor = (type) => {
    const colors = {
      meeting: "#3b82f6",
      exam: "#ef4444",
      event: "#10b981",
      announcement: "#f59e0b",
      holiday: "#8b5cf6",
    };
    return colors[type] || "#6b7280";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: "#ef4444",
      medium: "#f59e0b",
      low: "#10b981",
    };
    return colors[priority] || "#6b7280";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="event-list-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading events...</p>
        </div>
      </div>
    );
  }

  if (eventList.length === 0) {
    return (
      <div className="event-list-container">
        <div className="no-events">
          <Calendar className="no-events-icon" />
          <h3 className="no-events-title">No Events</h3>
          <p className="no-events-text">
            {dateParam
              ? `No events scheduled for ${formatDate(new Date(dateParam))}`
              : "No events scheduled for today"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      <div className="event-list-header">
        <h3 className="event-list-title">
          {dateParam
            ? `Events for ${formatDate(new Date(dateParam))}`
            : "Today's Events"}
        </h3>
        <span className="event-count">{eventList.length} events</span>
      </div>

      <div className="events-list">
        {eventList.map((event, index) => (
          <div
            key={event.id}
            className={`event-item ${index % 2 === 0 ? "even" : "odd"}`}
            style={{
              borderTopColor: index % 2 === 0 ? "#60a5fa" : "#8b5cf6",
            }}
          >
            <div className="event-header">
              <div className="event-title-section">
                <h4 className="event-title">{event.title}</h4>
                <div className="event-meta">
                  <span
                    className="event-type"
                    style={{
                      backgroundColor: `${getEventTypeColor(event.type)}20`,
                      color: getEventTypeColor(event.type),
                    }}
                  >
                    {event.type}
                  </span>
                  <span
                    className="event-priority"
                    style={{
                      backgroundColor: `${getPriorityColor(event.priority)}20`,
                      color: getPriorityColor(event.priority),
                    }}
                  >
                    {event.priority}
                  </span>
                </div>
              </div>
              <div className="event-time">
                <Clock className="time-icon" />
                <span className="time-text">
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </span>
              </div>
            </div>

            <p className="event-description">{event.description}</p>

            <div className="event-details">
              {event.location && (
                <div className="event-detail-item">
                  <MapPin className="detail-icon" />
                  <span className="detail-text">{event.location}</span>
                </div>
              )}

              <div className="event-detail-item">
                <Users className="detail-icon" />
                <span className="detail-text">
                  {event.attendees.join(", ")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;
