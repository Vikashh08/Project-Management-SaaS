import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../components/Loader';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const Timeline = () => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  
  // Date view window (default to current month)
  const [viewStartDate, setViewStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Start of month
    return d;
  });

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    }
  });

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const { data: tasks = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      const { data } = await api.get(`/tasks?projectId=${selectedProjectId}`);
      return data;
    },
    enabled: !!selectedProjectId
  });

  // Calculate days to display in the view window (e.g., 30 days)
  const daysInView = 30;
  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < daysInView; i++) {
      const d = new Date(viewStartDate);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [viewStartDate]);

  const handlePrev = () => {
    const d = new Date(viewStartDate);
    d.setDate(d.getDate() - 7); // shift by a week
    setViewStartDate(d);
  };

  const handleNext = () => {
    const d = new Date(viewStartDate);
    d.setDate(d.getDate() + 7);
    setViewStartDate(d);
  };

  // Filter tasks that have dates and overlap with our view window
  const viewEndDate = new Date(viewStartDate);
  viewEndDate.setDate(viewEndDate.getDate() + daysInView);

  const timelineTasks = tasks.filter(t => {
    if (!t.startDate && !t.dueDate) return false;
    // Default to a 1-day task if only one date is provided
    const start = t.startDate ? new Date(t.startDate) : new Date(t.dueDate);
    const end = t.dueDate ? new Date(t.dueDate) : new Date(t.startDate);
    
    // Check overlap
    return start <= viewEndDate && end >= viewStartDate;
  }).map(t => {
    const start = t.startDate ? new Date(t.startDate) : new Date(t.dueDate);
    const end = t.dueDate ? new Date(t.dueDate) : new Date(t.startDate);
    return { ...t, start, end };
  }).sort((a, b) => a.start - b.start);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 lg:p-6 h-full flex flex-col"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-color tracking-tight">Timeline</h1>
          <p className="text-sm text-text-muted mt-1">Gantt chart view for your project tasks.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {projects.length > 0 && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex-1 sm:flex-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-text-muted font-medium rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
             <button onClick={handlePrev} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500">
               <ChevronLeft className="w-5 h-5" />
             </button>
             <button onClick={() => setViewStartDate(new Date())} className="px-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary">
               Today
             </button>
             <button onClick={handleNext} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500">
               <ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
        {isLoadingProjects || isLoadingTasks ? (
          <Loader text="Loading timeline..." />
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar flex">
            {/* Left side: Task list */}
            <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-800/30 flex flex-col">
              <div className="h-12 border-b border-gray-200 dark:border-gray-700/60 flex items-center px-4 font-bold text-xs text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur z-10">
                Task Name
              </div>
              <div className="flex-1 overflow-y-hidden">
                {timelineTasks.map((task) => (
                  <div key={task.id} className="h-12 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 text-sm font-medium text-gray-700 dark:text-gray-300 truncate hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors" title={task.title}>
                    {task.title}
                  </div>
                ))}
                {timelineTasks.length === 0 && (
                  <div className="p-4 text-sm text-gray-500 text-center">No tasks with dates in this view.</div>
                )}
              </div>
            </div>

            {/* Right side: Timeline grid */}
            <div className="flex-1 flex flex-col relative min-w-[800px]">
              {/* Header: Days */}
              <div className="h-12 border-b border-gray-200 dark:border-gray-700/60 flex sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">
                 {days.map((d, i) => {
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                      <div key={i} className={`flex-1 border-r border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-xs min-w-[40px] ${isToday ? 'bg-primary/5 text-primary font-bold' : 'text-gray-500'}`}>
                         <span>{d.toLocaleDateString('en-US', { weekday: 'short' })[0]}</span>
                         <span>{d.getDate()}</span>
                      </div>
                    );
                 })}
              </div>

              {/* Rows: Task bars */}
              <div className="flex-1 relative">
                 {/* Grid lines background */}
                 <div className="absolute inset-0 flex pointer-events-none">
                    {days.map((_, i) => (
                       <div key={i} className="flex-1 border-r border-gray-100 dark:border-gray-800/50 min-w-[40px]"></div>
                    ))}
                 </div>

                 {/* Task bars */}
                 <div className="relative z-0">
                   {timelineTasks.map((task, i) => {
                      // Calculate positions
                      const startOffset = Math.max(0, (task.start - viewStartDate) / MS_PER_DAY);
                      const duration = (task.end - task.start) / MS_PER_DAY + 1;
                      const visibleDuration = Math.min(duration, daysInView - startOffset);
                      const leftPercent = (startOffset / daysInView) * 100;
                      const widthPercent = (visibleDuration / daysInView) * 100;

                      return (
                        <div key={task.id} className="h-12 border-b border-transparent relative flex items-center group hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                          <motion.div 
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: `${Math.max(widthPercent, 2)}%`, opacity: 1 }}
                            className="absolute h-8 rounded-md bg-primary/20 border border-primary/40 flex items-center px-2 cursor-pointer hover:bg-primary/30 transition-colors shadow-sm overflow-hidden"
                            style={{ left: `${Math.max(leftPercent, 0)}%` }}
                            title={`${task.title}\n${task.start.toLocaleDateString()} - ${task.end.toLocaleDateString()}`}
                          >
                             <span className="text-[10px] font-bold text-primary truncate">
                               {task.title}
                             </span>
                          </motion.div>
                        </div>
                      );
                   })}
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Timeline;
