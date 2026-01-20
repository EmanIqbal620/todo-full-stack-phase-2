'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`flex flex-col md:flex-row min-h-screen transition-colors duration-300`}
      style={{ backgroundColor: theme.mode === 'dark' ? '#0f0f18' : '#f9f9fb' }}
    >
      {/* Sidebar - Hidden on mobile, shown on medium screens and above */}
      <div className="md:hidden w-full p-4 border-b" style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }}>
        <div className="flex justify-between items-center">
          <h2
            className="text-xl font-bold"
            style={{ color: theme.colors.accent }}
          >
            Todo App
          </h2>
        </div>
      </div>
      <Sidebar className="hidden md:block" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main
          className="flex-1 p-4 sm:p-6 transition-colors duration-300"
          style={{
            backgroundColor: theme.mode === 'dark' ? '#0f0f18' : '#f9f9fb',
          }}
        >
          {/* Optional Floating Decorations */}
          <div
            className="absolute top-10 right-10 w-40 h-40 rounded-full opacity-20 bg-gradient-to-r from-purple-500 to-pink-500 filter blur-3xl pointer-events-none"
          />
          <div
            className="absolute bottom-10 left-10 w-60 h-60 rounded-full opacity-15 bg-gradient-to-r from-purple-400 to-indigo-500 filter blur-3xl pointer-events-none"
          />

          {/* Page Children */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
