import React from 'react';
import Sidebar from './GlassSidebar';
import Navbar from './GlassNavbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gradient-primary bg-cover bg-center">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6 bg-white/5 dark:bg-gray-900/5 backdrop-blur-sm">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;