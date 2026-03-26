import React from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  ChartSpline,
  Cpu,
  Globe2,
  Microscope,
  Palette,
  Sparkles,
} from "lucide-react";
import "./AcademyPages.css";

const programs = [
  {
    icon: BrainCircuit,
    title: "Artificial Intelligence & Machine Learning",
    description:
      "Build production-grade AI systems, from foundational models to responsible deployment in health, finance, and civic systems.",
    chips: ["4 Years", "Studio + Research", "Capstone Included"],
  },
  {
    icon: Cpu,
    title: "Quantum Computing",
    description:
      "Master quantum theory, simulation, and hardware-aware algorithm design with weekly experimentation in our quantum sandbox labs.",
    chips: ["Advanced Track", "Lab Intensive", "Scholar Cohorts"],
  },
  {
    icon: Microscope,
    title: "Bio-Engineering & Ethics",
    description:
      "Blend life sciences, computation, and ethics frameworks to design technologies that are innovative, safe, and human-centered.",
    chips: ["Interdisciplinary", "Clinical Partnerships", "Policy Modules"],
  },
  {
    icon: ChartSpline,
    title: "FinTech & Digital Economics",
    description:
      "Learn financial systems, blockchain architecture, and macro-level digital economics to create scalable modern finance products.",
    chips: ["Market Labs", "Data + Risk", "Global Mentors"],
  },
  {
    icon: Palette,
    title: "Creative Technology & Design",
    description:
      "Fuse visual design, immersive media, and interaction systems to build meaningful products at the edge of creativity and engineering.",
    chips: ["Portfolio-Driven", "Design Sprints", "Industry Critiques"],
  },
  {
    icon: Globe2,
    title: "Global Leadership & Innovation",
    description:
      "Develop strategic leadership, negotiation, and innovation operations for teams shaping future-facing institutions worldwide.",
    chips: ["Executive Coaching", "Global Residencies", "Venture Projects"],
  },
];

const ProgramsPage = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
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
            <Link to="/programs" className="academy-page-link active" onClick={() => setIsMenuOpen(false)}>
              Programs
            </Link>
            <Link to="/campus" className="academy-page-link" onClick={() => setIsMenuOpen(false)}>
              Campus
            </Link>
            <Link to="/admissions" className="academy-page-link" onClick={() => setIsMenuOpen(false)}>
              Admissions
            </Link>
          </nav>
          <div className="academy-page-actions">
            <Link to="/signin" className="academy-page-auth">
              Sign In
            </Link>
            <Link to="/signup" className="academy-page-auth academy-page-auth-accent">
              Sign Up
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
            <Sparkles size={14} /> Academic Portfolio
          </span>
          <h1 className="academy-page-title">
            Programs built for deep thinkers, builders, and future leaders.
          </h1>
          <p className="academy-page-subtitle">
            Every pathway combines rigorous theory, real implementation, and close mentorship.
            Choose a direction that stretches your technical depth and strategic imagination.
          </p>
        </section>

        <section className="academy-page-grid">
          {programs.map((program) => {
            const Icon = program.icon;
            return (
              <article key={program.title} className="academy-page-card">
                <span className="academy-page-card-icon" aria-hidden="true">
                  <Icon size={18} />
                </span>
                <h2 className="academy-page-card-title">{program.title}</h2>
                <p className="academy-page-card-text">{program.description}</p>
                <div className="academy-page-chip-row">
                  {program.chips.map((chip) => (
                    <span key={chip} className="academy-page-chip">
                      {chip}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default ProgramsPage;
