import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import "./AcademyPages.css";

const initialState = {
  program: "",
  startDate: "",
  days: [], // Array for M/W/TH checkboxes
  gender: "",
  childFullName: "",
  childDob: "",
  childPhone: "",
  childAddress: "",
  childZip: "",
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
  registrationPaid: "",
  securityDepositPaid: "",
  datePaid: "",
  weeklyParentFee: "",
  parentHandbook: "",
};

const AdmissionsPage = () => {
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;

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
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.childFullName ||
      !formData.childDob ||
      !formData.program ||
      !formData.startDate
    ) {
      setStatus({
        type: "error",
        message: "Please complete all required child and program details.",
      });
      return;
    }

    setStatus(null);
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setStatus({
        type: "success",
        message:
          "Registration submitted successfully. We will contact you shortly.",
      });
      setFormData(initialState);
    }, 1500);
  };

  return (
    <div className="academy-page">
      <header
        className={`academy-page-nav ${isMenuOpen ? "mobile-active" : ""}`}
      >
        <div className="academy-page-shell academy-page-nav-inner">
          <Link to="/" className="school-logo-container">
            <img
              src="/images/schoolLogo.jpeg"
              alt="School Logo"
              className="school-logo-img"
            />
            <span className="school-logo-text">
              GEOZIIE INTERNATIONAL SCHOOL
            </span>
          </Link>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? "close" : "menu"}
            </span>
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
            <Link to="/admissions" className="academy-page-apply">
              Apply Now
            </Link>
          </div>
        </div>
      </header>

      <main className="academy-page-shell academy-page-main">
        <section className="academy-page-hero">
          <span className="academy-page-kicker">
            <Sparkles size={14} /> Registration
          </span>
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
                background:
                  status.type === "error"
                    ? "rgba(255, 0, 0, 0.1)"
                    : "rgba(0, 255, 0, 0.1)",
                borderColor: status.type === "error" ? "#ff4d4d" : "#4dff4d",
                marginBottom: "1rem",
                padding: "1rem",
                borderRadius: "0.75rem",
                border: "1px solid",
              }}
            >
              <p
                style={{
                  color: status.type === "error" ? "#ff4d4d" : "#4dff4d",
                  margin: 0,
                }}
              >
                {status.message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="admission-form">
            <div className="form-grid">
              <div className="form-group full-width-field">
                <label className="form-label" htmlFor="program">
                  <span className="material-symbols-outlined">apps</span>{" "}
                  PROGRAM
                </label>
                <select
                  id="program"
                  name="program"
                  className="form-select"
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
                <label className="form-label" htmlFor="startDate">
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>{" "}
                  START DATE
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="form-input"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="days">
                  <span className="material-symbols-outlined">schedule</span>{" "}
                  Days
                </label>
                <div className="day-selection">
                  <label>
                    <input
                      type="checkbox"
                      name="days[]"
                      value="M"
                      checked={formData.days.includes("M")}
                      onChange={handleChange}
                    />{" "}
                    M
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="days[]"
                      value="W"
                      checked={formData.days.includes("W")}
                      onChange={handleChange}
                    />{" "}
                    W
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="days[]"
                      value="TH"
                      checked={formData.days.includes("TH")}
                      onChange={handleChange}
                    />{" "}
                    TH
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined">wc</span> Gender
                </label>
                <div className="form-radio-group">
                  <div className="form-radio-option">
                    <input
                      type="radio"
                      id="genderFemale"
                      name="gender"
                      value="female"
                      className="form-radio"
                      checked={formData.gender === "female"}
                      onChange={handleChange}
                    />
                    <label htmlFor="genderFemale">Female</label>
                  </div>
                  <div className="form-radio-option">
                    <input
                      type="radio"
                      id="genderMale"
                      name="gender"
                      value="male"
                      className="form-radio"
                      checked={formData.gender === "male"}
                      onChange={handleChange}
                    />
                    <label htmlFor="genderMale">Male</label>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="form-section-heading">Child Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="childFullName">
                  <span className="material-symbols-outlined">person</span> Full
                  Name of Child
                </label>
                <input
                  type="text"
                  id="childFullName"
                  name="childFullName"
                  className="form-input"
                  value={formData.childFullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="childDob">
                  <span className="material-symbols-outlined">cake</span> Date
                  of Birth
                </label>
                <input
                  type="date"
                  id="childDob"
                  name="childDob"
                  className="form-input"
                  value={formData.childDob}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="childPhone">
                  <span className="material-symbols-outlined">phone</span> Phone
                </label>
                <input
                  type="tel"
                  id="childPhone"
                  name="childPhone"
                  className="form-input"
                  value={formData.childPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width-field">
                <label className="form-label" htmlFor="childAddress">
                  <span className="material-symbols-outlined">home</span>{" "}
                  Address
                </label>
                <textarea
                  id="childAddress"
                  name="childAddress"
                  className="form-textarea"
                  value={formData.childAddress}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="childZip">
                  <span className="material-symbols-outlined">my_location</span>{" "}
                  Zip
                </label>
                <input
                  type="text"
                  id="childZip"
                  name="childZip"
                  className="form-input"
                  value={formData.childZip}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <h2 className="form-section-heading">
              Mother or Guardian Information
            </h2>
            <div className="form-grid">
              <div className="form-group full-width-field">
                <label className="form-label" htmlFor="motherGuardianName">
                  <span className="material-symbols-outlined">person</span>{" "}
                  Mother or Guardian Name
                </label>
                <input
                  type="text"
                  id="motherGuardianName"
                  name="motherGuardianName"
                  className="form-input"
                  value={formData.motherGuardianName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group full-width-field">
                <label className="form-label" htmlFor="motherHomeAddress">
                  <span className="material-symbols-outlined">home</span> Home
                  Address
                </label>
                <textarea
                  id="motherHomeAddress"
                  name="motherHomeAddress"
                  className="form-textarea"
                  value={formData.motherHomeAddress}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="motherEmployment">
                  <span className="material-symbols-outlined">work</span>{" "}
                  Employment
                </label>
                <input
                  type="text"
                  id="motherEmployment"
                  name="motherEmployment"
                  className="form-input"
                  value={formData.motherEmployment}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="motherWorkPhone">
                  <span className="material-symbols-outlined">work_phone</span>{" "}
                  Phone
                </label>
                <input
                  type="tel"
                  id="motherWorkPhone"
                  name="motherWorkPhone"
                  className="form-input"
                  value={formData.motherWorkPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="motherHours">
                  <span className="material-symbols-outlined">schedule</span>{" "}
                  Hours
                </label>
                <input
                  type="text"
                  id="motherHours"
                  name="motherHours"
                  className="form-input"
                  placeholder="e.g., 9 AM - 5 PM"
                  value={formData.motherHours}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width-field">
                <label className="form-label" htmlFor="motherWorkAddress">
                  <span className="material-symbols-outlined">business</span>{" "}
                  Work Address
                </label>
                <textarea
                  id="motherWorkAddress"
                  name="motherWorkAddress"
                  className="form-textarea"
                  value={formData.motherWorkAddress}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="form-group full-width-field">
                <label className="form-label" htmlFor="motherEmail">
                  <span className="material-symbols-outlined">mail</span> Email
                  Address
                </label>
                <input
                  type="email"
                  id="motherEmail"
                  name="motherEmail"
                  className="form-input"
                  value={formData.motherEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h2 className="form-section-heading">
              Father or Guardian Information
            </h2>
            <div className="form-grid">
              <div className="form-group full-width-field">
                <label className="form-label" htmlFor="fatherGuardianName">
                  <span className="material-symbols-outlined">person</span>{" "}
                  Father or Guardian Name
                </label>
                <input
                  type="text"
                  id="fatherGuardianName"
                  name="fatherGuardianName"
                  className="form-input"
                  value={formData.fatherGuardianName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width-field">
                <label className="form-label" htmlFor="fatherHomeAddress">
                  <span className="material-symbols-outlined">home</span> Home
                  Address
                </label>
                <textarea
                  id="fatherHomeAddress"
                  name="fatherHomeAddress"
                  className="form-textarea"
                  value={formData.fatherHomeAddress}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fatherEmployment">
                  <span className="material-symbols-outlined">work</span>{" "}
                  Employment
                </label>
                <input
                  type="text"
                  id="fatherEmployment"
                  name="fatherEmployment"
                  className="form-input"
                  value={formData.fatherEmployment}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fatherWorkPhone">
                  <span className="material-symbols-outlined">work_phone</span>{" "}
                  Phone
                </label>
                <input
                  type="tel"
                  id="fatherWorkPhone"
                  name="fatherWorkPhone"
                  className="form-input"
                  value={formData.fatherWorkPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width-field">
                <label className="form-label" htmlFor="fatherWorkAddress">
                  <span className="material-symbols-outlined">business</span>{" "}
                  Work Address
                </label>
                <textarea
                  id="fatherWorkAddress"
                  name="fatherWorkAddress"
                  className="form-textarea"
                  value={formData.fatherWorkAddress}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="form-group full-width-field">
                <label className="form-label" htmlFor="fatherEmail">
                  <span className="material-symbols-outlined">mail</span> Email
                  Address
                </label>
                <input
                  type="email"
                  id="fatherEmail"
                  name="fatherEmail"
                  className="form-input"
                  value={formData.fatherEmail}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h2 className="form-section-heading">Authorized Pick-up Persons</h2>
            <div className="form-group full-width-field">
              <label className="form-label" htmlFor="authorizedPickup">
                <span className="material-symbols-outlined">person_check</span>{" "}
                People Authorized to pick up your child
              </label>
              <textarea
                id="authorizedPickup"
                name="authorizedPickup"
                className="form-textarea"
                placeholder="List Name, Relationship, Address, Day Time Phone No, Cell Phone No for each person."
                value={formData.authorizedPickup}
                onChange={handleChange}
              ></textarea>
            </div>

            <h2 className="form-section-heading">Emergency Contacts</h2>
            <div className="form-group full-width-field">
              <label className="form-label" htmlFor="emergencyContacts">
                <span className="material-symbols-outlined">warning</span>{" "}
                People to call in case of EMERGENCY (must list two people; do
                not list parents of the child)
              </label>
              <textarea
                id="emergencyContacts"
                name="emergencyContacts"
                className="form-textarea"
                placeholder="List Name, Relationship, Address, Day Time Phone No, Cell Phone No for each person."
                value={formData.emergencyContacts}
                onChange={handleChange}
              ></textarea>
            </div>

            <h2 className="form-section-heading">Medical Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label" htmlFor="childsPhysicianName">
                  <span className="material-symbols-outlined">
                    local_hospital
                  </span>{" "}
                  Child's Physician
                </label>
                <input
                  type="text"
                  id="childsPhysicianName"
                  name="childsPhysicianName"
                  className="form-input"
                  value={formData.childsPhysicianName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="childsPhysicianPhone">
                  <span className="material-symbols-outlined">phone</span> Phone
                  No.
                </label>
                <input
                  type="tel"
                  id="childsPhysicianPhone"
                  name="childsPhysicianPhone"
                  className="form-input"
                  value={formData.childsPhysicianPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width-field">
                <label
                  className="form-label"
                  htmlFor="emergencyHospitalPreference"
                >
                  <span className="material-symbols-outlined">
                    local_hospital_2
                  </span>{" "}
                  Emergency Hospital Preference
                </label>
                <input
                  type="text"
                  id="emergencyHospitalPreference"
                  name="emergencyHospitalPreference"
                  className="form-input"
                  value={formData.emergencyHospitalPreference}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="emergencyHospitalPhone">
                  <span className="material-symbols-outlined">phone</span> Phone
                  No.
                </label>
                <input
                  type="tel"
                  id="emergencyHospitalPhone"
                  name="emergencyHospitalPhone"
                  className="form-input"
                  value={formData.emergencyHospitalPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group full-width-field">
                <label
                  className="form-label"
                  htmlFor="emergencyHospitalAddress"
                >
                  <span className="material-symbols-outlined">location_on</span>{" "}
                  Hospital Address
                </label>
                <textarea
                  id="emergencyHospitalAddress"
                  name="emergencyHospitalAddress"
                  className="form-textarea"
                  value={formData.emergencyHospitalAddress}
                  onChange={handleChange}
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="dentistName">
                  <span className="material-symbols-outlined">dentistry</span>{" "}
                  Dentist
                </label>
                <input
                  type="text"
                  id="dentistName"
                  name="dentistName"
                  className="form-input"
                  value={formData.dentistName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <h2 className="form-section-heading">Payment & Administration</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined">payments</span>{" "}
                  Registration Paid
                </label>
                <div className="form-radio-group">
                  <div className="form-radio-option">
                    <input
                      type="radio"
                      id="regPaidYes"
                      name="registrationPaid"
                      value="yes"
                      className="form-radio"
                      checked={formData.registrationPaid === "yes"}
                      onChange={handleChange}
                    />
                    <label htmlFor="regPaidYes">Yes</label>
                  </div>
                  <div className="form-radio-option">
                    <input
                      type="radio"
                      id="regPaidNo"
                      name="registrationPaid"
                      value="no"
                      className="form-radio"
                      checked={formData.registrationPaid === "no"}
                      onChange={handleChange}
                    />
                    <label htmlFor="regPaidNo">No</label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined">security</span>{" "}
                  Security Deposit Paid
                </label>
                <div className="form-radio-group">
                  <div className="form-radio-option">
                    <input
                      type="radio"
                      id="depositPaidYes"
                      name="securityDepositPaid"
                      value="yes"
                      className="form-radio"
                      checked={formData.securityDepositPaid === "yes"}
                      onChange={handleChange}
                    />
                    <label htmlFor="depositPaidYes">Yes</label>
                  </div>
                  <div className="form-radio-option">
                    <input
                      type="radio"
                      id="depositPaidNo"
                      name="securityDepositPaid"
                      value="no"
                      className="form-radio"
                      checked={formData.securityDepositPaid === "no"}
                      onChange={handleChange}
                    />
                    <label htmlFor="depositPaidNo">No</label>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="datePaid">
                  <span className="material-symbols-outlined">
                    calendar_today
                  </span>{" "}
                  Date Paid
                </label>
                <input
                  type="date"
                  id="datePaid"
                  name="datePaid"
                  className="form-input"
                  value={formData.datePaid}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="weeklyParentFee">
                  <span className="material-symbols-outlined">
                    currency_exchange
                  </span>{" "}
                  Weekly Parent Fee
                </label>
                <input
                  type="text"
                  id="weeklyParentFee"
                  name="weeklyParentFee"
                  className="form-input"
                  placeholder="$XX.XX"
                  value={formData.weeklyParentFee}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group full-width-field">
              <label className="form-label">
                <span className="material-symbols-outlined">book</span> Received
                Parent Handbook (initial)
              </label>
              <div className="form-radio-group">
                <div className="form-radio-option">
                  <input
                    type="radio"
                    id="handbookYes"
                    name="parentHandbook"
                    value="yes"
                    className="form-radio"
                    checked={formData.parentHandbook === "yes"}
                    onChange={handleChange}
                  />
                  <label htmlFor="handbookYes">Yes</label>
                </div>
                <div className="form-radio-option">
                  <input
                    type="radio"
                    id="handbookNo"
                    name="parentHandbook"
                    value="no"
                    className="form-radio"
                    checked={formData.parentHandbook === "no"}
                    onChange={handleChange}
                  />
                  <label htmlFor="handbookNo">No</label>
                </div>
              </div>
            </div>

            <div className="form-notice">
              <span className="material-symbols-outlined">info</span>
              <p>
                Please complete all required fields accurately. Upon submission,
                a printable version of this form can be generated.
              </p>
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Registration"}
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
            Click the link below to download the official Cohoes Child
            Development Center Registration Form.
          </p>
          <div className="download-link-container">
            <a
              href="/path/to/cohoes_child_development_center_registration.pdf"
              download
              className="primary-btn"
            >
              Download Registration Form (PDF)
            </a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdmissionsPage;
