import React, { useState } from 'react';
import { X, Save, Users, BookOpen, Calendar, Clock } from 'lucide-react';
import './FormStyles.css';

const ClassForm = ({ isOpen, onClose, onSubmit, classData = null }) => {
  const [formData, setFormData] = useState({
    name: classData?.name || '',
    grade: classData?.grade || '',
    section: classData?.section || '',
    capacity: classData?.capacity || 30,
    subject: classData?.subject || '',
    teacherId: classData?.teacherId || '',
    schedule: classData?.schedule || {
      monday: { start: '09:00', end: '10:00' },
      tuesday: { start: '09:00', end: '10:00' },
      wednesday: { start: '09:00', end: '10:00' },
      thursday: { start: '09:00', end: '10:00' },
      friday: { start: '09:00', end: '10:00' }
    },
    room: classData?.room || '',
    description: classData?.description || ''
  });

  const [errors, setErrors] = useState({});

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D', 'E', 'F'];
  const subjects = [
    'Mathematics', 'English', 'Science', 'Social Studies', 'Physics', 
    'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science',
    'Art', 'Music', 'Physical Education', 'Economics', 'Business Studies'
  ];

  const mockTeachers = [
    { id: '1', name: 'John Smith', subject: 'Mathematics' },
    { id: '2', name: 'Sarah Johnson', subject: 'English' },
    { id: '3', name: 'Mike Davis', subject: 'Science' },
    { id: '4', name: 'Lisa Wilson', subject: 'History' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleScheduleChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          [field]: value
        }
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Class name is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.section) newErrors.section = 'Section is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Valid capacity is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content form-modal">
        <div className="modal-header">
          <div className="modal-title">
            <BookOpen className="modal-icon" />
            <h2>{classData ? 'Edit Class' : 'Create New Class'}</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Class Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g., Grade 10-A"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Grade *</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className={`form-select ${errors.grade ? 'error' : ''}`}
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                  {errors.grade && <span className="error-message">{errors.grade}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Section *</label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className={`form-select ${errors.section ? 'error' : ''}`}
                  >
                    <option value="">Select Section</option>
                    {sections.map(section => (
                      <option key={section} value={section}>Section {section}</option>
                    ))}
                  </select>
                  {errors.section && <span className="error-message">{errors.section}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Capacity *</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className={`form-input ${errors.capacity ? 'error' : ''}`}
                    min="1"
                    max="50"
                  />
                  {errors.capacity && <span className="error-message">{errors.capacity}</span>}
                </div>
              </div>
            </div>

            {/* Subject & Teacher */}
            <div className="form-section">
              <h3 className="section-title">Subject & Teacher</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject *</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`form-select ${errors.subject ? 'error' : ''}`}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  {errors.subject && <span className="error-message">{errors.subject}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Teacher *</label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleChange}
                    className={`form-select ${errors.teacherId ? 'error' : ''}`}
                  >
                    <option value="">Select Teacher</option>
                    {mockTeachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.subject}
                      </option>
                    ))}
                  </select>
                  {errors.teacherId && <span className="error-message">{errors.teacherId}</span>}
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="form-section">
              <h3 className="section-title">
                <Calendar className="section-icon" />
                Class Schedule
              </h3>
              
              <div className="schedule-grid">
                {Object.entries(formData.schedule).map(([day, time]) => (
                  <div key={day} className="schedule-day">
                    <label className="schedule-day-label">{day.charAt(0).toUpperCase() + day.slice(1)}</label>
                    <div className="time-inputs">
                      <input
                        type="time"
                        value={time.start}
                        onChange={(e) => handleScheduleChange(day, 'start', e.target.value)}
                        className="time-input"
                      />
                      <span className="time-separator">to</span>
                      <input
                        type="time"
                        value={time.end}
                        onChange={(e) => handleScheduleChange(day, 'end', e.target.value)}
                        className="time-input"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Room 101"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Additional notes about the class..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save className="btn-icon" />
              {classData ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
