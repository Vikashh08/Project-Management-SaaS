import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';

const Topbar = ({ onMenuClick, onSearchClick }) => {
  return (
    <header className="h-16 bg-surface-color border-b border-border-color flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 mr-2 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="hidden md:flex relative max-w-md w-full cursor-text" onClick={onSearchClick}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span>Search projects, tasks, or users...</span>
            <div className="ml-auto flex items-center space-x-1">
              <span className="bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded shadow-sm text-xs font-medium">Cmd</span>
              <span className="bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded shadow-sm text-xs font-medium">K</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-color"></span>
        </button>
        
        <div className="flex items-center space-x-3 border-l border-gray-200 dark:border-gray-700 pl-4">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden cursor-pointer">
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
