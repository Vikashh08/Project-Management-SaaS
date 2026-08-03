import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-color text-text-color transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-dark-background/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
