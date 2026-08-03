import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Placeholder cards */}
        <div className="bg-surface-color p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-text-muted text-sm font-medium">Total Projects</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="bg-surface-color p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-text-muted text-sm font-medium">Active Tasks</h3>
          <p className="text-3xl font-bold mt-2">34</p>
        </div>
        <div className="bg-surface-color p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-text-muted text-sm font-medium">Completed Tasks</h3>
          <p className="text-3xl font-bold mt-2">128</p>
        </div>
        <div className="bg-surface-color p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-text-muted text-sm font-medium">Team Members</h3>
          <p className="text-3xl font-bold mt-2">8</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
