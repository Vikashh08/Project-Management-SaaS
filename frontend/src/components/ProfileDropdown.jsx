import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  // Very basic theme toggle (can be expanded later via a ThemeContext)
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleTheme = (e) => {
    e.stopPropagation();
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 border-l border-gray-200 dark:border-gray-700 pl-4 cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden border-2 border-transparent hover:border-blue-500 transition-colors">
          <img 
            src={user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id || 'default'}`} 
            alt="Profile" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-surface-color border border-border-color rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border-color bg-gray-50 dark:bg-gray-900/50">
              <p className="font-bold text-text-color truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard/settings');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-color hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <User className="w-4 h-4 text-text-muted" />
                Profile
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/dashboard/settings');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-text-color hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-text-muted" />
                Settings
              </button>
              
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-text-color hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isDark ? (
                    <Moon className="w-4 h-4 text-text-muted" />
                  ) : (
                    <Sun className="w-4 h-4 text-text-muted" />
                  )}
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </div>
              </button>
            </div>
            
            <div className="p-2 border-t border-border-color bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
