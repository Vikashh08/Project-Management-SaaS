import React from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, FolderOpen, CheckSquare, Users, Calendar, BarChart3, Settings } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: FolderOpen, label: 'Projects', to: '/projects' },
  { icon: CheckSquare, label: 'Tasks', to: '/tasks' },
  { icon: Users, label: 'Teams', to: '/teams' },
  { icon: Calendar, label: 'Calendar', to: '/calendar' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-surface-color border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col h-screen">
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-xl leading-none">T</span>
        </div>
        <span className="font-bold text-xl tracking-tight">TaskFlow<span className="text-blue-600">AI</span></span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2.5 rounded-lg transition-colors group',
                  isActive 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
                    : 'text-text-muted hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-text-color'
                )
              }
            >
              <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
