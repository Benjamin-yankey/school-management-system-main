import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, MapPin, GraduationCap, Award } from 'lucide-react';
import './FormStyles.css';

const TeacherForm = ({ isOpen, onClose, onSubmit, teacherData = null }) => {
  const [formData, setFormData] = useState({
    firstName: teacherData?.firstName || '',
    lastName: teacherData?.lastName || '',
    email: teacherData?.email || '',
    phone: teacherData?.phone || '',
    dateOfBirth: teacherData?.dateOfBirth || '',
    gender: teacherData?.gender || '',
    address: teacherData?.address || '',
    city: teacherData?.city || '',
    state: teacherData?.state || '',
    zipCode: teacherData?.zipCode || '',
    employeeId: teacherData?.employeeId || '',
    department: teacherData?.department || '',
    specialization: teacherData?.specialization || '',
    qualification: teacherData?.qualification || '',
    experience: teacherData?.experience || 0,
    salary: teacherData?.salary || '',
    joiningDate: teacherData?.joiningDate || '',
    subjects: teacherData?.subjects || [],
    classes: teacherData?.classes || [],
    emergencyContact: teacherData?.emergencyContact || '',
    emergencyPhone: teacherData?.emergencyPhone || '',
    bloodGroup: teacherData?.bloodGroup || '',
    medicalInfo: teacherData?.medicalInfo || ''
  });

  const [errors, setErrors] = useState({});

  const genders = ['Male', 'Female', 'Other'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const departments = [
    'Mathematics', 'English', 'Science', 'Social Studies', 'Physics', 
    'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science',
    'Art', 'Music', 'Physical Education', 'Economics', 'Business Studies'
  ];

  const qualifications = [
    'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Professional Certification',
    'Diploma', 'Associate Degree', 'Post Graduate Diploma'
  ];

  const subjects = [
    'Mathematics', 'English Literature', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Computer Science', 'Art', 'Music',
    'Physical Education', 'Economics', 'Business Studies', 'Social Studies'
  ];

  const mockClasses = [
    { id: '1', name: 'Grade 10-A', subject: 'Mathematics' },
    { id: '2', name: 'Grade 10-B', subject: 'Mathematics' },
    { id: '3', name: 'Grade 11-A', subject: 'Physics' },
    { id: '4', name: 'Grade 11-B', subject: 'Chemistry' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubjectChange = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleClassChange = (classId) => {
    setFormData(prev => ({
      ...prev,
      classes: prev.classes.includes(classId)
        ? prev.classes.filter(c => c !== classId)
        : [...prev.classes, classId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required';
    if (!formData.qualification) newErrors.qualification = 'Qualification is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Phone validation
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
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
      <div className="modal-content form-modal large-modal">
        <div className="modal-header">
          <div className="modal-title">
            <User className="modal-icon" />
            <h2>{teacherData ? 'Edit Teacher' : 'Add New Teacher'}</h2>
          </div>
          <button onClick={onClose} className="close-btn">
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          <div className="form-grid">
            {/* Personal Information */}
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`form-input ${errors.firstName ? 'error' : ''}`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`form-input ${errors.lastName ? 'error' : ''}`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="teacher@school.com"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    placeholder="1234567890"
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                  />
                  {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`form-select ${errors.gender ? 'error' : ''}`}
                  >
                    <option value="">Select Gender</option>
                    {genders.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                  {errors.gender && <span className="error-message">{errors.gender}</span>}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <h3 className="section-title">
                <MapPin className="section-icon" />
                Address Information
              </h3>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="2"
                    placeholder="Street address"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="City"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="State"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="12345"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="form-section">
              <h3 className="section-title">
                <GraduationCap className="section-icon" />
                Professional Information
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Employee ID *</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={`form-input ${errors.employeeId ? 'error' : ''}`}
                    placeholder="e.g., EMP001"
                  />
                  {errors.employeeId && <span className="error-message">{errors.employeeId}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`form-select ${errors.department ? 'error' : ''}`}
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <span className="error-message">{errors.department}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Specialization *</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className={`form-input ${errors.specialization ? 'error' : ''}`}
                    placeholder="e.g., Advanced Mathematics"
                  />
                  {errors.specialization && <span className="error-message">{errors.specialization}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Qualification *</label>
                  <select
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className={`form-select ${errors.qualification ? 'error' : ''}`}
                  >
                    <option value="">Select Qualification</option>
                    {qualifications.map(qual => (
                      <option key={qual} value={qual}>{qual}</option>
                    ))}
                  </select>
                  {errors.qualification && <span className="error-message">{errors.qualification}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="form-input"
                    min="0"
                    max="50"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salary</label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., $50,000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Teaching Assignment */}
            <div className="form-section">
              <h3 className="section-title">
                <Award className="section-icon" />
                Teaching Assignment
              </h3>
              
              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Subjects to Teach</label>
                  <div className="checkbox-grid">
                    {subjects.map(subject => (
                      <label key={subject} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={formData.subjects.includes(subject)}
                          onChange={() => handleSubjectChange(subject)}
                          className="checkbox-input"
                        />
                        <span className="checkbox-label">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Assigned Classes</label>
                  <div className="checkbox-grid">
                    {mockClasses.map(cls => (
                      <label key={cls.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={formData.classes.includes(cls.id)}
                          onChange={() => handleClassChange(cls.id)}
                          className="checkbox-input"
                        />
                        <span className="checkbox-label">{cls.name} - {cls.subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="form-section">
              <h3 className="section-title">Emergency Contact</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="1234567890"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <label className="form-label">Medical Information</label>
                  <textarea
                    name="medicalInfo"
                    value={formData.medicalInfo}
                    onChange={handleChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Any medical conditions, allergies, or special requirements..."
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
              {teacherData ? 'Update Teacher' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherForm;
