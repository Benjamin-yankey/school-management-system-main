import { useState, useEffect } from "react";

export function useEnrollmentStatus() {
  const [isEnrollmentOpen, setIsEnrollmentOpen] = useState(() => {
    const saved = localStorage.getItem("system-enrollment-open");
    // Default to true if not set
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      // Sync across tabs
      if (e.key === "system-enrollment-open") {
        setIsEnrollmentOpen(JSON.parse(e.newValue));
      }
    };

    const handleLocalChange = () => {
      // Sync within the same tab when dispatched manually
      const saved = localStorage.getItem("system-enrollment-open");
      if (saved !== null) {
        setIsEnrollmentOpen(JSON.parse(saved));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("enrollmentStatusChanged", handleLocalChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("enrollmentStatusChanged", handleLocalChange);
    };
  }, []);

  const toggleEnrollmentStatus = () => {
    const newValue = !isEnrollmentOpen;
    setIsEnrollmentOpen(newValue);
    localStorage.setItem("system-enrollment-open", JSON.stringify(newValue));
    // Dispatch custom event to notify same-tab listeners
    window.dispatchEvent(new Event("enrollmentStatusChanged"));
  };

  return { isEnrollmentOpen, toggleEnrollmentStatus };
}
