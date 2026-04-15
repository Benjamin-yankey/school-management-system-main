import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/** Returns 'dark' or 'light' based on the OS/system preference. */
const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export const ThemeProvider = ({ children }) => {
  // Appearance State
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('theme-mode') || 'system');
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved === 'system' || !saved ? getSystemTheme() : (saved || 'light');
  });
  
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('font-size') || 'medium');
  const [density, setDensity] = useState(() => localStorage.getItem('density') || 'comfortable');

  // Localization State
  const [region, setRegion] = useState(() => {
    const saved = localStorage.getItem('settings-region');
    return saved ? JSON.parse(saved) : { language: "english", timezone: "UTC", dateFormat: "MM/DD/YYYY" };
  });

  // Handle Theme Preference
  useEffect(() => {
    if (themeMode === 'system') {
      const systemTheme = getSystemTheme();
      setTheme(systemTheme);
      document.body.setAttribute('data-theme', systemTheme);
    } else {
      setTheme(themeMode);
      document.body.setAttribute('data-theme', themeMode);
    }
    localStorage.setItem('theme-mode', themeMode);
  }, [themeMode]);

  // Handle Size & Density
  useEffect(() => {
    // Remove existing classes
    const classesToRemove = ['font-small', 'font-medium', 'font-large', 'density-compact', 'density-comfortable', 'density-airy'];
    document.body.classList.remove(...classesToRemove);
    
    // Add selected ones
    document.body.classList.add(`font-${fontSize}`);
    document.body.classList.add(`density-${density}`);
    
    localStorage.setItem('font-size', fontSize);
    localStorage.setItem('density', density);
  }, [fontSize, density]);

  // Handle Localization Persistence
  useEffect(() => {
    localStorage.setItem('settings-region', JSON.stringify(region));
  }, [region]);

  // Listen for OS-level theme changes when in 'system' mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (themeMode === 'system') {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        document.body.setAttribute('data-theme', newTheme);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Localization Helpers
  const timezoneMap = {
    "UTC": "UTC",
    "GMT-5": "America/New_York",
    "GMT-8": "America/Los_Angeles",
    "GMT+0": "Europe/London",
    "GMT+1": "Africa/Lagos",
    "GMT+3": "Africa/Nairobi",
    "GMT+8": "Asia/Singapore",
    "GMT+9": "Asia/Tokyo"
  };

  const getLocale = () => {
    switch (region.language) {
      case "french":  return "fr-FR";
      case "spanish": return "es-ES";
      case "german":  return "de-DE";
      case "chinese": return "zh-CN";
      case "arabic":  return "ar-SA";
      case "british": return "en-GB";
      default:        return "en-US";
    }
  };

  const formatDate = (date, options = {}) => {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date) : date;
    const locale = getLocale();
    const tz = timezoneMap[region.timezone] || "UTC";
    
    return new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      ...options
    }).format(d);
  };

  const formatTime = (date, options = {}) => {
    if (!date) return "";
    const d = typeof date === 'string' ? new Date(date) : date;
    const locale = getLocale();
    const tz = timezoneMap[region.timezone] || "UTC";
    
    return new Intl.DateTimeFormat(locale, {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      ...options
    }).format(d);
  };

  const value = {
    themeMode,
    setThemeMode,
    theme,
    isDarkMode: theme === 'dark',
    fontSize,
    setFontSize,
    density,
    setDensity,
    region,
    setRegion,
    formatDate,
    formatTime,
    getLocale
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
