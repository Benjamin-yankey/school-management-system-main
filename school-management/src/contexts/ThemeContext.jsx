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

  const value = {
    themeMode,
    setThemeMode,
    theme,
    isDarkMode: theme === 'dark',
    fontSize,
    setFontSize,
    density,
    setDensity
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
