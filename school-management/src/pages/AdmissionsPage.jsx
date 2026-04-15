import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Menu, X } from "lucide-react";
import api from "../lib/api";
import { generateAdmissionPDF } from "./generateAdmissionPDF";
import "./AcademyPages.css";

const initialState = {
  program: "",
  startDate: "",
  days: [], // Array for day checkboxes
  gender: "",
  childFullName: "",
  childDob: "",
  childPhone: "",
  childAddress: "",
  childZip: "",
  childImage: null,
  motherGuardianName: "",
  motherHomeAddress: "",
  motherEmployment: "",
  motherWorkPhone: "",
  motherHours: "",
  motherWorkAddress: "",
  motherEmail: "",
  fatherGuardianName: "",
  fatherHomeAddress: "",
  fatherEmployment: "",
  fatherWorkPhone: "",
  fatherWorkAddress: "",
  fatherEmail: "",
  authorizedPickup: "",
  emergencyContacts: "",
  childsPhysicianName: "",
  childsPhysicianPhone: "",
  emergencyHospitalPreference: "",
  emergencyHospitalPhone: "",
  emergencyHospitalAddress: "",
  dentistName: "",
  datePaid: "",
  parentHandbook: "",
};

const AdmissionsPage = () => {
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleChange = (event) => {
    const { name, type, checked, value, files } = event.target;

    if (name === "days[]") {
      const currentDays = [...formData.days];
      if (checked) {
        currentDays.push(value);
      } else {
        const index = currentDays.indexOf(value);
        if (index > -1) {
          currentDays.splice(index, 1);
        }
      }
      setFormData((prev) => ({
        ...prev,
        days: currentDays,
      }));
    } else if (type === "file") {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            [name]: reader.result,
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const toBase64 = (url) =>
    fetch(url)
      .then((r) => r.blob())
      .then(
        (blob) =>
          new Promise((res) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.readAsDataURL(blob);
          }),
      );

  const handleDownloadPDF = async () => {
    const logo = await toBase64(
      "https://upload.wikimedia.org/wikipedia/commons/4/47/Academic_Chapeau_Graphite.png",
    );
    generateAdmissionPDF(logo, formData.childImage);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.childFullName ||
      !formData.childDob ||
      !formData.program ||
      !formData.startDate ||
      (!formData.motherEmail && !formData.fatherEmail)
    ) {
      setStatus({
        type: "error",
        message:
          "Please complete all required child and program details, including at least one parent email.",
      });
      return;
    }

    setStatus(null);
    setSubmitting(true);

    try {
      // Split name into first, middle, last if possible, or just use as first name
      const nameParts = formData.childFullName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName =
        nameParts.length > 1 ? nameParts[nameParts.length - 1] : "Student";
      const middleName =
        nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

      await api.apply({
        firstName,
        lastName,
        middleName,
        email: formData.motherEmail || formData.fatherEmail,
        phoneNumber:
          formData.childPhone ||
          formData.motherWorkPhone ||
          formData.fatherWorkPhone ||
          "0000000000",
        dateOfBirth: formData.childDob,
        areaOfInterest: formData.program,
      });

      setStatus({
        type: "success",
        message:
          "Registration submitted successfully. We will contact you shortly.",
      });
      setFormData(initialState);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.message || "Failed to submit registration. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="academy-page">
      <header
        className={`academy-page-nav ${isMenuOpen ? "mobile-active" : ""}`}
      >
        <div className="academy-page-shell academy-page-nav-inner">
          <Link to="/" className="school-logo-container">
            <div className="school-logo-icon">
              <img
                src="/images/schoolLogo.jpeg"
                alt="GEOZIIE Logo"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "inherit",
                }}
              />
            </div>

            <span className="school-logo-text">
              GEOZIIE INTERNATIONAL SCHOOL
            </span>
          </Link>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className="academy-page-links" aria-label="Primary">
            <Link
              to="/"
              className="academy-page-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/programs"
              className="academy-page-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Programs
            </Link>
            <Link
              to="/campus"
              className="academy-page-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Campus
            </Link>
            <Link
              to="/admissions"
              className="academy-page-link active"
              onClick={() => setIsMenuOpen(false)}
            >
              Admissions
            </Link>
          </nav>
          <div className="academy-page-actions">
            <Link to="/signin" className="academy-page-auth">
              Sign In
            </Link>
            <Link
              to="/signin"
              className="academy-page-auth academy-page-auth-accent"
            >
              Portal Access
            </Link>
          </div>
        </div>
      </header>

      <main className="academy-page-shell academy-page-main">
        <section className="academy-page-hero">
          <span className="academy-page-kicker">Registration</span>
          <h1 className="academy-page-title">GEOZIIE INTERNATIONAL SCHOOL</h1>
        </section>

        <div className="cohoes-registration-form">
          <div className="form-header">
            <h1 className="form-title">GEOZIIE INTERNATIONAL SCHOOL</h1>
            <h2 className="director-info">Day Care Registration Form</h2>
            <p className="contact-info">Phone: 055-756-4700</p>
          </div>

          {status && (
            <div
              className={`form-notice ${status.type === "error" ? "error" : "success"}`}
              style={{
                background: status.type === "error" ? "var(--error-alp)" : "var(--success-alp)",
                borderColor: status.type === "error" ? "var(--error)" : "var(--success)",
                color: status.type === "error" ? "var(--error)" : "var(--success)",
                marginBottom: "2rem",
                padding: "1.25rem",
                borderRadius: "1rem",
                border: "1px solid",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                animation: "fadeSlideIn 0.4s ease"
              }}
            >
              <div style={{ fontSize: "1.2rem" }}>{status.type === "error" ? "⚠️" : "✨"}</div>
              <p style={{ margin: 0, fontWeight: 600 }}>{status.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admission-form" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="academy-page-card" style={{ padding: '2rem' }}>
              <h2 className="form-section-heading" style={{ marginTop: 0 }}>Program Enrollment</h2>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group full-width-field">
                  <label className="form-label" htmlFor="program">PROGRAM</label>
                  <select
                    id="program"
                    name="program"
                    className="admissions-select"
                    value={formData.program}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Program</option>
                    <option value="daycare">Day Care</option>
                    <option value="preschool">Preschool</option>
                    <option value="afterschool">After School Program</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="startDate">START DATE</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="admissions-input"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Days Required</label>
                  <div className="day-selection" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                      <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox"
                          name="days[]"
                          value={day}
                          checked={formData.days.includes(day)}
                          onChange={handleChange}
                          style={{ accentColor: 'var(--accent)' }}
                        /> {day}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="academy-page-card" style={{ padding: '2rem' }}>
              <h2 className="form-section-heading" style={{ marginTop: 0 }}>Child Information</h2>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="childFullName">Full Name of Child</label>
                  <input
                    type="text"
                    id="childFullName"
                    name="childFullName"
                    className="admissions-input"
                    value={formData.childFullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="childDob">Date of Birth</label>
                  <input
                    type="date"
                    id="childDob"
                    name="childDob"
                    className="admissions-input"
                    value={formData.childDob}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="gender">Gender</label>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" name="gender" value="female" checked={formData.gender === "female"} onChange={handleChange} /> Female
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" name="gender" value="male" checked={formData.gender === "male"} onChange={handleChange} /> Male
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="academy-page-card" style={{ padding: '2rem' }}>
              <h2 className="form-section-heading" style={{ marginTop: 0 }}>Mother or Guardian</h2>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group full-width-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="motherGuardianName">Full Name</label>
                  <input type="text" id="motherGuardianName" name="motherGuardianName" className="admissions-input" value={formData.motherGuardianName} onChange={handleChange} required />
                </div>
                <div className="form-group full-width-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="motherHomeAddress">Home Address</label>
                  <textarea id="motherHomeAddress" name="motherHomeAddress" className="admissions-textarea" style={{ minHeight: '80px' }} value={formData.motherHomeAddress} onChange={handleChange}></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="motherEmail">Email Address</label>
                  <input type="email" id="motherEmail" name="motherEmail" className="admissions-input" value={formData.motherEmail} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="motherWorkPhone">Phone Number</label>
                  <input type="tel" id="motherWorkPhone" name="motherWorkPhone" className="admissions-input" value={formData.motherWorkPhone} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="academy-page-card" style={{ padding: '2rem' }}>
              <h2 className="form-section-heading" style={{ marginTop: 0 }}>Father or Guardian</h2>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group full-width-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="fatherGuardianName">Full Name</label>
                  <input type="text" id="fatherGuardianName" name="fatherGuardianName" className="admissions-input" value={formData.fatherGuardianName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="fatherEmail">Email Address</label>
                  <input type="email" id="fatherEmail" name="fatherEmail" className="admissions-input" value={formData.fatherEmail} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="fatherWorkPhone">Phone Number</label>
                  <input type="tel" id="fatherWorkPhone" name="fatherWorkPhone" className="admissions-input" value={formData.fatherWorkPhone} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="academy-page-card" style={{ padding: '2rem' }}>
              <h2 className="form-section-heading" style={{ marginTop: 0 }}>Safety & Medical</h2>
              <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="form-group full-width-field" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="authorizedPickup">Authorized Pick-up Persons</label>
                  <textarea id="authorizedPickup" name="authorizedPickup" className="admissions-textarea" placeholder="Name, Relationship, Phone Number..." value={formData.authorizedPickup} onChange={handleChange}></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="childsPhysicianName">Child's Physician</label>
                  <input type="text" id="childsPhysicianName" name="childsPhysicianName" className="admissions-input" value={formData.childsPhysicianName} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="childsPhysicianPhone">Physician Phone</label>
                  <input type="tel" id="childsPhysicianPhone" name="childsPhysicianPhone" className="admissions-input" value={formData.childsPhysicianPhone} onChange={handleChange} />
                </div>
              </div>
            </div>

            <button type="submit" className="admissions-submit" disabled={submitting} style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-blue) 100%)',
              color: 'white',
              fontSize: '1.1rem',
              padding: '1.2rem',
              marginTop: '1rem',
              boxShadow: '0 10px 30px var(--accent-alp)'
            }}>
              {submitting ? "Processing Application..." : "Submit Enrollment Application"}
            </button>
          </form>
        </div>

        <div className="download-section">
          <h2
            className="academy-page-title"
            style={{ fontSize: "1.5rem", textAlign: "center" }}
          >
            Download Forms
          </h2>
          <p
            className="academy-page-subtitle"
            style={{ textAlign: "center", margin: "1rem 0" }}
          >
            Click the button below to download the official GEOZIIE
            International School Registration Form.
          </p>
          <div className="download-link-container">
            <button onClick={handleDownloadPDF} className="primary-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download Registration Form (PDF)
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdmissionsPage;
