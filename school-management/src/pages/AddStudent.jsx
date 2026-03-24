import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import FormInput from "../components/FormInput";
// import Modal from "../components/Modal";
// import { saveStudent, generateStudentId } from "../lib/dataUtils";
// import "./FormPages.css";

export default function AddStudent() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",

    // Contact Information
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
    },

    // Guardian Information
    guardian: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
    },

    // Academic Information
    class: "",
    section: "",
    rollNumber: "",
    admissionDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = "First name is required";
      if (!formData.lastName) newErrors.lastName = "Last name is required";
      if (!formData.dateOfBirth)
        newErrors.dateOfBirth = "Date of birth is required";
      if (!formData.gender) newErrors.gender = "Gender is required";
    }

    if (step === 2) {
      if (!formData.email) newErrors.email = "Email is required";
      if (!formData.phone) newErrors.phone = "Phone is required";
      if (!formData.address.street)
        newErrors["address.street"] = "Street address is required";
      if (!formData.address.city)
        newErrors["address.city"] = "City is required";
    }

    if (step === 3) {
      if (!formData.guardian.name)
        newErrors["guardian.name"] = "Guardian name is required";
      if (!formData.guardian.relationship)
        newErrors["guardian.relationship"] = "Relationship is required";
    }

    if (step === 4) {
      if (!formData.class) newErrors.class = "Class is required";
      if (!formData.section) newErrors.section = "Section is required";
      if (!formData.rollNumber)
        newErrors.rollNumber = "Roll number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (path, value) => {
    const paths = path.split(".");
    setFormData((prev) => {
      if (paths.length === 1) {
        return { ...prev, [paths[0]]: value };
      }
      return {
        ...prev,
        [paths[0]]: {
          ...prev[paths[0]],
          [paths[1]]: value,
        },
      };
    });

    // Clear error when user starts typing
    if (errors[path]) {
      setErrors((prev) => ({ ...prev, [path]: "" }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(4)) {
      const studentData = {
        ...formData,
        id: generateStudentId(),
        studentId: `STU${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "Active",
      };

      saveStudent(studentData);
      setShowSuccess(true);
    }
  };

  const handleAddAnother = () => {
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      bloodGroup: "",
      email: "",
      phone: "",
      address: { street: "", city: "", state: "", zip: "" },
      guardian: { name: "", relationship: "", phone: "", email: "" },
      class: "",
      section: "",
      rollNumber: "",
      admissionDate: new Date().toISOString().split("T")[0],
    });
    setCurrentStep(1);
    setShowSuccess(false);
  };

  return (
    <div className="form-page">
      <div className="page-header">
        <h1>Add New Student</h1>
        <p>Complete all sections to register a new student</p>
      </div>

      {/* Progress Steps */}
      <div className="progress-steps">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`step ${
              step === currentStep
                ? "active"
                : step < currentStep
                ? "completed"
                : ""
            }`}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && "Personal"}
              {step === 2 && "Contact"}
              {step === 3 && "Guardian"}
              {step === 4 && "Academic"}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="student-form">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <FormInput
                label="First Name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                error={errors.firstName}
                required
              />
              <FormInput
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                error={errors.lastName}
                required
              />
              <FormInput
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                error={errors.dateOfBirth}
                required
              />
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-input"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <div className="form-error">{errors.gender}</div>
                )}
              </div>
              <FormInput
                label="Blood Group"
                value={formData.bloodGroup}
                onChange={(e) =>
                  handleInputChange("bloodGroup", e.target.value)
                }
                placeholder="e.g., A+"
              />
            </div>
          </div>
        )}

        {/* Step 2: Contact Information */}
        {currentStep === 2 && (
          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <FormInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email}
                required
              />
              <FormInput
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                error={errors.phone}
                required
              />
              <FormInput
                label="Street Address"
                value={formData.address.street}
                onChange={(e) =>
                  handleInputChange("address.street", e.target.value)
                }
                error={errors["address.street"]}
                required
              />
              <FormInput
                label="City"
                value={formData.address.city}
                onChange={(e) =>
                  handleInputChange("address.city", e.target.value)
                }
                error={errors["address.city"]}
                required
              />
              <FormInput
                label="State"
                value={formData.address.state}
                onChange={(e) =>
                  handleInputChange("address.state", e.target.value)
                }
              />
              <FormInput
                label="ZIP Code"
                value={formData.address.zip}
                onChange={(e) =>
                  handleInputChange("address.zip", e.target.value)
                }
              />
            </div>
          </div>
        )}

        {/* Step 3: Guardian Information */}
        {currentStep === 3 && (
          <div className="form-section">
            <h3>Guardian Information</h3>
            <div className="form-grid">
              <FormInput
                label="Guardian Name"
                value={formData.guardian.name}
                onChange={(e) =>
                  handleInputChange("guardian.name", e.target.value)
                }
                error={errors["guardian.name"]}
                required
              />
              <FormInput
                label="Relationship"
                value={formData.guardian.relationship}
                onChange={(e) =>
                  handleInputChange("guardian.relationship", e.target.value)
                }
                error={errors["guardian.relationship"]}
                required
                placeholder="e.g., Father, Mother"
              />
              <FormInput
                label="Guardian Phone"
                type="tel"
                value={formData.guardian.phone}
                onChange={(e) =>
                  handleInputChange("guardian.phone", e.target.value)
                }
              />
              <FormInput
                label="Guardian Email"
                type="email"
                value={formData.guardian.email}
                onChange={(e) =>
                  handleInputChange("guardian.email", e.target.value)
                }
              />
            </div>
          </div>
        )}

        {/* Step 4: Academic Information */}
        {currentStep === 4 && (
          <div className="form-section">
            <h3>Academic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Class</label>
                <select
                  className="form-input"
                  value={formData.class}
                  onChange={(e) => handleInputChange("class", e.target.value)}
                >
                  <option value="">Select Class</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={`Grade ${i + 1}`}>
                      Grade {i + 1}
                    </option>
                  ))}
                </select>
                {errors.class && (
                  <div className="form-error">{errors.class}</div>
                )}
              </div>
              <FormInput
                label="Section"
                value={formData.section}
                onChange={(e) => handleInputChange("section", e.target.value)}
                error={errors.section}
                required
                placeholder="e.g., A, B, C"
              />
              <FormInput
                label="Roll Number"
                type="number"
                value={formData.rollNumber}
                onChange={(e) =>
                  handleInputChange("rollNumber", e.target.value)
                }
                error={errors.rollNumber}
                required
              />
              <FormInput
                label="Admission Date"
                type="date"
                value={formData.admissionDate}
                onChange={(e) =>
                  handleInputChange("admissionDate", e.target.value)
                }
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-actions">
          {currentStep > 1 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handlePrevious}
            >
              Previous
            </button>
          )}
          {currentStep < 4 ? (
            <button type="button" className="btn-primary" onClick={handleNext}>
              Next
            </button>
          ) : (
            <button type="submit" className="btn-primary">
              Submit Student
            </button>
          )}
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccess}
        onClose={() => navigate("/admin")}
        title="Success!"
      >
        <div className="success-modal">
          <div className="success-icon">✅</div>
          <h3>Student Registered Successfully!</h3>
          <p>
            The student has been added to the system with ID:{" "}
            {formData.studentId}
          </p>
          <div className="modal-actions">
            <button className="btn-secondary" onClick={handleAddAnother}>
              Add Another Student
            </button>
            <button className="btn-primary" onClick={() => navigate("/admin")}>
              Return to Dashboard
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
