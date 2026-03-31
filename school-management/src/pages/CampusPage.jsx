import React from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Trees,
  Wifi,
} from "lucide-react";
import "./AcademyPages.css";

const campusFeatures = [
  {
    title: "Innovation Studios",
    description:
      "Specialized spaces for robotics, creative media, and AI product prototyping with faculty and industry mentors.",
  },
  {
    title: "24/7 Knowledge Library",
    description:
      "Hybrid physical-digital library with research pods, silent floors, and globally indexed archives.",
  },
  {
    title: "Wellness & Performance",
    description:
      "Guided fitness, mental wellness counseling, and performance coaching built into weekly academic rhythm.",
  },
];

const CampusPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
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
              className="academy-page-link active"
              onClick={() => setIsMenuOpen(false)}
            >
              Campus
            </Link>
            <Link
              to="/admissions"
              className="academy-page-link"
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
            <Sparkles size={14} /> Zurich Campus
          </span>
          <h1 className="academy-page-title">
            A high-performance campus built for deep work, collaboration, and
            wellbeing.
          </h1>
          <p className="academy-page-subtitle">
            GEOZIIE INTERNATIONAL SCHOOL campus is designed as a modern
            sanctuary where architecture, technology, and student life blend
            into one focused learning ecosystem.
          </p>
        </section>

        <section className="campus-photo-grid">
          <article className="campus-photo-card">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQzjrgtnRd05hN4zW2f8_TcmY-yW1v5p0owBUOCcKDfouChAMHqBhusBJ8SzDnzftwIuj8U8HfhyeZqCO5QUEZ3vhgjVIKvsbl3k9ZlgulGSWVHkQWA2Z_I3RM8yQQDs38N_Yl2RWoQ8WRJTZRZK7b-aB86H7eNmavldwXQKDwQ_RyTN8nEgVUujdKf8adSsnSZ8VRRp029JjeSkdxpNe-0nuvbWeFvKux0RpZMNPSmKtk7tEkE3sw8ZQN9wRuzFzxfw1pVshSbjtx"
              alt="Main campus architecture"
            />
          </article>
          <article className="campus-photo-card">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgowwrKP3HqzG1TbEFHjvdIBXCrPzz03Nfc2Wr-KlfGOl9Z3Fpgq8GMc5tVmoARgMv7HtSD9yxFN3JEgk5wEzj0OsAeywEBL4pO5K29FyN_ALHKS9_kdRBW7SJwyU_r_oVMTxPHYBBgpKk6xvWQmyCcTYYZdAieBE8yOhIHVBa7CrLJ4Qh9jqYgmW64C69Lwz6-KaBmfRAzxHww8zDdz3Tfx5aaZq0Qxw9sM-KRpFkuvAZymncW1mzkh4Nik0Lw-ILplBGeRAvOr2v"
              alt="Research and community spaces"
            />
          </article>
        </section>

        <section className="campus-info-grid">
          <article className="campus-info-card">
            <h3>
              <MapPin size={16} /> Location
            </h3>
            <p>
              Centrally located in Zurich with direct transit links, walkable
              student neighborhoods, and collaborative startup districts nearby.
            </p>
          </article>

          <article className="campus-info-card">
            <h3>
              <Wifi size={16} /> Connected Learning
            </h3>
            <p>
              High-speed campus network, smart classrooms, and cloud lab
              environments ready for every discipline.
            </p>
          </article>

          <article className="campus-info-card">
            <h3>
              <ShieldCheck size={16} /> Safe Environment
            </h3>
            <p>
              Continuous support systems, secure residence oversight, and
              wellness-first student services.
            </p>
          </article>

          <article className="campus-info-card">
            <h3>
              <Building2 size={16} /> Facilities
            </h3>
            <p>
              Modern lecture theatres, fabrication labs, immersive media
              studios, and interdisciplinary project rooms.
            </p>
          </article>

          <article className="campus-info-card">
            <h3>
              <Trees size={16} /> Student Life
            </h3>
            <p>
              Clubs, international forums, leadership workshops, and curated
              social events across the academic year.
            </p>
          </article>

          {campusFeatures.map((feature) => (
            <article key={feature.title} className="campus-info-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default CampusPage;
