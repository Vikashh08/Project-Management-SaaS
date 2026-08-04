import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { Send } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const TeamChat = ({ teamId }) => {
  const { user } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);
  
  const [newMessage, setNewMessage] = useState('');

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['teamMessages', teamId],
    queryFn: async () => {
      const { data } = await api.get(`/teams/${teamId}/messages`);
      return data;
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      const { data } = await api.post(`/teams/${teamId}/messages`, { content });
      return data;
    },
    onSuccess: () => {
      setNewMessage('');
    }
  });

  useEffect(() => {
    if (socket && teamId) {
      socket.emit('join_team', teamId);

      const handleNewMessage = (message) => {
        queryClient.setQueryData(['teamMessages', teamId], (oldData) => {
          if (!oldData) return [message];
          if (oldData.find(m => m.id === message.id)) return oldData;
          return [...oldData, message];
        });
      };

      socket.on('NEW_TEAM_MESSAGE', handleNewMessage);
      return () => {
        socket.off('NEW_TEAM_MESSAGE', handleNewMessage);
      };
    }
  }, [socket, teamId, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  if (isLoading) return <div className="text-center py-10">Loading chat...</div>;

  return (
    <div className="flex flex-col h-[600px] saas-card overflow-hidden">
      <div className="p-4 border-b border-border-color bg-gray-50/50 dark:bg-gray-800/50">
        <h2 className="text-lg font-bold text-text-color">Team Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-text-muted mt-10">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user.id;
            const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar ? (
                    <img
                      src={msg.sender?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || 'User')}&background=random`}
                      alt={msg.sender?.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : <div className="w-8 h-8" />}
                </div>
                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {showAvatar && (
                    <span className="text-xs text-text-muted mb-1 ml-1 mr-1">
                      {isMe ? 'You' : msg.sender?.name}
                    </span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl ${
                    isMe
                      ? 'bg-primary text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-text-color border border-border-color rounded-tl-sm'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 mx-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface-color border-t border-border-color">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="w-11 h-11 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeamChat;
