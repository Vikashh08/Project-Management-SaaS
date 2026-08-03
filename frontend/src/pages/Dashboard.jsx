import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
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
import { Line, Doughnut } from 'react-chartjs-2';
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

  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Tasks Completed',
        data: [12, 19, 15, 25, 22, stats?.completedTasks || 30],
        borderColor: 'rgb(59, 130, 246)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(156, 163, 175, 0.1)' } },
      x: { grid: { display: false } },
    }
  };

  const donutData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [stats?.completedTasks || 0, stats?.pendingTasks || 0],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // green-500
          'rgba(234, 179, 8, 0.8)', // yellow-500
        ],
        borderWidth: 0,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    cutout: '75%',
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  if (isLoading) {
    return <div className="p-6 text-text-muted">Loading dashboard...</div>;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 h-full overflow-y-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-color tracking-tight">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-text-muted mt-2 text-lg">Here's what's happening with your projects today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div variants={itemVariants}>
          <DashboardCard 
            title="Total Projects" 
            value={stats?.totalProjects || 0} 
            icon={LayoutDashboard} 
            colorClass="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light" 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardCard 
            title="Active Projects" 
            value={stats?.activeProjects || 0} 
            icon={TrendingUp} 
            colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardCard 
            title="Total Tasks" 
            value={stats?.totalTasks || 0} 
            icon={CheckSquare} 
            colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardCard 
            title="Completion Rate" 
            value={`${stats?.completionRate || 0}%`} 
            icon={Clock} 
            colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 saas-card p-6">
          <h3 className="text-xl font-bold text-text-color mb-6">Task Completion Trends</h3>
          <div className="h-[300px] flex items-center justify-center">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="saas-card p-6 flex flex-col">
          <h3 className="text-xl font-bold text-text-color mb-6">Current Task Status</h3>
          <div className="flex-1 flex items-center justify-center relative">
            <div className="h-[250px] w-full flex items-center justify-center">
              <Doughnut data={donutData} options={donutOptions} />
            </div>
            {/* Inner Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-4xl font-extrabold text-text-color">{stats?.totalTasks || 0}</span>
              <span className="text-sm font-medium text-text-muted uppercase tracking-wider mt-1">Total Tasks</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
