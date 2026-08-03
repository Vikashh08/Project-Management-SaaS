import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const Calendar = () => {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.get('/tasks'); // Using existing task endpoint
      return data;
    }
  });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1); // Mock calendar grid

  const getTasksForDate = (dayOfMonth) => {
    if (!tasks) return [];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const d = new Date(task.dueDate);
      return d.getDate() === dayOfMonth;
    });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'HIGH': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'MEDIUM': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'LOW': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  if (isLoading) {
    return <div className="p-6 text-text-muted">Loading calendar events...</div>;
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Calendar</h1>
          <p className="text-text-muted text-sm mt-1">Current Month</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-text-color rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">Today</button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Add Event</button>
        </div>
      </div>

      <div className="flex-1 bg-surface-color rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          {days.map(day => (
            <div key={day} className="p-4 text-center text-sm font-bold text-text-muted uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-7 flex-1">
          {dates.map((date, i) => {
            const dayNum = date > 31 ? date - 31 : date;
            const dayTasks = getTasksForDate(dayNum);
            
            return (
              <div 
                key={i} 
                className={`border-b border-r border-gray-100 dark:border-gray-800 p-2 min-h-[120px] transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30 ${i % 7 === 6 ? 'border-r-0' : ''}`}
              >
                <span className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full ${date === new Date().getDate() ? 'bg-blue-600 text-white' : 'text-text-muted'}`}>
                  {dayNum}
                </span>
                
                <div className="mt-1 space-y-1">
                  {dayTasks.map(task => (
                    <div key={task.id} className={`px-2 py-1 text-xs rounded truncate font-medium ${getPriorityColor(task.priority)}`} title={task.title}>
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
