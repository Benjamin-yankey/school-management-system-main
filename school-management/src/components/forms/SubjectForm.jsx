import React, { useState } from 'react';
import { X, Save, BookOpen, Clock, User, FileText } from 'lucide-react';
import './FormStyles.css';

const SubjectForm = ({ isOpen, onClose, onSubmit, subjectData = null }) => {
  const [formData, setFormData] = useState({
    name: subjectData?.name || '',
    code: subjectData?.code || '',
    description: subjectData?.description || '',
    teacherId: subjectData?.teacherId || '',
    classId: subjectData?.classId || '',
    credits: subjectData?.credits || 1,
    hoursPerWeek: subjectData?.hoursPerWeek || 5,
    examType: subjectData?.examType || 'written',
    gradingScale: subjectData?.gradingScale || 'percentage',
    syllabus: subjectData?.syllabus || '',
    prerequisites: subjectData?.prerequisites || '',
    objectives: subjectData?.objectives || '',
    resources: subjectData?.resources || '',
    assessmentCriteria: subjectData?.assessmentCriteria || ''
  });

  const [errors, setErrors] = useState({});

  const examTypes = [
    { value: 'written', label: 'Written Exam' },
    { value: 'practical', label: 'Practical Exam' },
    { value: 'oral', label: 'Oral Exam' },
    { value: 'project', label: 'Project Based' },
    { value: 'assignment', label: 'Assignment Based' },
    { value: 'mixed', label: 'Mixed Assessment' }
  ];

  const gradingScales = [
    { value: 'percentage', label: 'Percentage (0-100)' },
    { value: 'letter', label: 'Letter Grade (A-F)' },
    { value: 'gpa', label: 'GPA (0-4)' },
    { value: 'points', label: 'Points System' }
  ];

  const mockTeachers = [
    { id: '1', name: 'John Smith', specialization: 'Mathematics' },
    { id: '2', name: 'Sarah Johnson', specialization: 'English Literature' },
    { id: '3', name: 'Mike Davis', specialization: 'Physics' },
    { id: '4', name: 'Lisa Wilson', specialization: 'Chemistry' },
    { id: '5', name: 'David Brown', specialization: 'Biology' }
  ];

  const mockClasses = [
    { id: '1', name: 'Grade 10-A', level: '10' },
    { id: '2', name: 'Grade 10-B', level: '10' },
    { id: '3', name: 'Grade 11-A', level: '11' },
    { id: '4', name: 'Grade 11-B', level: '11' },
    { id: '5', name: 'Grade 12-A', level: '12' }
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

    if (!formData.name.trim()) newErrors.name = 'Subject name is required';
    if (!formData.code.trim()) newErrors.code = 'Subject code is required';
    if (!formData.teacherId) newErrors.teacherId = 'Teacher is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.credits || formData.credits < 1) newErrors.credits = 'Valid credits are required';
    if (!formData.hoursPerWeek || formData.hoursPerWeek < 1) newErrors.hoursPerWeek = 'Valid hours per week are required';

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
            <h2>{subjectData ? 'Edit Subject' : 'Create New Subject'}</h2>
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
                  <label className="form-label">Subject Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g., Advanced Mathematics"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className={`form-input ${errors.code ? 'error' : ''}`}
                    placeholder="e.g., MATH101"
                  />
                  {errors.code && <span className="error-message">{errors.code}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Credits *</label>
                  <input
                    type="number"
                    name="credits"
                    value={formData.credits}
                    onChange={handleChange}
                    className={`form-input ${errors.credits ? 'error' : ''}`}
                    min="1"
                    max="10"
                  />
                  {errors.credits && <span className="error-message">{errors.credits}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Hours Per Week *</label>
                  <input
                    type="number"
                    name="hoursPerWeek"
                    value={formData.hoursPerWeek}
                    onChange={handleChange}
                    className={`form-input ${errors.hoursPerWeek ? 'error' : ''}`}
                    min="1"
                    max="20"
                  />
                  {errors.hoursPerWeek && <span className="error-message">{errors.hoursPerWeek}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Brief description of the subject..."
                  />
                </div>
              </div>
            </div>

            {/* Teacher & Class Assignment */}
            <div className="form-section">
              <h3 className="section-title">
                <User className="section-icon" />
                Assignment
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Assigned Teacher *</label>
                  <select
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleChange}
                    className={`form-select ${errors.teacherId ? 'error' : ''}`}
                  >
                    <option value="">Select Teacher</option>
                    {mockTeachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.specialization}
                      </option>
                    ))}
                  </select>
                  {errors.teacherId && <span className="error-message">{errors.teacherId}</span>}
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
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  {errors.classId && <span className="error-message">{errors.classId}</span>}
                </div>
              </div>
            </div>

            {/* Assessment & Grading */}
            <div className="form-section">
              <h3 className="section-title">
                <FileText className="section-icon" />
                Assessment & Grading
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Exam Type</label>
                  <select
                    name="examType"
                    value={formData.examType}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {examTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Grading Scale</label>
                  <select
                    name="gradingScale"
                    value={formData.gradingScale}
                    onChange={handleChange}
                    className="form-select"
                  >
                    {gradingScales.map(scale => (
                      <option key={scale.value} value={scale.value}>
                        {scale.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Assessment Criteria</label>
                  <textarea
                    name="assessmentCriteria"
                    value={formData.assessmentCriteria}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe how students will be assessed..."
                  />
                </div>
              </div>
            </div>

            {/* Curriculum Information */}
            <div className="form-section">
              <h3 className="section-title">
                <Clock className="section-icon" />
                Curriculum Information
              </h3>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Syllabus</label>
                  <textarea
                    name="syllabus"
                    value={formData.syllabus}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="4"
                    placeholder="Detailed syllabus content..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Learning Objectives</label>
                  <textarea
                    name="objectives"
                    value={formData.objectives}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="What students will learn from this subject..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Prerequisites</label>
                  <textarea
                    name="prerequisites"
                    value={formData.prerequisites}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="2"
                    placeholder="Subjects or knowledge required before taking this course..."
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Resources & Materials</label>
                  <textarea
                    name="resources"
                    value={formData.resources}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Textbooks, online resources, lab materials, etc..."
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
              {subjectData ? 'Update Subject' : 'Create Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubjectForm;
