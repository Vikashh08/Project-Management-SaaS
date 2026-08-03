import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, login } = useAuth(); // login actually updates user context
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      avatarUrl: user?.avatarUrl || '',
    }
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/auth/profile', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update local storage and context with the new token & user data
      localStorage.setItem('userInfo', JSON.stringify(data));
      login(data); // Re-set user in context
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
    <div className="p-6 h-full overflow-y-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-color">Settings</h1>
        <p className="text-text-muted text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-surface-color rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
        <h2 className="text-lg font-bold text-text-color mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Profile Information</h2>
        
        <div className="flex items-center space-x-6 mb-8">
          <img src={avatarPreview || `https://i.pravatar.cc/150?u=${user?.id || 'default'}`} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-50 dark:border-gray-800 object-cover" />
          <div className="flex flex-col">
             <label className="text-sm font-medium mb-1">Avatar Image URL</label>
             <input 
               type="text" 
               {...register('avatarUrl')}
               onChange={(e) => setAvatarPreview(e.target.value)}
               className="w-full md:w-80 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
               placeholder="https://example.com/avatar.png"
             />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-text-color">Full Name</label>
              <input 
                type="text" 
                {...register('name', { required: 'Name is required' })} 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-text-color">Email Address</label>
              <input 
                type="email" 
                {...register('email', { required: 'Email is required' })} 
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-text-color">Role</label>
              <input type="text" defaultValue={user?.role} disabled className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg opacity-70 cursor-not-allowed capitalize" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
            <button 
              type="submit" 
              disabled={updateProfileMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
