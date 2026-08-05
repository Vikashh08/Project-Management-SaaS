import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import api from '../utils/api';
import Loader from './Loader';
import TaskModal from './TaskModal';

const ProjectTimeline = ({ project }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', project.id],
    queryFn: async () => {
      const { data } = await api.get(`/tasks?projectId=${project.id}`);
      return data;
    },
    enabled: !!project.id
  });

  if (isLoading) return <Loader text="Loading timeline..." />;

  // Generate calendar days for the current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const days = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Filter tasks that have at least a due date or start date
  const scheduledTasks = tasks.filter(t => t.startDate || t.dueDate).sort((a, b) => {
    const d1 = new Date(a.startDate || a.dueDate).getTime();
    const d2 = new Date(b.startDate || b.dueDate).getTime();
    return d1 - d2;
  });

  const getTaskStyle = (task) => {
    const taskStart = task.startDate ? new Date(task.startDate) : new Date(task.dueDate);
    const taskEnd = task.dueDate ? new Date(task.dueDate) : new Date(task.startDate);
    
    // Normalize to midnight for accurate day comparison
    taskStart.setHours(0,0,0,0);
    taskEnd.setHours(0,0,0,0);
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // If task is completely outside the month, don't show
    if (taskEnd < monthStart || taskStart > monthEnd) return { display: 'none' };

    const startVisible = taskStart < monthStart ? monthStart : taskStart;
    const endVisible = taskEnd > monthEnd ? monthEnd : taskEnd;

    const startOffset = startVisible.getDate() - 1;
    const duration = (endVisible - startVisible) / (1000 * 60 * 60 * 24) + 1;

    return {
      marginLeft: `${(startOffset / days.length) * 100}%`,
      width: `${(duration / days.length) * 100}%`
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'TODO': return 'bg-yellow-400 text-yellow-900';
      case 'IN_PROGRESS': return 'bg-orange-500 text-white';
      case 'REVIEW': return 'bg-purple-500 text-white';
      case 'DONE': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            <button onClick={prevMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <span className="font-bold min-w-[120px] text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <button onClick={nextMonth} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <Calendar className="w-4 h-4" /> Today
          </button>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="flex-1 bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Header Days */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 relative">
           <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 p-3 font-bold text-gray-500 text-sm flex items-center">
             Task
           </div>
           <div className="flex-1 relative flex">
             {days.map((day, idx) => (
               <div key={idx} className="flex-1 min-w-[30px] border-r border-gray-100 dark:border-gray-800/50 flex flex-col items-center justify-center py-2">
                 <span className="text-[10px] font-semibold text-gray-400 uppercase">{day.toLocaleString('default', { weekday: 'narrow' })}</span>
                 <span className={`text-sm font-bold ${day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth() ? 'text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700 dark:text-gray-300'}`}>
                   {day.getDate()}
                 </span>
               </div>
             ))}
           </div>
        </div>

        {/* Task Rows */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex left-64 right-0 pointer-events-none">
            {days.map((day, idx) => (
              <div key={idx} className="flex-1 border-r border-gray-100 dark:border-gray-800/50"></div>
            ))}
          </div>

          {scheduledTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Calendar className="w-8 h-8 mb-2 opacity-50" />
              <p>No scheduled tasks found for this month.</p>
            </div>
          ) : (
            <div className="pb-10 pt-2">
              {scheduledTasks.map(task => {
                const style = getTaskStyle(task);
                if (style.display === 'none') return null;

                return (
                  <div key={task.id} className="flex group border-b border-transparent hover:border-gray-100 dark:hover:border-gray-800/50 transition-colors">
                    <div className="w-64 flex-shrink-0 p-3 truncate pr-4 relative z-10 bg-white dark:bg-[#131b2e]">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate cursor-pointer hover:text-primary transition-colors" onClick={() => setSelectedTaskId(task.id)}>
                        {task.title}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {task.assignees?.map(a => a.user.name).join(', ') || 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex-1 relative p-1.5 flex items-center">
                      <motion.div 
                        initial={{ opacity: 0, scaleX: 0.9 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        className={`absolute h-8 rounded-md shadow-sm flex items-center px-3 truncate text-xs font-bold cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all ${getStatusColor(task.status)}`}
                        style={{ ...style, transformOrigin: 'left' }}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        {task.title}
                      </motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <TaskModal isOpen={!!selectedTaskId} onClose={() => setSelectedTaskId(null)} taskId={selectedTaskId} />
    </div>
  );
};

export default ProjectTimeline;
