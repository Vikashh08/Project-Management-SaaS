import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import Loader from '../components/Loader';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  // Fetch Projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      if (data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(data[0].id);
      }
      return data;
    }
  });

  // Fetch Teams for dropdown
  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get('/teams');
      if (data.length > 0 && !selectedTeamId) {
        setSelectedTeamId(data[0].id);
      }
      return data;
    }
  });

  // Fetch Burndown Data
  const { data: burndownData = [], isLoading: isLoadingBurndown } = useQuery({
    queryKey: ['burndown', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const { data } = await api.get(`/analytics/burndown?projectId=${selectedProjectId}`);
      return data;
    },
    enabled: !!selectedProjectId
  });

  // Fetch Velocity Data
  const { data: velocityData = [], isLoading: isLoadingVelocity } = useQuery({
    queryKey: ['velocity', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return [];
      const { data } = await api.get(`/analytics/velocity?teamId=${selectedTeamId}`);
      return data;
    },
    enabled: !!selectedTeamId
  });

  // Fetch Time Tracking Data
  const { data: timeData, isLoading: isLoadingTime } = useQuery({
    queryKey: ['timeTracking', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return null;
      const { data } = await api.get(`/analytics/time-tracking?projectId=${selectedProjectId}`);
      return data;
    },
    enabled: !!selectedProjectId
  });

  // Prepare Burndown Chart
  const burndownChartData = {
    labels: burndownData.map(d => {
      // Format as MMM DD
      return new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Remaining Tasks (Actual)',
        data: burndownData.map(d => d.remaining),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.2,
      },
      {
        label: 'Ideal Trend',
        data: burndownData.map(d => d.ideal),
        borderColor: 'rgba(156, 163, 175, 1)',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      }
    ]
  };

  // Prepare Velocity Chart
  const velocityChartData = {
    labels: velocityData.map(d => d.sprintName),
    datasets: [
      {
        label: 'Completed Tasks',
        data: velocityData.map(d => d.completedTasks),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderRadius: 4,
      },
      {
        label: 'Total Tasks',
        data: velocityData.map(d => d.totalTasks),
        backgroundColor: 'rgba(209, 213, 219, 0.5)',
        borderRadius: 4,
      }
    ]
  };

  return (
    <div className="p-6 h-full overflow-y-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-color">Analytics & Reporting</h1>
        <p className="text-text-muted text-sm mt-1">Deep insights into your projects and team velocity.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Burndown Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
          className="saas-card p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text-color">Project Burndown</h2>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            {isLoadingBurndown ? (
              <div className="h-full flex items-center justify-center"><Loader /></div>
            ) : burndownData.length > 0 ? (
              <Line 
                data={burndownChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' } },
                    x: { grid: { display: false } }
                  },
                  plugins: { legend: { position: 'bottom' } }
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">No data available for this project.</div>
            )}
          </div>
        </motion.div>

        {/* Velocity Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="saas-card p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text-color">Team Velocity</h2>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-h-[300px]">
            {isLoadingVelocity ? (
              <div className="h-full flex items-center justify-center"><Loader /></div>
            ) : velocityData.length > 0 ? (
              <Bar 
                data={velocityChartData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' } },
                    x: { grid: { display: false } }
                  },
                  plugins: { legend: { position: 'bottom' } }
                }} 
              />
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">No sprint data available for this team. Create some sprints!</div>
            )}
          </div>
        </motion.div>

        {/* Time Tracking Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="saas-card p-6 xl:col-span-2"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-text-color">Time Insights (Project)</h2>
          </div>
          
          {isLoadingTime ? (
            <div className="py-10"><Loader /></div>
          ) : timeData ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-border-color text-center">
                <p className="text-sm text-text-muted mb-1">Estimated Hours</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{timeData.totalEstimated}h</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-border-color text-center">
                <p className="text-sm text-text-muted mb-1">Actual Hours Logged</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{timeData.totalActual}h</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-border-color text-center">
                <p className="text-sm text-text-muted mb-1">Time Efficiency</p>
                <p className={`text-3xl font-bold ${
                  timeData.efficiency >= 100 ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                }`}>
                  {timeData.efficiency}%
                </p>
                <p className="text-xs text-text-muted mt-2">
                  {timeData.efficiency >= 100 ? 'Under or on budget' : 'Over estimated budget'}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-text-muted text-sm">Select a project above to view time insights.</div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Analytics;
