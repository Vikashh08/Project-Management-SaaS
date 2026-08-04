import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';
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
  ArcElement,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { LayoutDashboard, CheckSquare, Clock, TrendingUp } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="saas-card p-5 flex items-center justify-between">
    <div>
      <h3 className="text-text-muted text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-text-color">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics');
      return data;
    }
  });

  const { data: activities } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const { data } = await api.get('/users/activity');
      return data.slice(0, 5); // Just first 5 for the dashboard
    }
  });

  if (isLoading) {
    return <Loader text="Loading dashboard data..." />;
  }

  // Task Status Distribution (Doughnut Chart)
  const donutData = {
    labels: ['To Do', 'In Progress', 'In Review', 'Done'],
    datasets: [
      {
        data: [
          stats?.statusDistribution?.TODO || 0, 
          stats?.statusDistribution?.IN_PROGRESS || 0,
          stats?.statusDistribution?.IN_REVIEW || 0,
          stats?.statusDistribution?.DONE || 0
        ],
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)', // gray-400
          'rgba(59, 130, 246, 0.8)',  // blue-500
          'rgba(168, 85, 247, 0.8)',  // purple-500
          'rgba(34, 197, 94, 0.8)',   // green-500
        ],
        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9CA3AF' } }
    }
  };

  // Team Workload (Bar Chart)
  const workloadLabels = stats?.teamWorkload?.map(w => w.name) || [];
  const workloadData = stats?.teamWorkload?.map(w => w.count) || [];

  const barChartData = {
    labels: workloadLabels.length > 0 ? workloadLabels : ['No Data'],
    datasets: [
      {
        label: 'Active Tasks',
        data: workloadData.length > 0 ? workloadData : [0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue-500
        borderRadius: 4,
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(156, 163, 175, 0.1)' },
        ticks: { precision: 0, color: '#9CA3AF' } 
      },
      x: { 
        grid: { display: false },
        ticks: { color: '#9CA3AF' }
      }
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-text-muted text-sm mt-1">Here's what's happening with your projects today.</p>
        </div>
        <button className="hidden sm:block px-4 py-2 bg-white dark:bg-gray-800 border border-border-color text-text-color rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          Download Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <DashboardCard 
            title="Total Projects" 
            value={stats?.totalProjects || 0} 
            icon={LayoutDashboard}
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DashboardCard 
            title="Active Tasks" 
            value={stats?.pendingTasks || 0} 
            icon={Clock}
            colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <DashboardCard 
            title="Tasks Completed" 
            value={stats?.completedTasks || 0} 
            icon={CheckSquare}
            colorClass="bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
          />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <DashboardCard 
            title="Completion Rate" 
            value={`${stats?.completionRate || 0}%`} 
            icon={TrendingUp}
            colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400"
          />
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Status Distribution */}
        <div className="saas-card p-6 lg:col-span-1">
          <h2 className="text-lg font-bold text-text-color mb-6">Task Status</h2>
          <div className="h-64 flex items-center justify-center relative">
             <Doughnut data={donutData} options={donutOptions} />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-[-20px]">
                <span className="text-3xl font-bold text-text-color">{stats?.pendingTasks + stats?.completedTasks}</span>
                <span className="text-xs text-text-muted">Total</span>
             </div>
          </div>
        </div>

        {/* Team Workload */}
        <div className="saas-card p-6 lg:col-span-2">
          <h2 className="text-lg font-bold text-text-color mb-6">Team Workload (Active Tasks)</h2>
          <div className="h-64 w-full">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Recent Activity */}
         <div className="saas-card p-0 overflow-hidden">
          <div className="p-5 border-b border-border-color flex justify-between items-center">
            <h2 className="text-lg font-bold text-text-color">Recent Activity</h2>
            <a href="/settings" className="text-sm text-blue-600 hover:underline">View all</a>
          </div>
          <div className="p-5">
            {activities?.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {activities?.map((activity) => {
                   let parsedDetails = {};
                   try { if(activity.details) parsedDetails = JSON.parse(activity.details); } catch(e){}
                   
                   return (
                     <div key={activity.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                           <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-text-color font-medium capitalize">
                            {activity.action.replace('_', ' ').toLowerCase()}
                          </p>
                          <p className="text-xs text-text-muted">
                            {activity.entityType === 'TASK' && parsedDetails.taskTitle ? `Task: ${parsedDetails.taskTitle}` : ''}
                            {activity.entityType === 'PROJECT' && parsedDetails.projectName ? `Project: ${parsedDetails.projectName}` : ''}
                          </p>
                          <span className="text-xs text-gray-400 mt-1 block">
                            {new Date(activity.createdAt).toLocaleString()}
                          </span>
                        </div>
                     </div>
                   );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Placeholder */}
        <div className="saas-card p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Need to onboard your team?</h2>
            <p className="text-blue-100 text-sm mb-6 max-w-sm">
              Invite your teammates to collaborate, assign tasks, and track progress together in real-time.
            </p>
            <a href="/teams" className="inline-block px-5 py-2.5 bg-white text-blue-600 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm">
              Invite Members
            </a>
          </div>
          <div className="absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4 opacity-20 pointer-events-none">
             <LayoutDashboard className="w-48 h-48" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
