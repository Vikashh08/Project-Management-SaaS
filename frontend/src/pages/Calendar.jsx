import React from 'react';

const Calendar = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 35 }, (_, i) => i + 1); // Mock calendar grid

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Calendar</h1>
          <p className="text-text-muted text-sm mt-1">October 2026</p>
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
          {dates.map((date, i) => (
            <div 
              key={i} 
              className={`border-b border-r border-gray-100 dark:border-gray-800 p-2 min-h-[120px] transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30 ${i % 7 === 6 ? 'border-r-0' : ''}`}
            >
              <span className={`text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full ${date === 15 ? 'bg-blue-600 text-white' : 'text-text-muted'}`}>
                {date > 31 ? date - 31 : date}
              </span>
              
              {date === 12 && (
                <div className="mt-1 px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs rounded truncate font-medium">
                  Design Review
                </div>
              )}
              {date === 15 && (
                <div className="mt-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded truncate font-medium">
                  Sprint Planning
                </div>
              )}
              {date === 22 && (
                <div className="mt-1 px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs rounded truncate font-medium">
                  Production Deployment
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
