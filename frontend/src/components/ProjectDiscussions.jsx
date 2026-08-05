import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Send, Plus, CornerDownRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Loader from './Loader';

const ProjectDiscussions = ({ project }) => {
  const queryClient = useQueryClient();
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [replyContent, setReplyContent] = useState({});

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ['discussions', project.id],
    queryFn: async () => {
      const { data } = await api.get(`/discussions/project/${project.id}`);
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post(`/discussions/project/${project.id}`, data),
    onMutate: async (newPost) => {
      await queryClient.cancelQueries(['discussions', project.id]);
      const previous = queryClient.getQueryData(['discussions', project.id]);
      // Optimistically add the new discussion to the top of the list
      queryClient.setQueryData(['discussions', project.id], (old = []) => [
        { id: `temp-${Date.now()}`, ...newPost, replies: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), author: { name: 'You', avatarUrl: null } },
        ...old
      ]);
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions', project.id]);
      setNewPost({ title: '', content: '' });
      toast.success('Discussion posted');
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['discussions', project.id], context.previous);
      toast.error('Failed to post discussion');
    }
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, content }) => api.post(`/discussions/${id}/replies`, { content }),
    onMutate: async ({ id, content }) => {
      await queryClient.cancelQueries(['discussions', project.id]);
      const previous = queryClient.getQueryData(['discussions', project.id]);
      // Optimistically append the reply inside the correct discussion
      queryClient.setQueryData(['discussions', project.id], (old = []) =>
        old.map(disc =>
          disc.id === id
            ? { ...disc, replies: [...(disc.replies || []), { id: `temp-${Date.now()}`, content, createdAt: new Date().toISOString(), author: { name: 'You', avatarUrl: null } }] }
            : disc
        )
      );
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discussions', project.id]);
      setReplyContent({});
      toast.success('Reply added');
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['discussions', project.id], context.previous);
      toast.error('Failed to add reply');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/discussions/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries(['discussions', project.id]);
      const previous = queryClient.getQueryData(['discussions', project.id]);
      // Optimistically remove the discussion from the list
      queryClient.setQueryData(['discussions', project.id], (old = []) => old.filter(d => d.id !== id));
      return { previous };
    },
    onSuccess: () => {
      toast.success('Discussion deleted');
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['discussions', project.id], context.previous);
      toast.error('Failed to delete discussion');
    }
  });

  if (isLoading) return <Loader text="Loading discussions..." />;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* Create Post Box */}
      <div className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Start a Discussion
        </h3>
        <div className="space-y-3">
          <input 
            type="text" 
            placeholder="Topic Title..."
            value={newPost.title}
            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all font-semibold"
          />
          <textarea 
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={(e) => setNewPost({...newPost, content: e.target.value})}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all resize-none h-24 font-medium"
          />
          <div className="flex justify-end">
            <button 
              onClick={() => {
                if(!newPost.title || !newPost.content) return toast.error('Fill in all fields');
                createMutation.mutate(newPost);
              }}
              disabled={createMutation.isPending}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Post
            </button>
          </div>
        </div>
      </div>

      {/* Discussion Feed */}
      <div className="space-y-6">
        {discussions.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 font-medium">No discussions yet. Start one above!</p>
          </div>
        ) : (
          discussions.map(disc => (
            <div key={disc.id} className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-3xl p-5 shadow-sm group">
              
              {/* Main Post */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <img src={disc.author?.avatarUrl || `https://i.pravatar.cc/150?u=${disc.author?.id}`} alt="avatar" className="w-12 h-12 rounded-full ring-4 ring-gray-50 dark:ring-gray-800" />
                  <div>
                    <h4 className="text-lg font-extrabold text-gray-900 dark:text-white leading-snug">{disc.title}</h4>
                    <p className="text-sm font-semibold text-gray-500 mb-2">{disc.author?.name} · {new Date(disc.createdAt).toLocaleString()}</p>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{disc.content}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { if(window.confirm('Delete discussion?')) deleteMutation.mutate(disc.id); }}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Replies */}
              <div className="mt-6 ml-16 space-y-4">
                {disc.replies?.map(reply => (
                  <div key={reply.id} className="flex items-start gap-3 relative">
                    <CornerDownRight className="w-5 h-5 text-gray-300 dark:text-gray-700 absolute -left-7 -top-1" />
                    <img src={reply.author?.avatarUrl || `https://i.pravatar.cc/150?u=${reply.author?.id}`} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/40 rounded-2xl p-3 border border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">{reply.author?.name}</span>
                        <span className="text-[10px] font-semibold text-gray-500">{new Date(reply.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reply.content}</p>
                    </div>
                  </div>
                ))}

                {/* Reply Input */}
                <div className="flex items-start gap-3 mt-4">
                  <img src="https://i.pravatar.cc/150?u=me" alt="me" className="w-8 h-8 rounded-full opacity-50" />
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      placeholder="Write a reply..."
                      value={replyContent[disc.id] || ''}
                      onChange={(e) => setReplyContent({...replyContent, [disc.id]: e.target.value})}
                      onKeyDown={(e) => {
                        if(e.key === 'Enter' && replyContent[disc.id]?.trim()) {
                          replyMutation.mutate({ id: disc.id, content: replyContent[disc.id] });
                        }
                      }}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-full focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium pr-10"
                    />
                    <button 
                      onClick={() => {
                        if(replyContent[disc.id]?.trim()) {
                          replyMutation.mutate({ id: disc.id, content: replyContent[disc.id] });
                        }
                      }}
                      className="absolute right-2 top-1.5 p-1 text-primary hover:bg-primary/10 rounded-full transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectDiscussions;
