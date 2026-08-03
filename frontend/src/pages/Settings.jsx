import React from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 h-full overflow-y-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-color">Settings</h1>
        <p className="text-text-muted text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-surface-color rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <h2 className="text-lg font-bold text-text-color mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Profile Information</h2>
        
        <div className="flex items-center space-x-6 mb-8">
          <img src={user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id || 'default'}`} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-50 dark:border-gray-800 object-cover" />
          <div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mb-2">Upload new picture</button>
            <p className="text-xs text-text-muted">JPG, GIF or PNG. Max size of 800K</p>
          </div>
        </div>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-text-color">Full Name</label>
              <input type="text" defaultValue={user?.name} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-text-color">Email Address</label>
              <input type="email" defaultValue={user?.email} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-text-color">Role</label>
              <input type="text" defaultValue={user?.role} disabled className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-70 cursor-not-allowed" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
