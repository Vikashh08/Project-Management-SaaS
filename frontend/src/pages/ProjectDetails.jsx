import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle2, Circle, LayoutDashboard, Calendar, Target, Activity, Settings, Folder, LayoutList, MessageSquare, FileText, ChevronRight, Hash } from 'lucide-react';
import Loader from '../components/Loader';
import ProjectBoard from '../components/ProjectBoard';
import ProjectSprints from '../components/ProjectSprints';
import ProjectTimeline from '../components/ProjectTimeline';
import ProjectFiles from '../components/ProjectFiles';
import ProjectWiki from '../components/ProjectWiki';
import ProjectDiscussions from '../components/ProjectDiscussions';
import ProjectSettings from '../components/ProjectSettings';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const styles = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ON_HOLD: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ARCHIVED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  };
  return (
    <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// --- TABS DEFINITION ---
const TABS = [
  { id: 'overview', label: 'Overview', icon: Target },
  { id: 'board', label: 'Board', icon: LayoutDashboard },
  { id: 'list', label: 'List', icon: LayoutList },
  { id: 'sprints', label: 'Sprints', icon: Activity },
  { id: 'timeline', label: 'Timeline', icon: Calendar },
  { id: 'files', label: 'Files', icon: Folder },
  { id: 'discussions', label: 'Discussions', icon: MessageSquare },
  { id: 'wiki', label: 'Wiki', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const ProjectDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${id}`);
      return data;
    }
  });

  if (isLoading) return <Loader text="Loading project details..." />;
  if (error) return <div className="p-6 text-red-500">Error loading project.</div>;
  if (!project) return <div className="p-6 text-text-muted">Project not found.</div>;

  // Overview Calculations
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0;
  const pendingTasks = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const membersCount = project.members?.length || 0;

  // Placeholder Activity Data
  const recentActivity = [
    { id: 1, action: 'created a new task', target: 'Login API Integration', user: project.owner?.name || 'System', time: '2 hours ago' },
    { id: 2, action: 'completed', target: 'Database Schema Design', user: 'Sarah Jenkins', time: '5 hours ago' },
    { id: 3, action: 'uploaded a file', target: 'architecture_v2.pdf', user: 'Rahul Sharma', time: '1 day ago' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0b1120]">
      {/* PERSISTENT HEADER & BANNER */}
      <div className="relative bg-white dark:bg-[#131b2e] border-b border-gray-200 dark:border-gray-800 shrink-0">
        {/* Banner Area */}
        <div className="h-40 w-full relative overflow-hidden">
          {project.banner ? (
            <img src={project.banner} alt="Project Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full opacity-80" style={{ background: project.color ? `linear-gradient(135deg, ${project.color}aa, ${project.color})` : 'linear-gradient(135deg, #4f46e5, #3b82f6)' }}></div>
          )}
          {/* Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
          
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <Link to="/dashboard/projects" className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl transition-colors text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Project Title & Navigation */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 mb-4 relative z-10 gap-4">
            <div className="flex items-end gap-5">
              <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-[#131b2e] bg-white dark:bg-gray-900 shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                {project.logo ? (
                  <img src={project.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Folder className="w-10 h-10 text-primary" />
                )}
              </div>
              <div className="pb-2">
                <div className="flex items-center gap-3 mb-1">
                  {project.projectKey && <span className="text-sm font-bold text-gray-500 uppercase">[{project.projectKey}]</span>}
                  <StatusBadge status={project.status} />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{project.name}</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3 pb-2">
              <Link 
                to={`/dashboard/tasks?projectId=${project.id}`}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25 active:scale-95"
              >
                <LayoutDashboard className="w-5 h-5" /> Active Board
              </Link>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-gray-100 dark:border-gray-800 pt-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap ${
                    isActive 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-t-xl'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* Top Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4 text-gray-500 dark:text-gray-400">
                    <Target className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-sm uppercase tracking-wider">Progress</span>
                  </div>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4 text-gray-500 dark:text-gray-400">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-sm uppercase tracking-wider">Completed</span>
                  </div>
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{completedTasks}</span>
                  <span className="text-sm font-medium text-gray-500">Tasks done</span>
                </div>

                <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4 text-gray-500 dark:text-gray-400">
                    <Circle className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-sm uppercase tracking-wider">Pending</span>
                  </div>
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{pendingTasks}</span>
                  <span className="text-sm font-medium text-gray-500">Tasks remaining</span>
                </div>

                <div className="bg-white dark:bg-[#131b2e] rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-4 text-gray-500 dark:text-gray-400">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold text-sm uppercase tracking-wider">Members</span>
                  </div>
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{membersCount}</span>
                  <span className="text-sm font-medium text-gray-500">Active participants</span>
                </div>
              </div>

              {/* Middle Row: Activity & Members */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Activity */}
                <div className="bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Recent Activity</h3>
                    <button className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors">View All</button>
                  </div>
                  <div className="space-y-6">
                    {recentActivity.map((log, idx) => (
                      <div key={log.id} className="flex gap-4 relative">
                        {idx !== recentActivity.length - 1 && (
                          <div className="absolute left-5 top-10 bottom-0 w-[2px] bg-gray-100 dark:bg-gray-800 -mb-6"></div>
                        )}
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-[#131b2e] flex items-center justify-center shrink-0 z-10 text-gray-500 font-bold text-sm">
                          {log.user.charAt(0)}
                        </div>
                        <div className="pt-2">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            <span className="font-bold">{log.user}</span> {log.action} <span className="font-bold text-primary">{log.target}</span>
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Roster */}
                <div className="bg-white dark:bg-[#131b2e] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Project Members</h3>
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    {project.members?.map(({ user }) => (
                      <div key={user.id} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                          {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-xs font-medium text-gray-500 truncate">{user.id === project.ownerId ? 'Owner' : 'Member'}</p>
                        </div>
                      </div>
                    ))}
                    {(!project.members || project.members.length === 0) && (
                      <div className="text-center py-6 text-gray-500 text-sm">No members added yet.</div>
                    )}
                  </div>
                  
                  <button className="mt-4 w-full py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center gap-2">
                    Manage Team <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'board' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-280px)]">
              <ProjectBoard project={project} />
            </motion.div>
          )}

          {activeTab === 'sprints' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ProjectSprints project={project} />
            </motion.div>
          )}

          {activeTab === 'timeline' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-280px)]">
              <ProjectTimeline project={project} />
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ProjectFiles project={project} />
            </motion.div>
          )}

          {activeTab === 'wiki' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-280px)]">
              <ProjectWiki project={project} />
            </motion.div>
          )}

          {activeTab === 'discussions' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ProjectDiscussions project={project} />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ProjectSettings project={project} />
            </motion.div>
          )}

          {activeTab !== 'overview' && activeTab !== 'board' && activeTab !== 'sprints' && activeTab !== 'timeline' && activeTab !== 'files' && activeTab !== 'wiki' && activeTab !== 'discussions' && activeTab !== 'settings' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 border border-gray-200 dark:border-gray-700 shadow-inner rotate-3">
                <Settings className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
              <p className="text-gray-500 font-medium max-w-sm">The {TABS.find(t => t.id === activeTab)?.label} tab is scheduled for development in an upcoming implementation phase.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
