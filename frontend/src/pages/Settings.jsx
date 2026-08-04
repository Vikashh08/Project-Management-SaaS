import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Activity, Shield, CheckCircle2, ListTodo, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, login } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  // Form setup
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      avatarUrl: user?.avatarUrl || '',
      bio: user?.bio || '',
      skills: user?.skills?.join(', ') || '',
      experience: user?.experience || '',
    }
  });

  const avatarPreview = watch('avatarUrl');

  // Fetch metrics
  const { data: metrics } = useQuery({
    queryKey: ['userMetrics'],
    queryFn: async () => {
      const { data } = await api.get('/users/metrics');
      return data;
    }
  });

  // Fetch activity
  const { data: activities, isLoading: loadingActivity } = useQuery({
    queryKey: ['userActivity'],
    queryFn: async () => {
      const { data } = await api.get('/users/activity');
      return data;
    },
    enabled: activeTab === 'activity'
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      // transform skills string to array
      const payload = {
        ...data,
        skills: data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      const response = await api.put('/users/profile', payload);
      return response.data;
    },
    onSuccess: (data) => {
      // Update local context
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      login(updatedUser); 
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  return (
    <div className="p-6 h-full overflow-y-auto max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-color tracking-tight">Your Profile</h1>
        <p className="text-text-muted mt-2">Manage your personal information and view your activity.</p>
      </div>

      {/* Metrics Dashboard */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface-color p-6 rounded-2xl border border-border-color flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-muted font-medium">Tasks Completed</p>
              <h3 className="text-2xl font-bold text-text-color">{metrics.totalCompleted}</h3>
            </div>
          </div>
          <div className="bg-surface-color p-6 rounded-2xl border border-border-color flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-muted font-medium">Active Tasks</p>
              <h3 className="text-2xl font-bold text-text-color">{metrics.activeTasks}</h3>
            </div>
          </div>
          <div className="bg-surface-color p-6 rounded-2xl border border-border-color flex items-center space-x-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-muted font-medium">Productivity Score</p>
              <h3 className="text-2xl font-bold text-text-color">{metrics.productivityScore}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-border-color mb-6">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-color hover:border-gray-300'}`}
        >
          <User className="w-4 h-4 mr-2" /> Profile Settings
        </button>
        <button 
          onClick={() => setActiveTab('activity')}
          className={`flex items-center px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-color hover:border-gray-300'}`}
        >
          <Activity className="w-4 h-4 mr-2" /> Activity Log
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-surface-color rounded-2xl shadow-sm border border-border-color p-8">
        
        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex items-center space-x-6 pb-6 border-b border-border-color">
              <img src={avatarPreview || `https://i.pravatar.cc/150?u=${user?.id || 'default'}`} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-50 dark:border-gray-800 object-cover shadow-sm" />
              <div className="flex flex-col flex-1 max-w-md">
                 <label className="text-sm font-medium text-text-color mb-1">Avatar Image URL</label>
                 <input 
                   type="text" 
                   {...register('avatarUrl')}
                   className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                   placeholder="https://example.com/avatar.png"
                 />
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-color">Full Name</label>
                  <input 
                    type="text" 
                    {...register('name', { required: 'Name is required' })} 
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-color">Email Address (Read Only)</label>
                  <input 
                    type="email" 
                    {...register('email')} 
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-border-color rounded-lg opacity-70 cursor-not-allowed" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-text-color">Bio</label>
                <textarea 
                  {...register('bio')}
                  placeholder="Tell us a little about yourself..."
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none h-24 resize-none" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-color">Skills (comma separated)</label>
                  <input 
                    type="text" 
                    {...register('skills')} 
                    placeholder="e.g. React, Node.js, Design"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-text-color">Experience / Title</label>
                  <input 
                    type="text" 
                    {...register('experience')} 
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border-color flex justify-end">
                <button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  className="saas-button"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold text-text-color mb-6">Recent Activity</h2>
            
            {loadingActivity ? (
              <p className="text-text-muted">Loading activity history...</p>
            ) : activities?.length === 0 ? (
              <p className="text-text-muted italic">No recent activity found.</p>
            ) : (
              <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-8 pb-4">
                {activities?.map((activity) => {
                  let parsedDetails = {};
                  try { if(activity.details) parsedDetails = JSON.parse(activity.details); } catch(e){}

                  return (
                    <div key={activity.id} className="relative pl-8">
                      <div className="absolute w-4 h-4 bg-primary rounded-full -left-[9px] top-1.5 border-4 border-surface-color"></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                        <p className="font-semibold text-text-color capitalize">
                          {activity.action.replace('_', ' ').toLowerCase()}
                        </p>
                        <span className="text-xs text-text-muted">
                          {new Date(activity.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted mt-1">
                        {activity.entityType === 'TASK' && parsedDetails.taskTitle ? `Task: ${parsedDetails.taskTitle}` : ''}
                        {activity.entityType === 'PROJECT' && parsedDetails.projectName ? `Project: ${parsedDetails.projectName}` : ''}
                        {activity.entityType === 'PROJECT' && parsedDetails.taskTitle ? `Task: ${parsedDetails.taskTitle}` : ''}
                        {activity.action === 'ADDED_COMMENT' && parsedDetails.commentSnippet ? `"${parsedDetails.commentSnippet}..."` : ''}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Settings;
