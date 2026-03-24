import React, { useState } from 'react';
import { X, Save, BookOpen, Calendar, Clock, Users, FileText } from 'lucide-react';
import './FormStyles.css';

const ExamForm = ({ isOpen, onClose, onSubmit, examData = null }) => {
  const [formData, setFormData] = useState({
    title: examData?.title || '',
    subject: examData?.subject || '',
    classId: examData?.classId || '',
    examType: examData?.examType || 'midterm',
    date: examData?.date || '',
    startTime: examData?.startTime || '09:00',
    endTime: examData?.endTime || '11:00',
    duration: examData?.duration || 120,
    totalMarks: examData?.totalMarks || 100,
    passingMarks: examData?.passingMarks || 40,
    instructions: examData?.instructions || '',
    room: examData?.room || '',
    supervisor: examData?.supervisor || ''
  });

  const [errors, setErrors] = useState({});

  const examTypes = [
    { value: 'quiz', label: 'Quiz' },
    { value: 'midterm', label: 'Mid-term Exam' },
    { value: 'final', label: 'Final Exam' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'practical', label: 'Practical Exam' },
    { value: 'oral', label: 'Oral Exam' }
  ];

  const subjects = [
    'Mathematics', 'English', 'Science', 'Social Studies', 'Physics', 
    'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science',
    'Art', 'Music', 'Physical Education', 'Economics', 'Business Studies'
  ];

  const mockClasses = [
    { id: '1', name: 'Grade 10-A', subject: 'Mathematics' },
    { id: '2', name: 'Grade 10-B', subject: 'Mathematics' },
    { id: '3', name: 'Grade 11-A', subject: 'Physics' },
    { id: '4', name: 'Grade 11-B', subject: 'Chemistry' }
  ];

  const mockSupervisors = [
    { id: '1', name: 'John Smith' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Mike Davis' },
    { id: '4', name: 'Lisa Wilson' }
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Exam title is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.examType) newErrors.examType = 'Exam type is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.duration || formData.duration < 1) newErrors.duration = 'Valid duration is required';
    if (!formData.totalMarks || formData.totalMarks < 1) newErrors.totalMarks = 'Valid total marks is required';
    if (!formData.passingMarks || formData.passingMarks < 1) newErrors.passingMarks = 'Valid passing marks is required';

    // Validate passing marks is less than total marks
    if (formData.passingMarks >= formData.totalMarks) {
      newErrors.passingMarks = 'Passing marks must be less than total marks';
    }

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
            <h2>{examData ? 'Edit Exam' : 'Create New Exam'}</h2>
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
                <div className="form-group full-width">
                  <label className="form-label">Exam Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    placeholder="e.g., Mathematics Mid-term Exam"
                  />
                  {errors.title && <span className="error-message">{errors.title}</span>}
                </div>

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
                  <label className="form-label">Class *</label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className={`form-select ${errors.classId ? 'error' : ''}`}
                  >
                    <option value="">Select Class</option>
                    {mockClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - {cls.subject}
                      </option>
                    ))}
                  </select>
                  {errors.classId && <span className="error-message">{errors.classId}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Exam Type *</label>
                  <select
                    name="examType"
                    value={formData.examType}
                    onChange={handleChange}
                    className={`form-select ${errors.examType ? 'error' : ''}`}
                  >
                    {examTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.examType && <span className="error-message">{errors.examType}</span>}
                </div>
              </div>
            </div>

            {/* Date & Time */}
            <div className="form-section">
              <h3 className="section-title">
                <Calendar className="section-icon" />
                Date & Time
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Exam Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`form-input ${errors.date ? 'error' : ''}`}
                  />
                  {errors.date && <span className="error-message">{errors.date}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className={`form-input ${errors.startTime ? 'error' : ''}`}
                  />
                  {errors.startTime && <span className="error-message">{errors.startTime}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">End Time *</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className={`form-input ${errors.endTime ? 'error' : ''}`}
                  />
                  {errors.endTime && <span className="error-message">{errors.endTime}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (minutes) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className={`form-input ${errors.duration ? 'error' : ''}`}
                    min="1"
                    max="300"
                  />
                  {errors.duration && <span className="error-message">{errors.duration}</span>}
                </div>
              </div>
            </div>

            {/* Marks & Grading */}
            <div className="form-section">
              <h3 className="section-title">
                <FileText className="section-icon" />
                Marks & Grading
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Total Marks *</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleChange}
                    className={`form-input ${errors.totalMarks ? 'error' : ''}`}
                    min="1"
                    max="200"
                  />
                  {errors.totalMarks && <span className="error-message">{errors.totalMarks}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Passing Marks *</label>
                  <input
                    type="number"
                    name="passingMarks"
                    value={formData.passingMarks}
                    onChange={handleChange}
                    className={`form-input ${errors.passingMarks ? 'error' : ''}`}
                    min="1"
                    max={formData.totalMarks - 1}
                  />
                  {errors.passingMarks && <span className="error-message">{errors.passingMarks}</span>}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Room/Venue</label>
                  <input
                    type="text"
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Room 101, Hall A"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Supervisor</label>
                  <select
                    name="supervisor"
                    value={formData.supervisor}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select Supervisor</option>
                    {mockSupervisors.map(supervisor => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Instructions</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="4"
                    placeholder="Exam instructions for students..."
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
              {examData ? 'Update Exam' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamForm;
