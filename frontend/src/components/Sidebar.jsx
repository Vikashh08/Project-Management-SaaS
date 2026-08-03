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

const Sidebar = ({ onClose }) => {
  return (
    <aside className="w-64 bg-surface-color border-r border-border-color flex flex-col h-screen h-full">
      <div className="h-16 flex items-center px-6 border-b border-border-color">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-primary/30">
          <span className="text-white font-bold text-xl leading-none">T</span>
        </div>
        <span className="font-bold text-lg tracking-tight">TaskFlow<span className="text-primary">AI</span></span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 px-3">
          Menu
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 group font-medium',
                  isActive 
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light shadow-sm' 
                    : 'text-text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-text-color'
                )
              }
            >
              <item.icon className={clsx("w-5 h-5 mr-3 transition-colors duration-200", 
                "group-hover:text-primary dark:group-hover:text-primary-light"
              )} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
