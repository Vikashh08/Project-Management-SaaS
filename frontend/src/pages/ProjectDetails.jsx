import React from 'react';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, CheckCircle2, Circle, LayoutDashboard, Calendar, Target, Activity } from 'lucide-react';
import Loader from '../components/Loader';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const styles = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ON_HOLD: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const ProjectDetails = () => {
  const { id } = useParams();

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

  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link to="/projects" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-text-muted" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-text-color">{project.name}</h1>
                <StatusBadge status={project.status} />
              </div>
              <p className="text-text-muted mt-1 max-w-2xl">{project.description || 'No description provided.'}</p>
            </div>
          </div>
          <Link 
            to={`/tasks?projectId=${project.id}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            <LayoutDashboard className="w-5 h-5" />
            Open Kanban Board
          </Link>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="saas-card p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-text-color">Overall Progress</h3>
            </div>
            <div className="flex items-end justify-between mt-2 mb-2">
              <span className="text-3xl font-bold text-text-color">{progress}%</span>
              <span className="text-sm text-text-muted">{completedTasks} of {totalTasks} tasks</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="saas-card p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-text-color">Completed Tasks</h3>
            </div>
            <div className="mt-2">
              <span className="text-4xl font-bold text-text-color">{completedTasks}</span>
            </div>
          </div>

          <div className="saas-card p-6 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                <Circle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-text-color">Open Tasks</h3>
            </div>
            <div className="mt-2">
              <span className="text-4xl font-bold text-text-color">{totalTasks - completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Details Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Members */}
          <div className="saas-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-text-muted" />
                <h3 className="font-bold text-text-color text-lg">Team Roster</h3>
              </div>
              <span className="text-sm text-text-muted bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md font-medium">
                {project.members?.length || 0} Members
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.members?.map(({ user }) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border border-border-color bg-gray-50/50 dark:bg-gray-800/30">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-text-color text-sm truncate">{user.name}</p>
                    <p className="text-xs text-text-muted truncate">
                      {user.id === project.ownerId ? 'Project Owner' : 'Member'}
                    </p>
                  </div>
                </div>
              ))}
              {project.members?.length === 0 && (
                <div className="col-span-full text-center py-6 text-text-muted text-sm">
                  No members assigned yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="saas-card p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-text-muted" />
                <h3 className="font-bold text-text-color text-lg">Quick Info</h3>
              </div>
              
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-xs text-text-muted font-medium mb-1 uppercase tracking-wider">Priority</p>
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                    project.priority === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    project.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {project.priority || 'MEDIUM'}
                  </span>
                </div>
                
                <div>
                  <p className="text-xs text-text-muted font-medium mb-1 uppercase tracking-wider">Owner</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {project.owner?.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-text-color">{project.owner?.name}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-text-muted font-medium mb-1 uppercase tracking-wider">Created</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    <span className="text-sm text-text-color">
                      {new Date(project.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default ProjectDetails;
