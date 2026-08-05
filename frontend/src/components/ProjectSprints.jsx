import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Target, Calendar, BarChart3, Activity, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import Loader from './Loader';

const ProjectSprints = ({ project }) => {
  const teamId = project.teamId;

  const { data: sprints = [], isLoading } = useQuery({
    queryKey: ['sprints', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      const { data } = await api.get(`/sprints/team/${teamId}`);
      return data;
    },
    enabled: !!teamId
  });

  if (!teamId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-3xl flex items-center justify-center mb-6">
          <AlertTriangle className="w-10 h-10 text-orange-500" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">No Team Assigned</h2>
        <p className="text-gray-500 font-medium max-w-sm mb-6">
          Sprints are managed at the team level. Please assign a team to this project to start planning and executing sprints.
        </p>
        <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all">
          Assign Team in Settings
        </button>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading sprints..." />;

  const activeSprint = sprints.find(s => s.status === 'ACTIVE');
  const upcomingSprints = sprints.filter(s => s.status === 'PLANNED');
  const completedSprints = sprints.filter(s => s.status === 'COMPLETED');

  return (
    <div className="space-y-8">
      {/* Active Sprint Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Activity className="w-6 h-6 text-green-500" /> Active Sprint
          </h2>
          <button className="text-sm font-semibold text-primary hover:text-primary-dark">Complete Sprint</button>
        </div>
        
        {activeSprint ? (
          <div className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">{activeSprint.name}</h3>
                <p className="text-gray-500 font-medium flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4" /> {activeSprint.goal || 'No specific goal defined for this sprint.'}
                </p>
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                    <Calendar className="w-4 h-4" /> 
                    {new Date(activeSprint.startDate).toLocaleDateString()} - {new Date(activeSprint.endDate).toLocaleDateString()}
                  </span>
                  {activeSprint.capacity && (
                    <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                      <BarChart3 className="w-4 h-4" /> {activeSprint.capacity} pts capacity
                    </span>
                  )}
                </div>
              </div>

              {/* Mini Burndown / Stats */}
              <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Sprint Progress</p>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    {activeSprint.tasks?.filter(t => t.status === 'DONE').length || 0}
                  </span>
                  <span className="text-sm font-medium text-gray-400">
                    of {activeSprint.tasks?.length || 0} tasks
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ 
                      width: `${activeSprint.tasks?.length ? (activeSprint.tasks.filter(t => t.status === 'DONE').length / activeSprint.tasks.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
            <Activity className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Active Sprint</h3>
            <p className="text-gray-500 font-medium mb-4 max-w-sm">Start a planned sprint to track progress and execute tasks.</p>
            <button className="px-5 py-2 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2">
              Start a Sprint
            </button>
          </div>
        )}
      </section>

      {/* Upcoming Sprints */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Sprints</h2>
          <button className="px-4 py-2 bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-2 text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Create Sprint
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingSprints.length === 0 ? (
             <div className="col-span-full py-10 text-center text-gray-500 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white/50 dark:bg-[#131b2e]/50 font-medium">
               No upcoming sprints planned.
             </div>
          ) : (
            upcomingSprints.map(sprint => (
              <div key={sprint.id} className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{sprint.name}</h4>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md">
                    PLANNED
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> 
                    {new Date(sprint.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" /> 
                    {sprint.goal || 'No goal'}
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">{sprint.tasks?.length || 0} Tasks</span>
                  <button className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">Start Sprint</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default ProjectSprints;
