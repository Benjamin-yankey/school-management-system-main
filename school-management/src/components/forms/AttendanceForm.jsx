import React, { useState } from 'react';
import { X, Save, Calendar, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './FormStyles.css';

const AttendanceForm = ({ isOpen, onClose, onSubmit, attendanceData = null }) => {
  const [formData, setFormData] = useState({
    date: attendanceData?.date || new Date().toISOString().split('T')[0],
    classId: attendanceData?.classId || '',
    subject: attendanceData?.subject || '',
    period: attendanceData?.period || '1',
    teacherId: attendanceData?.teacherId || '',
    students: attendanceData?.students || [],
    notes: attendanceData?.notes || ''
  });

  const [errors, setErrors] = useState({});

  const periods = [
    { value: '1', label: '1st Period (9:00 - 10:00)' },
    { value: '2', label: '2nd Period (10:00 - 11:00)' },
    { value: '3', label: '3rd Period (11:15 - 12:15)' },
    { value: '4', label: '4th Period (12:15 - 1:15)' },
    { value: '5', label: '5th Period (2:00 - 3:00)' },
    { value: '6', label: '6th Period (3:00 - 4:00)' }
  ];

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

  const mockClasses = [
    { id: '1', name: 'Grade 10-A', subject: 'Mathematics' },
    { id: '2', name: 'Grade 10-B', subject: 'Mathematics' },
    { id: '3', name: 'Grade 11-A', subject: 'Physics' },
    { id: '4', name: 'Grade 11-B', subject: 'Chemistry' }
  ];

  const mockStudents = [
    { id: '1', name: 'Emma Wilson', rollNumber: '1001', present: true },
    { id: '2', name: 'Liam Chen', rollNumber: '1002', present: true },
    { id: '3', name: 'Sophia Kumar', rollNumber: '1003', present: false },
    { id: '4', name: 'Noah Patel', rollNumber: '1004', present: true },
    { id: '5', name: 'Ava Singh', rollNumber: '1005', present: true },
    { id: '6', name: 'Ethan Brown', rollNumber: '1006', present: false },
    { id: '7', name: 'Isabella Davis', rollNumber: '1007', present: true },
    { id: '8', name: 'Mason Miller', rollNumber: '1008', present: true }
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

  const handleStudentAttendance = (studentId, status) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.map(student => 
        student.id === studentId ? { ...student, present: status } : student
      )
    }));
  };

  const markAllPresent = () => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.map(student => ({ ...student, present: true }))
    }));
  };

  const markAllAbsent = () => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.map(student => ({ ...student, present: false }))
    }));
  };

  const loadStudentsForClass = (classId) => {
    if (classId) {
      setFormData(prev => ({
        ...prev,
        classId,
        students: mockStudents.map(student => ({ ...student, present: true }))
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.period) newErrors.period = 'Period is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const attendanceSummary = {
        total: formData.students.length,
        present: formData.students.filter(s => s.present).length,
        absent: formData.students.filter(s => !s.present).length,
        percentage: Math.round((formData.students.filter(s => s.present).length / formData.students.length) * 100)
      };

      onSubmit({
        ...formData,
        summary: attendanceSummary
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content form-modal large-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Calendar className="modal-icon" />
            <h2>{attendanceData ? 'Edit Attendance' : 'Mark Attendance'}</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-grid">
            {/* Attendance Details */}
            <div className="form-section">
              <h3 className="section-title">Attendance Details</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date *</label>
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
                  <label className="form-label">Class *</label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={(e) => {
                      handleChange(e);
                      loadStudentsForClass(e.target.value);
                    }}
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
                  <label className="form-label">Period *</label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    className={`form-select ${errors.period ? 'error' : ''}`}
                  >
                    {periods.map(period => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                  {errors.period && <span className="error-message">{errors.period}</span>}
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

            {/* Student Attendance */}
            {formData.students.length > 0 && (
              <div className="form-section">
                <h3 className="section-title">
                  <Users className="section-icon" />
                  Student Attendance ({formData.students.filter(s => s.present).length}/{formData.students.length} Present)
                </h3>
                
                <div className="attendance-controls">
                  <button type="button" onClick={markAllPresent} className="btn btn-success btn-sm">
                    <CheckCircle className="btn-icon" />
                    Mark All Present
                  </button>
                  <button type="button" onClick={markAllAbsent} className="btn btn-danger btn-sm">
                    <XCircle className="btn-icon" />
                    Mark All Absent
                  </button>
                </div>

                <div className="attendance-list">
                  {formData.students.map((student) => (
                    <div key={student.id} className="attendance-item">
                      <div className="student-info">
                        <span className="roll-number">{student.rollNumber}</span>
                        <span className="student-name">{student.name}</span>
                      </div>
                      <div className="attendance-buttons">
                        <button
                          type="button"
                          onClick={() => handleStudentAttendance(student.id, true)}
                          className={`attendance-btn present ${student.present ? 'active' : ''}`}
                        >
                          <CheckCircle />
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStudentAttendance(student.id, false)}
                          className={`attendance-btn absent ${!student.present ? 'active' : ''}`}
                        >
                          <XCircle />
                          Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="attendance-summary">
                  <div className="summary-item">
                    <span className="summary-label">Total Students:</span>
                    <span className="summary-value">{formData.students.length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Present:</span>
                    <span className="summary-value present">{formData.students.filter(s => s.present).length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Absent:</span>
                    <span className="summary-value absent">{formData.students.filter(s => !s.present).length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Attendance %:</span>
                    <span className="summary-value percentage">
                      {Math.round((formData.students.filter(s => s.present).length / formData.students.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="form-section">
              <h3 className="section-title">Additional Notes</h3>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Any additional notes about the attendance..."
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
              {attendanceData ? 'Update Attendance' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceForm;
