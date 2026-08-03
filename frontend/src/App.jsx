import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          {/* Add more routes here later */}
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="calendar" element={<div className="p-6">Calendar Page Placeholder</div>} />
          <Route path="analytics" element={<div className="p-6">Analytics Page Placeholder</div>} />
          <Route path="settings" element={<div className="p-6">Settings Page Placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
