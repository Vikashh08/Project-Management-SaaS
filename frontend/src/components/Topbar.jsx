import React from 'react';
import { Menu, Settings, Download, Home, ChevronRight } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import ProfileDropdown from './ProfileDropdown';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'react-router';

const Topbar = ({ onMenuClick, onSearchClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0) return [{ label: 'Dashboard', to: '/' }];
    
    const breadcrumbs = [];
    let currentPath = '';
    
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      // Capitalize and clean up the segment name
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      breadcrumbs.push({ label, to: currentPath });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-transparent flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Left side: Mobile menu + Breadcrumbs */}
      <div className="flex items-center flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 mr-2 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm">
          <Link 
            to="/"
            className="p-1 text-text-muted hover:text-primary transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.to}>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
              <Link 
                to={crumb.to}
                className={`transition-colors font-medium ${
                  index === breadcrumbs.length - 1 
                    ? 'text-text-color' 
                    : 'text-text-muted hover:text-text-color'
                }`}
              >
                {crumb.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>
      
      {/* Right side: Actions */}
      <div className="flex items-center gap-2">
        <button 
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-text-muted hover:text-text-color hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title="Settings"
          onClick={() => window.location.href = '/settings'}
        >
          <Settings className="w-4.5 h-4.5" />
        </button>
        
        <NotificationDropdown />
        <ProfileDropdown />

        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 hover:shadow-primary/30 ml-2">
          <span>Export Data</span>
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
