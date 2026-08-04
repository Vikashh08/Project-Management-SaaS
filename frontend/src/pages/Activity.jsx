import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { motion } from 'framer-motion';
import Loader from '../components/Loader';
import {
  Clock,
  Bell,
  CheckCircle,
  FolderPlus,
  UserPlus,
  MessageSquare,
  AlertTriangle,
  CheckCheck,
  Trash2
} from 'lucide-react';

const typeIcons = {
  TASK_ASSIGNED: { icon: UserPlus, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
  NEW_COMMENT: { icon: MessageSquare, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' },
  TEAM_ADDED: { icon: UserPlus, color: 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400' },
  TASK_COMPLETED: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
  PROJECT_CREATED: { icon: FolderPlus, color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400' },
  DEFAULT: { icon: Bell, color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

const getIcon = (type) => typeIcons[type] || typeIcons.DEFAULT;

const formatTimeAgo = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
};

const Activity = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['allNotifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    }
  });

  const { data: activities = [], isLoading: isLoadingActivity } = useQuery({
    queryKey: ['allActivity'],
    queryFn: async () => {
      const { data } = await api.get('/users/activity');
      return data;
    }
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries(['allNotifications', 'notifications'])
  });

  const clearMutation = useMutation({
    mutationFn: () => api.delete('/notifications/clear'),
    onSuccess: () => queryClient.invalidateQueries(['allNotifications', 'notifications'])
  });

  const markOneMutation = useMutation({
    mutationFn: (id) => api.put(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries(['allNotifications', 'notifications'])
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading || isLoadingActivity) return <Loader text="Loading activity..." />;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Activity & Notifications</h1>
          <p className="text-text-muted text-sm mt-1">Stay up to date with everything happening in your workspace.</p>
        </div>

        {/* Notifications Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="saas-card overflow-hidden">
          <div className="p-5 border-b border-border-color flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-text-color">Notifications</h2>
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2.5 py-1 rounded-full font-semibold">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              {notifications.some(n => n.isRead) && (
                <button
                  onClick={() => clearMutation.mutate()}
                  disabled={clearMutation.isPending}
                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear read
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-border-color">
            {notifications.length === 0 ? (
              <div className="p-10 text-center text-text-muted">
                <Bell className="w-10 h-10 mx-auto mb-3 opacity-15" />
                <p className="font-medium">No notifications</p>
                <p className="text-xs mt-1 text-gray-400">When something happens, you'll see it here.</p>
              </div>
            ) : (
              notifications.map(notif => {
                const { icon: Icon, color } = getIcon(notif.type);
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      !notif.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold text-text-color' : 'text-text-muted'}`}>
                        {notif.content}
                      </p>
                      <span className="text-xs text-gray-400 mt-1 block">{formatTimeAgo(notif.createdAt)}</span>
                    </div>
                    {!notif.isRead && (
                      <button
                        onClick={() => markOneMutation.mutate(notif.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0 mt-1"
                      >
                        Mark read
                      </button>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="saas-card overflow-hidden">
          <div className="p-5 border-b border-border-color">
            <h2 className="text-lg font-bold text-text-color">Activity Timeline</h2>
          </div>
          <div className="p-5">
            {activities.length === 0 ? (
              <div className="text-center text-text-muted py-10">
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-15" />
                <p className="font-medium">No activity yet</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border-color"></div>
                <div className="space-y-6">
                  {activities.map((activity, index) => {
                    let parsedDetails = {};
                    try { if (activity.details) parsedDetails = JSON.parse(activity.details); } catch (e) {}

                    return (
                      <div key={activity.id} className="flex items-start gap-4 pl-2">
                        <div className="w-5 h-5 rounded-full bg-primary/20 border-2 border-primary flex-shrink-0 mt-0.5 z-10"></div>
                        <div className="flex-1">
                          <p className="text-sm text-text-color font-medium capitalize">
                            {activity.action.replace(/_/g, ' ').toLowerCase()}
                          </p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {activity.entityType === 'TASK' && parsedDetails.taskTitle && `Task: ${parsedDetails.taskTitle}`}
                            {activity.entityType === 'PROJECT' && parsedDetails.projectName && `Project: ${parsedDetails.projectName}`}
                            {parsedDetails.commentSnippet && `"${parsedDetails.commentSnippet}"`}
                          </p>
                          <span className="text-xs text-gray-400 mt-1 block">{formatTimeAgo(activity.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Activity;
