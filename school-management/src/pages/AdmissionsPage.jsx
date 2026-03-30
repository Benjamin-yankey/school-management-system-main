import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  BookOpenText,
  CalendarDays,
  FileText,
  GraduationCap,
  History,
  Info,
  Mail,
  PhoneCall,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import "./AcademyPages.css";

const initialState = {
  fullName: "",
  parentName: "",
  email: "",
  phone: "",
  parentPhone: "",
  dob: "",
  program: "",
  qualification: "",
  statement: "",
  referral: "",
  termsAgree: false,
};

const AdmissionsPage = () => {
  const [formData, setFormData] = useState(initialState);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.fullName || !formData.parentName || !formData.email || !formData.phone) {
      setStatus({ type: "error", message: "Please complete all required profile details." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setStatus({ type: "error", message: "Please provide a valid email address." });
      return;
    }

    if (formData.phone.length < 10 || formData.parentPhone.length < 10) {
      setStatus({ type: "error", message: "Please provide valid phone numbers for applicant and guardian." });
      return;
    }

    if (!formData.program || !formData.qualification || !formData.statement || !formData.termsAgree) {
      setStatus({
        type: "error",
        message: "Program, qualification, statement, and terms confirmation are required.",
      });
      return;
    }

    setStatus(null);
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setStatus({
        type: "success",
        message: "Application submitted successfully. Our admissions committee will email you within 48 hours.",
      });
      setFormData(initialState);
    }, 900);
  };

  return (
    <div className="academy-page">
      <header className={`academy-page-nav ${isMenuOpen ? 'mobile-active' : ''}`}>
        <div className="academy-page-shell academy-page-nav-inner">
          <Link to="/" className="academy-page-brand">
            The Academy
          </Link>
          
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>

          <nav className="academy-page-links" aria-label="Primary">
            <Link to="/" className="academy-page-link" onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            <Link to="/programs" className="academy-page-link" onClick={() => setIsMenuOpen(false)}>
              Programs
            </Link>
            <Link to="/campus" className="academy-page-link" onClick={() => setIsMenuOpen(false)}>
              Campus
            </Link>
            <Link to="/admissions" className="academy-page-link active" onClick={() => setIsMenuOpen(false)}>
              Admissions
            </Link>
          </nav>
          <div className="academy-page-actions">
            <Link to="/signin" className="academy-page-auth">
              Sign In
            </Link>
            <Link to="/signin" className="academy-page-auth academy-page-auth-accent">
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
            <Sparkles size={14} /> School Admissions
          </span>
          <h1 className="academy-page-title">The Academy Admissions</h1>
          <p className="academy-page-subtitle">Begin your journey to academic excellence.</p>
        </section>

        <section className="admissions-wrap">
          <aside className="admissions-panel">
            <GraduationCap size={24} />
            <h3>Admissions Overview</h3>
            <p className="academy-page-card-text">
              Share your profile and academic motivation below. We review each application for
              intellectual depth, creativity, and potential impact.
            </p>

            <div className="admissions-note">
              Your application will be reviewed by our admissions committee. You will receive a
              confirmation email within 48 hours. Early decision deadline: December 15, 2024.
            </div>

            <div className="admissions-meta">
              <p className="admissions-meta-item">
                <ShieldCheck size={16} /> Secure submission
              </p>
              <p className="admissions-meta-item">
                <BadgeCheck size={16} /> Verified review workflow
              </p>
              <p className="admissions-meta-item">
                <Sparkles size={16} /> The Academy Admissions 2024
              </p>
            </div>
          </aside>

          <div className="admissions-form-card">
            {status ? (
              <p className={`admissions-status ${status.type}`}>{status.message}</p>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              <div className="admissions-form-grid">
                <div className="admissions-field">
                  <label className="admissions-label" htmlFor="fullName">
                    <UserRound size={14} /> Full Name
                  </label>
                  <input
                    id="fullName"
                    className="admissions-input"
                    name="fullName"
                    placeholder="Johnathan M. Sterling"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admissions-field">
                  <label className="admissions-label" htmlFor="parentName">
                    <UsersRound size={14} /> Parent/Guardian Name
                  </label>
                  <input
                    id="parentName"
                    className="admissions-input"
                    name="parentName"
                    placeholder="Johnathan M. Sterling"
                    value={formData.parentName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admissions-field">
                  <label className="admissions-label" htmlFor="email">
                    <Mail size={14} /> Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="admissions-input"
                    name="email"
                    placeholder="applicant@theacademy.edu"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admissions-field">
                  <label className="admissions-label" htmlFor="phone">
                    <PhoneCall size={14} /> Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    className="admissions-input"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admissions-field">
                  <label className="admissions-label" htmlFor="parentPhone">
                    <PhoneCall size={14} /> Parent/Guardian Phone
                  </label>
                  <input
                    id="parentPhone"
                    type="tel"
                    className="admissions-input"
                    name="parentPhone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admissions-field">
                  <label className="admissions-label" htmlFor="dob">
                    <CalendarDays size={14} /> Date of Birth
                  </label>
                  <input
                    id="dob"
                    type="date"
                    className="admissions-input"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admissions-field">
                  <label className="admissions-label" htmlFor="program">
                    <BookOpenText size={14} /> Program of Interest
                  </label>
                  <select
                    id="program"
                    className="admissions-select"
                    name="program"
                    value={formData.program}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a program</option>
                    <option value="ai-ml">Artificial Intelligence & Machine Learning</option>
                    <option value="quantum">Quantum Computing</option>
                    <option value="bioengineering">Bio-Engineering & Ethics</option>
                    <option value="fintech">FinTech & Digital Economics</option>
                    <option value="creative-tech">Creative Technology & Design</option>
                    <option value="leadership">Global Leadership & Innovation</option>
                  </select>
                </div>

                <div className="admissions-field">
                  <label className="admissions-label" htmlFor="qualification">
                    <History size={14} /> Highest Qualification
                  </label>
                  <select
                    id="qualification"
                    className="admissions-select"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select qualification</option>
                    <option value="highschool">High School Diploma</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">PhD / Doctorate</option>
                    <option value="other">Other / Equivalent</option>
                  </select>
                </div>

                <div className="admissions-field admissions-field-full">
                  <label className="admissions-label" htmlFor="statement">
                    <FileText size={14} /> Personal Statement / Motivation
                  </label>
                  <textarea
                    id="statement"
                    className="admissions-textarea"
                    name="statement"
                    placeholder="Tell us why you want to join The Academy and what drives your passion for innovation..."
                    value={formData.statement}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="admissions-field admissions-field-full">
                  <label className="admissions-label" htmlFor="referral">
                    <Share2 size={14} /> How did you hear about us?
                  </label>
                  <select
                    id="referral"
                    className="admissions-select"
                    name="referral"
                    value={formData.referral}
                    onChange={handleChange}
                  >
                    <option value="">Select an option</option>
                    <option value="social">Social Media</option>
                    <option value="alumni">Alumni Referral</option>
                    <option value="event">Educational Event</option>
                    <option value="search">Search Engine</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <label className="admissions-checkbox-row" htmlFor="termsAgree">
                <input
                  id="termsAgree"
                  type="checkbox"
                  name="termsAgree"
                  checked={formData.termsAgree}
                  onChange={handleChange}
                  required
                />
                <span>
                  I confirm that the information provided is accurate and I agree to the{" "}
                  <a href="#">Terms of Admission</a> and <a href="#">Privacy Policy</a>.
                </span>
              </label>

              <button type="submit" className="admissions-submit" disabled={submitting}>
                <Send size={16} /> {submitting ? "Submitting..." : "Submit Application"}
              </button>

              <div className="admissions-footnote">
                <Info size={15} />
                <span>
                  Your application will be reviewed by our admissions committee. You will receive a
                  confirmation email within 48 hours.
                </span>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdmissionsPage;
