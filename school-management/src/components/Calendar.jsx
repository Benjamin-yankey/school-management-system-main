import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import './Calendar.css';

const Calendar = ({ events = [], onEventClick, onAddEvent, onEditEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [showEventForm, setShowEventForm] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Mock events data
  const mockEvents = [
    {
      id: 1,
      title: 'Parent-Teacher Meeting',
      date: '2025-01-20',
      time: '10:00 AM',
      type: 'meeting',
      priority: 'high',
      location: 'Main Hall',
      attendees: ['Parents', 'Teachers'],
      description: 'Monthly parent-teacher conference'
    },
    {
      id: 2,
      title: 'Mid-Term Exams',
      date: '2025-01-25',
      time: 'All Day',
      type: 'exam',
      priority: 'high',
      location: 'Classrooms',
      attendees: ['Students', 'Teachers'],
      description: 'Mid-term examination week'
    },
    {
      id: 3,
      title: 'Sports Day',
      date: '2025-02-10',
      time: '8:00 AM',
      type: 'event',
      priority: 'medium',
      location: 'Sports Ground',
      attendees: ['Students', 'Teachers', 'Parents'],
      description: 'Annual sports day competition'
    },
    {
      id: 4,
      title: 'Science Fair',
      date: '2025-02-15',
      time: '9:00 AM',
      type: 'event',
      priority: 'medium',
      location: 'Science Lab',
      attendees: ['Students', 'Teachers'],
      description: 'Student science project exhibition'
    },
    {
      id: 5,
      title: 'School Assembly',
      date: '2025-01-18',
      time: '8:30 AM',
      type: 'assembly',
      priority: 'low',
      location: 'Assembly Hall',
      attendees: ['Students', 'Teachers'],
      description: 'Weekly school assembly'
    }
  ];

  const allEvents = [...events, ...mockEvents];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return allEvents.filter(event => event.date === dateString);
  };

  const getEventsForToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return allEvents.filter(event => event.date === today);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventTypeColor = (type) => {
    const colors = {
      meeting: '#3b82f6',
      exam: '#ef4444',
      event: '#10b981',
      assembly: '#f59e0b',
      holiday: '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };
    return colors[priority] || '#6b7280';
  };

  const formatEventTime = (time) => {
    if (time === 'All Day') return time;
    return time;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const todayEvents = getEventsForToday();

  return (
    <div className="calendar-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button onClick={() => navigateMonth(-1)} className="nav-btn">
            <ChevronLeft />
          </button>
          <h2 className="calendar-title">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={() => navigateMonth(1)} className="nav-btn">
            <ChevronRight />
          </button>
        </div>
        
        <div className="calendar-actions">
          <button onClick={navigateToToday} className="btn btn-secondary">
            Today
          </button>
          <button onClick={() => setShowEventForm(true)} className="btn btn-primary">
            <Plus className="btn-icon" />
            Add Event
          </button>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="view-selector">
        <button 
          className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
          onClick={() => setViewMode('month')}
        >
          Month
        </button>
        <button 
          className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
          onClick={() => setViewMode('week')}
        >
          Week
        </button>
        <button 
          className={`view-btn ${viewMode === 'day' ? 'active' : ''}`}
          onClick={() => setViewMode('day')}
        >
          Day
        </button>
      </div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <div className="today-events">
          <h3 className="today-events-title">
            <CalendarIcon className="section-icon" />
            Today's Events
          </h3>
          <div className="events-list">
            {todayEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-header">
                  <h4 className="event-title">{event.title}</h4>
                  <span 
                    className="event-type-badge"
                    style={{ backgroundColor: `${getEventTypeColor(event.type)}20`, color: getEventTypeColor(event.type) }}
                  >
                    {event.type}
                  </span>
                </div>
                <div className="event-details">
                  <div className="event-time">
                    <Clock size={14} />
                    {formatEventTime(event.time)}
                  </div>
                  <div className="event-location">
                    <MapPin size={14} />
                    {event.location}
                  </div>
                  <div className="event-attendees">
                    <Users size={14} />
                    {event.attendees.join(', ')}
                  </div>
                </div>
                <p className="event-description">{event.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Day Headers */}
        <div className="calendar-weekdays">
          {days.map(day => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="calendar-days">
          {daysInMonth.map((day, index) => {
            const isToday = day && day.toDateString() === new Date().toDateString();
            const isSelected = day && day.toDateString() === selectedDate.toDateString();
            const dayEvents = getEventsForDate(day);
            
            return (
              <div
                key={index}
                className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
                onClick={() => day && setSelectedDate(day)}
              >
                {day && (
                  <>
                    <div className="day-number">{day.getDate()}</div>
                    <div className="day-events">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="day-event"
                          style={{ backgroundColor: getEventTypeColor(event.type) }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick && onEventClick(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="more-events">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventForm && (
        <EventFormModal
          onClose={() => setShowEventForm(false)}
          onSubmit={onAddEvent}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

// Event Form Modal Component
const EventFormModal = ({ onClose, onSubmit, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: selectedDate.toISOString().split('T')[0],
    time: '09:00',
    type: 'event',
    priority: 'medium',
    location: '',
    attendees: '',
    description: ''
  });

  const eventTypes = [
    { value: 'meeting', label: 'Meeting' },
    { value: 'exam', label: 'Exam' },
    { value: 'event', label: 'Event' },
    { value: 'assembly', label: 'Assembly' },
    { value: 'holiday', label: 'Holiday' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      attendees: formData.attendees.split(',').map(a => a.trim()).filter(a => a),
      id: Date.now()
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Event</h2>
          <button onClick={onClose} className="close-btn">
            <X />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Time *</label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-select"
                required
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              placeholder="Event location"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Attendees</label>
            <input
              type="text"
              name="attendees"
              value={formData.attendees}
              onChange={handleChange}
              className="form-input"
              placeholder="Students, Teachers, Parents (comma separated)"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-textarea"
              rows="3"
              placeholder="Event description"
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Calendar;
