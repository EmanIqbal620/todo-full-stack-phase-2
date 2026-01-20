'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { ThemeConfig, getTheme } from '../styles/theme';

interface ThemeContextType {
  theme: ThemeConfig;
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export the context for use in ThemeProvider
export { ThemeContext };

// Theme Provider component
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Get initial theme mode from localStorage or default to 'dark'
  const getInitialThemeMode = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme-mode');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark'; // Default to dark theme
  };

  const [mode, setMode] = useState<'light' | 'dark'>(getInitialThemeMode);
  const [theme, setThemeState] = useState<ThemeConfig>(getTheme(getInitialThemeMode()));

  // Update theme when mode changes
  useEffect(() => {
    const newTheme = getTheme(mode);
    setThemeState(newTheme);

    // Save theme preference to localStorage
    localStorage.setItem('theme-mode', mode);

    // Update document class for CSS custom properties
    document.documentElement.setAttribute('data-theme', mode);

    // Update meta theme-color for mobile browsers
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', mode === 'dark' ? newTheme.colors.background : '#ffffff');
    }
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly set a theme
      if (!localStorage.getItem('theme-mode')) {
        setMode(e.matches ? 'light' : 'dark');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      (mediaQuery as any).addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        (mediaQuery as any).removeListener(handleChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setThemeMode = (newMode: 'light' | 'dark') => {
    setMode(newMode);
  };

  const value = {
    theme,
    mode,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};