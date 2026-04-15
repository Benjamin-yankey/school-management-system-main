// DashboardTour.jsx — Premium Guided Onboarding

import React, { useState, useEffect } from "react";
import "./DashboardTour.css";

const TOUR_STORAGE_KEY = "gis_dashboard_tour_v1";

const TOUR_STEPS = [
  {
    target: ".dash-sidebar",
    title: "Main Navigation",
    content: "This is your command center. Access all your school management modules from here.",
    position: "right",
  },
  {
    target: "#dash-sidebar-collapse-btn",
    title: "Expand Your View",
    content: "Need more screen space? Use this arrow to collapse the sidebar into a compact view.",
    position: "right",
    hideOnMobile: true,
  },
  {
    target: ".dash-topbar-theme-toggle",
    title: "Light or Dark?",
    content: "Switch between light and dark themes anytime to suit your environment.",
    position: "bottom",
  },
  {
    target: ".dash-topbar-help",
    title: "Help Center",
    content: "Access documentation and support resources if you're ever stuck.",
    position: "bottom",
  },
  {
    target: ".dash-topbar-profile-trigger",
    title: "Your Account",
    content: "Manage your profile settings or sign out from here.",
    position: "bottom",
  },
];

export default function DashboardTour() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  // Check if tour should run
  useEffect(() => {
    const hasCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", handleResize);

    if (!hasCompleted) {
      const timer = setTimeout(() => {
        setCurrentStep(0);
        setIsVisible(true);
      }, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
      };
    }
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update target rect when step changes
  useEffect(() => {
    if (currentStep < 0 || !isVisible) return;

    const updateRect = () => {
      const step = TOUR_STEPS[currentStep];
      if (!step) return;

      const el = document.querySelector(step.target);
      if (el) {
        // Skip if hidden on mobile or actually hidden in DOM
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || (isMobile && step.hideOnMobile)) {
          handleNext();
          return;
        }

        setTargetRect(el.getBoundingClientRect());
        el.classList.add("dash-tour-highlighted");
      } else {
        // If element not found, just skip
        handleNext();
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      const step = TOUR_STEPS[currentStep];
      if (step) {
        const el = document.querySelector(step.target);
        if (el) el.classList.remove("dash-tour-highlighted");
      }
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [currentStep, isVisible, isMobile]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(v => v + 1);
    } else {
      completeTour();
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem(TOUR_STORAGE_KEY, "true");
  };

  if (currentStep < 0 || !isVisible || !targetRect) return null;

  const step = TOUR_STEPS[currentStep];
  const { top, left, width, height } = targetRect;

  // Calculate card position
  let cardStyle = {};
  let arrowClass = "";

  if (isMobile) {
    // Mobile: Center card at bottom
    cardStyle = { 
      bottom: "32px", 
      left: "50%", 
      transform: "translateX(-50%)", 
      width: "calc(100% - 40px)",
      maxWidth: "340px"
    };
    arrowClass = "dash-tour-mobile-card";
  } else {
    // Desktop: Relative to element
    if (step.position === "right") {
      cardStyle = { top: top + height / 2 - 80, left: left + width + 24 };
      arrowClass = "dash-tour-arrow-right";
    } else if (step.position === "bottom") {
      cardStyle = { top: top + height + 24, left: left + width / 2 - 160 };
      arrowClass = "dash-tour-arrow-bottom";
    }
  }

  return (
    <div className="dash-tour-container" style={{ pointerEvents: "none" }}>
      {/* Spotlight Effect Blocks */}
      <div className="dash-tour-block" style={{ top: 0, left: 0, width: "100%", height: top }} /> {/* Top */}
      <div className="dash-tour-block" style={{ top: top + height, left: 0, width: "100%", height: `calc(100vh - ${top + height}px)` }} /> {/* Bottom */}
      <div className="dash-tour-block" style={{ top, left: 0, width: left, height }} /> {/* Left */}
      <div className="dash-tour-block" style={{ top, left: left + width, width: `calc(100vw - ${left + width}px)`, height }} /> {/* Right */}

      {/* Tour Card */}
      <div 
        className={`dash-tour-card ${arrowClass}`}
        style={cardStyle}
      >
        <div className="dash-tour-step-info">Step {currentStep + 1} of {TOUR_STEPS.length}</div>
        <h3 className="dash-tour-title">{step.title}</h3>
        <p className="dash-tour-body">{step.content}</p>
        
        <div className="dash-tour-footer">
          <button className="dash-tour-skip" onClick={completeTour} style={{ pointerEvents: "auto" }}>Skip Tour</button>
          <button className="dash-tour-next" onClick={handleNext} style={{ pointerEvents: "auto" }}>
            {currentStep === TOUR_STEPS.length - 1 ? "Start Exploring" : "Next step"}
          </button>
        </div>
      </div>
    </div>
  );
}
