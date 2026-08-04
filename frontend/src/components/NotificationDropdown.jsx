import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
    // Polling every 60s as a fallback to sockets
    refetchInterval: 60000 
  });

  // Fetch pending invites
  const { data: pendingInvites = [] } = useQuery({
    queryKey: ['pendingInvites'],
    queryFn: async () => {
      const { data } = await api.get('/invites/pending');
      return data;
    },
    refetchInterval: 60000 
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const acceptInviteMutation = useMutation({
    mutationFn: async (token) => api.post(`/invites/accept/${token}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingInvites']);
      // Optional: invalidate teams/organizations if needed, or simply reload
      window.location.reload(); 
    }
  });

  const declineInviteMutation = useMutation({
    mutationFn: async (token) => api.post(`/invites/decline/${token}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['pendingInvites']);
    }
  });

  const unreadCount = notifications.filter(n => !n.isRead).length + pendingInvites.length;

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

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    markAsReadMutation.mutate(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-muted hover:text-text-color hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface-color"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-surface-color border border-border-color rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border-color flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-bold text-text-color">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 && pendingInvites.length === 0 ? (
                <div className="p-6 text-center text-text-muted">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No notifications yet.</p>
                </div>
              ) : (
                <>
                  {pendingInvites.map((invite) => (
                    <div 
                      key={invite.token}
                      className="p-4 border-b border-border-color last:border-0 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex gap-3"
                    >
                      <div className="mt-1">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shadow-[0_0_5px_rgba(99,102,241,0.5)]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-text-color">
                          Workspace Invitation
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          <strong>{invite.inviter?.name}</strong> invited you to join <strong>{invite.organization?.name}</strong>.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              acceptInviteMutation.mutate(invite.token);
                            }}
                            disabled={acceptInviteMutation.isPending}
                            className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              declineInviteMutation.mutate(invite.token);
                            }}
                            disabled={declineInviteMutation.isPending}
                            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-text-color text-xs font-medium rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 border-b border-border-color last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex gap-3 ${!notif.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                  >
                    <div className="mt-1">
                      {!notif.isRead ? (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                      ) : (
                        <Check className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${!notif.isRead ? 'font-medium text-text-color' : 'text-text-muted'}`}>
                        {notif.content}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(e, notif.id)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 self-start mt-0.5"
                      >
                        Read
                      </button>
                    )}
                  </div>
                ))}
                </>
              )}
            </div>
            
            <div className="p-3 border-t border-border-color text-center bg-gray-50 dark:bg-gray-900/50">
              <a href="/settings" className="text-xs text-text-muted hover:text-text-color font-medium">View all activity</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
