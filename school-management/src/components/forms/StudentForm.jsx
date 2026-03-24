import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, MapPin, Calendar, Users } from 'lucide-react';
import './FormStyles.css';

const StudentForm = ({ isOpen, onClose, onSubmit, studentData = null }) => {
  const [formData, setFormData] = useState({
    firstName: studentData?.firstName || '',
    lastName: studentData?.lastName || '',
    email: studentData?.email || '',
    phone: studentData?.phone || '',
    dateOfBirth: studentData?.dateOfBirth || '',
    gender: studentData?.gender || '',
    address: studentData?.address || '',
    city: studentData?.city || '',
    state: studentData?.state || '',
    zipCode: studentData?.zipCode || '',
    parentName: studentData?.parentName || '',
    parentPhone: studentData?.parentPhone || '',
    parentEmail: studentData?.parentEmail || '',
    emergencyContact: studentData?.emergencyContact || '',
    emergencyPhone: studentData?.emergencyPhone || '',
    classId: studentData?.classId || '',
    rollNumber: studentData?.rollNumber || '',
    admissionDate: studentData?.admissionDate || '',
    bloodGroup: studentData?.bloodGroup || '',
    medicalInfo: studentData?.medicalInfo || '',
    transport: studentData?.transport || false,
    transportRoute: studentData?.transportRoute || ''
  });

  const [errors, setErrors] = useState({});

  const genders = ['Male', 'Female', 'Other'];
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  const mockClasses = [
    { id: '1', name: 'Grade 10-A', subject: 'Mathematics' },
    { id: '2', name: 'Grade 10-B', subject: 'Mathematics' },
    { id: '3', name: 'Grade 11-A', subject: 'Physics' },
    { id: '4', name: 'Grade 11-B', subject: 'Chemistry' }
  ];

  const transportRoutes = [
    'Route A - Downtown',
    'Route B - Suburbs',
    'Route C - Industrial Area',
    'Route D - Residential'
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

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.classId) newErrors.classId = 'Class is required';
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';

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
            <h2>{studentData ? 'Edit Student' : 'Add New Student'}</h2>
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
                    placeholder="student@example.com"
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

            {/* Parent/Guardian Information */}
            <div className="form-section">
              <h3 className="section-title">
                <Users className="section-icon" />
                Parent/Guardian Information
              </h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Parent Name</label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Parent/Guardian name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Parent Phone</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="1234567890"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Parent Email</label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="parent@example.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact</label>
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
                  <label className="form-label">Emergency Phone</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="form-section">
              <h3 className="section-title">
                <Calendar className="section-icon" />
                Academic Information
              </h3>
              
              <div className="form-row">
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
                  <label className="form-label">Roll Number *</label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleChange}
                    className={`form-input ${errors.rollNumber ? 'error' : ''}`}
                    placeholder="e.g., 2024001"
                  />
                  {errors.rollNumber && <span className="error-message">{errors.rollNumber}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Admission Date</label>
                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleChange}
                    className="form-input"
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
            </div>

            {/* Additional Information */}
            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              
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

                <div className="form-group">
                  <label className="form-label checkbox-label">
                    <input
                      type="checkbox"
                      name="transport"
                      checked={formData.transport}
                      onChange={handleChange}
                      className="checkbox-input"
                    />
                    Uses School Transport
                  </label>
                </div>

                {formData.transport && (
                  <div className="form-group">
                    <label className="form-label">Transport Route</label>
                    <select
                      name="transportRoute"
                      value={formData.transportRoute}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select Route</option>
                      {transportRoutes.map(route => (
                        <option key={route} value={route}>{route}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save className="btn-icon" />
              {studentData ? 'Update Student' : 'Add Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
