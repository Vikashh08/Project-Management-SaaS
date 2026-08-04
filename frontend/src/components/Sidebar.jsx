import React from 'react';
import { NavLink, useLocation } from 'react-router';
import { 
  LayoutDashboard, FolderOpen, CheckSquare, Users, BarChart3, Clock, Settings, 
  Search, HelpCircle, Activity, LogOut, ChevronRight, X, AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Home', to: '/dashboard', badge: null },
  { icon: FolderOpen, label: 'Projects', to: '/dashboard/projects', badge: null },
  { icon: CheckSquare, label: 'Tasks', to: '/dashboard/tasks', badge: null },
  { icon: Users, label: 'Teams', to: '/dashboard/teams', badge: null },
  { icon: BarChart3, label: 'Analytics', to: '/dashboard/analytics', badge: null },
  { icon: Clock, label: 'Timesheet', to: '/dashboard/timesheet', badge: null },
  { icon: Settings, label: 'Settings', to: '/dashboard/settings', badge: null },
  { icon: Activity, label: 'Activity', to: '/dashboard/activity', badge: null },
];

const Sidebar = ({ onClose, onSearchClick }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="sidebar-redesign w-64 flex flex-col h-screen h-full overflow-hidden">
      {/* Logo Section */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-lg leading-none">T</span>
            </div>
            <span className="font-bold text-lg tracking-tight text-text-color">
              TaskFlow<span className="text-primary">AI</span>
            </span>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-text-muted hover:text-text-color rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-2 pt-1">
        <div 
          onClick={() => onSearchClick && onSearchClick()}
          className="flex items-center gap-2.5 px-3 py-2.5 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl cursor-pointer hover:bg-gray-200/80 dark:hover:bg-gray-700/80 transition-colors group"
        >
          <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-500 transition-colors" />
          <span className="text-sm text-gray-400 group-hover:text-gray-500 transition-colors">Search...</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar py-3 px-3">
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                clsx(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive 
                    ? 'bg-primary/10 text-primary font-semibold' 
                    : 'text-text-muted hover:bg-gray-100 dark:hover:bg-white/5 hover:text-text-color font-medium'
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className={clsx(
                  "w-[18px] h-[18px] transition-colors duration-200",
                )} />
                <span className="text-[14px]">{item.label}</span>
              </div>
              {item.badge && (
                <span className="min-w-[22px] h-[22px] flex items-center justify-center px-1.5 rounded-full bg-primary/15 text-primary text-[11px] font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Upgrade Card */}
      <div className="px-4 pb-3">
        <div className="upgrade-card p-4 relative">
          <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
            Enjoy unlimited access to our app with only a small price monthly.
          </p>
          <div className="flex items-center gap-3">
            <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors">
              Dismiss
            </button>
            <button className="text-xs text-primary font-bold hover:text-primary-dark transition-colors">
              Go Pro
            </button>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 pb-4 pt-1 border-t border-border-color">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700">
              <img 
                src={user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id || 'default'}`}
                alt={user?.name || 'User'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-color truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-text-muted truncate">{user?.role?.replace('_', ' ') || 'Member'}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
