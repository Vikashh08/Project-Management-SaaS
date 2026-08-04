import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle2, ListTodo, Activity, User, Shield, Link, Globe, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile'); // profile | security | activity

  // Form State for Profile
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    skills: user?.skills?.join(', ') || '',
    experience: user?.experience || '',
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    website: user?.website || '',
  });

  // Form State for Password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch metrics & activity
  const { data: metrics } = useQuery({
    queryKey: ['userMetrics'],
    queryFn: async () => {
      const { data } = await api.get('/users/metrics');
      return data;
    }
  });

  const { data: activityLogs } = useQuery({
    queryKey: ['userActivity'],
    queryFn: async () => {
      const { data } = await api.get('/users/activity');
      return data;
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const { data: responseData } = await api.put('/users/profile', data);
      return responseData;
    },
    onSuccess: (data) => {
      toast.success('Profile updated successfully!');
      // Update local storage user data
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      localStorage.setItem('userInfo', JSON.stringify({ ...userInfo, ...data }));
    },
    onError: () => toast.error('Failed to update profile')
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const { data: responseData } = await api.put('/users/change-password', data);
      return responseData;
    },
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      ...profileData,
      skills: profileData.skills.split(',').map(s => s.trim()).filter(s => s)
    });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
  };

  const MetricCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="saas-card p-6 flex items-center justify-between">
      <div>
        <p className="text-text-muted text-sm font-medium mb-1">{title}</p>
        <h4 className="text-2xl font-bold text-text-color">{value || 0}</h4>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-color">Settings & Profile</h1>
        <p className="text-text-muted text-sm mt-1">Manage your account preferences and view your activity.</p>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <MetricCard title="Tasks Completed" value={metrics?.totalCompleted} icon={CheckCircle2} colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
         <MetricCard title="Active Tasks" value={metrics?.activeTasks} icon={ListTodo} colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
         <MetricCard title="Productivity Score" value={metrics?.productivityScore} icon={Activity} colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-border-color mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-text-muted hover:text-text-color hover:border-gray-300'
          }`}
        >
          <User className="w-4 h-4" />
          Public Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-text-muted hover:text-text-color hover:border-gray-300'
          }`}
        >
          <Shield className="w-4 h-4" />
          Account & Security
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'activity'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-text-muted hover:text-text-color hover:border-gray-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          Activity Log
        </button>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="saas-card p-6"
              >
                <h3 className="text-lg font-bold text-text-color mb-6">Profile Information</h3>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  
                  <div className="flex items-center gap-6 pb-6 border-b border-border-color">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold overflow-hidden border-4 border-surface-color shadow-sm">
                      <img src={user?.avatarUrl || `https://i.pravatar.cc/150?u=${user?.id || 'default'}`} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-text-color font-medium mb-1">Avatar Image</h4>
                      <p className="text-sm text-text-muted mb-3">Your avatar is currently tied to your email.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        className="saas-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="saas-input w-full bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1.5">Bio</label>
                    <textarea
                      rows="3"
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      placeholder="Tell us a little about yourself..."
                      className="saas-input w-full resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1.5">Job Title / Experience</label>
                      <input
                        type="text"
                        value={profileData.experience}
                        onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                        placeholder="e.g. Senior Frontend Developer"
                        className="saas-input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-color mb-1.5">Skills (comma separated)</label>
                      <input
                        type="text"
                        value={profileData.skills}
                        onChange={(e) => setProfileData({...profileData, skills: e.target.value})}
                        placeholder="React, Node.js, Design"
                        className="saas-input w-full"
                      />
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="pt-6 border-t border-border-color">
                    <h3 className="text-lg font-bold text-text-color mb-4">Social Links</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Link className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={profileData.github}
                          onChange={(e) => setProfileData({...profileData, github: e.target.value})}
                          placeholder="GitHub URL"
                          className="saas-input w-full pl-10"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Link className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={profileData.linkedin}
                          onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                          placeholder="LinkedIn URL"
                          className="saas-input w-full pl-10"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={profileData.website}
                          onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                          placeholder="Personal Website URL"
                          className="saas-input w-full pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="saas-card p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-color">Change Password</h3>
                    <p className="text-sm text-text-muted">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1.5">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="saas-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1.5">New Password</label>
                    <input
                      type="password"
                      required
                      minLength="6"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="saas-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      minLength="6"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="saas-input w-full"
                    />
                  </div>

                  <div className="flex justify-end pt-4 border-t border-border-color">
                    <button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      className="px-6 py-2.5 bg-text-color text-surface-color font-medium rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <motion.div
                key="activity"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="saas-card p-6"
              >
                <h3 className="text-lg font-bold text-text-color mb-6">Recent Activity Log</h3>
                
                <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-8 pb-4">
                  {activityLogs?.length === 0 ? (
                    <p className="pl-6 text-text-muted text-sm">No activity recorded yet.</p>
                  ) : (
                    activityLogs?.map((log, index) => {
                      let parsedDetails = {};
                      try { if(log.details) parsedDetails = JSON.parse(log.details); } catch(e){}

                      return (
                        <div key={log.id} className="relative pl-8">
                          <span className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 border-4 border-surface-color flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          </span>
                          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-border-color shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-bold text-text-color capitalize">
                                {log.action.replace('_', ' ').toLowerCase()}
                              </span>
                              <span className="text-xs text-text-muted font-medium">
                                {new Date(log.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-text-muted mt-1">
                              {log.entityType === 'TASK' && parsedDetails.taskTitle && (
                                <>Task: <span className="font-medium text-text-color">{parsedDetails.taskTitle}</span></>
                              )}
                              {log.entityType === 'PROJECT' && parsedDetails.projectName && (
                                <>Project: <span className="font-medium text-text-color">{parsedDetails.projectName}</span></>
                              )}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Sidebar Info (Optional) */}
        <div className="hidden lg:block">
          <div className="saas-card p-6 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/10 border-blue-100 dark:border-blue-900/30">
            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">Profile Tips</h4>
            <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mb-4">
              A complete profile helps your team understand your expertise and role. Add your skills and social links to stand out!
            </p>
            <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium text-right">70% Complete</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
