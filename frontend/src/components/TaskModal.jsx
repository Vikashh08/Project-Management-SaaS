import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useSocket } from '../context/SocketContext';
import { X, MessageSquare, CheckSquare, Clock, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import PermissionGate from './PermissionGate';

const TaskModal = ({ isOpen, onClose, taskId }) => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descContent, setDescContent] = useState('');

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${taskId}`);
      setDescContent(data.description || '');
      return data;
    },
    enabled: !!taskId && isOpen
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (updates) => {
      return api.put(`/tasks/${taskId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['task', taskId]);
      queryClient.invalidateQueries(['tasks']);
      setIsEditingDesc(false);
      toast.success('Task updated');
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content) => {
      return api.post(`/tasks/${taskId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['task', taskId]);
      setCommentText('');
    }
  });

  const addSubtaskMutation = useMutation({
    mutationFn: async (title) => {
      return api.post(`/tasks/${taskId}/subtasks`, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['task', taskId]);
      setNewSubtaskTitle('');
    }
  });

  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, isCompleted }) => {
      return api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['task', taskId]);
    }
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async (formData) => {
      return api.post(`/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['task', taskId]);
      toast.success('File attached');
    },
    onError: (err) => {
      toast.error('Upload failed: ' + err.message);
    }
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: async (attachmentId) => {
      return api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['task', taskId]);
      toast.success('Attachment removed');
    }
  });

  const { socket } = useSocket();

  useEffect(() => {
    if (socket && taskId && isOpen) {
      const handleTaskUpdate = (data) => {
        if (data && data.id === taskId) {
          queryClient.invalidateQueries(['task', taskId]);
        } else if (!data) {
          // If no data id is passed, just invalidate anyway to be safe
          queryClient.invalidateQueries(['task', taskId]);
        }
      };

      socket.on('TASK_UPDATED', handleTaskUpdate);
      socket.on('TASK_DELETED', handleTaskUpdate);

      return () => {
        socket.off('TASK_UPDATED', handleTaskUpdate);
        socket.off('TASK_DELETED', handleTaskUpdate);
      };
    }
  }, [socket, taskId, isOpen, queryClient]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-surface-color rounded-2xl shadow-2xl flex flex-col border border-border-color overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-border-color">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-text-color">{task?.title || 'Loading...'}</h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-text-muted">
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-medium">{task?.status.replace('_', ' ')}</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-medium">{task?.priority} Priority</span>
                {task?.dueDate && (
                  <span className="flex items-center text-orange-600 dark:text-orange-400">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center text-text-muted py-10">Loading task details...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* Description */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-text-color">Description</h3>
                      {!isEditingDesc && (
                        <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'QA_TESTER']}>
                          <button onClick={() => setIsEditingDesc(true)} className="text-sm text-blue-600 hover:underline">Edit</button>
                        </PermissionGate>
                      )}
                    </div>
                    {isEditingDesc ? (
                      <div className="space-y-3">
                        <div className="bg-white dark:bg-gray-900 rounded-lg text-black dark:text-white">
                          <ReactQuill 
                            theme="snow" 
                            value={descContent} 
                            onChange={setDescContent}
                            className="h-48 mb-12"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => updateTaskMutation.mutate({ description: descContent })}
                            disabled={updateTaskMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => {
                              setDescContent(task?.description || '');
                              setIsEditingDesc(false);
                            }}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-text-color rounded-lg text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="prose dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl text-sm"
                        dangerouslySetInnerHTML={{ __html: task?.description || '<p class="text-gray-500 italic">No description provided.</p>' }}
                      />
                    )}
                  </section>

                  {/* Subtasks */}
                  <section>
                    <h3 className="text-lg font-semibold text-text-color mb-3 flex items-center">
                      <CheckSquare className="w-5 h-5 mr-2" /> Subtasks
                    </h3>
                    <div className="space-y-2 mb-4">
                      {task?.subtasks?.map(subtask => (
                        <div key={subtask.id} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group">
                          <input 
                            type="checkbox"
                            checked={subtask.isCompleted}
                            onChange={(e) => toggleSubtaskMutation.mutate({ subtaskId: subtask.id, isCompleted: e.target.checked })}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className={`ml-3 text-sm ${subtask.isCompleted ? 'line-through text-text-muted' : 'text-text-color'}`}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                    <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'QA_TESTER']}>
                      <form onSubmit={(e) => { e.preventDefault(); addSubtaskMutation.mutate(newSubtaskTitle); }} className="flex space-x-2">
                        <input 
                          type="text" 
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="Add a subtask..."
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button type="submit" disabled={!newSubtaskTitle.trim() || addSubtaskMutation.isPending} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-text-color rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700">
                          Add
                        </button>
                      </form>
                    </PermissionGate>
                  </section>

                  {/* Comments */}
                  <section>
                    <h3 className="text-lg font-semibold text-text-color mb-4 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" /> Comments
                    </h3>
                    <div className="space-y-4 mb-6">
                      {task?.comments?.map(comment => (
                        <div key={comment.id} className="flex space-x-3">
                          <img src={comment.author.avatarUrl || `https://i.pravatar.cc/150?u=${comment.author.id}`} alt="avatar" className="w-8 h-8 rounded-full" />
                          <div className="flex-1 bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl rounded-tl-none">
                            <div className="flex justify-between items-baseline mb-1">
                              <span className="font-semibold text-sm">{comment.author.name}</span>
                              <span className="text-xs text-text-muted">{new Date(comment.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-text-color">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'QA_TESTER']}>
                      <form onSubmit={(e) => { e.preventDefault(); addCommentMutation.mutate(newComment); }} className="mt-4 flex space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                          {/* We don't have current user readily available here without context, so just a placeholder icon or letter */}
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <textarea 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-20"
                          />
                          <div className="mt-2 flex justify-end">
                            <button type="submit" disabled={!newComment.trim() || addCommentMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                              Comment
                            </button>
                          </div>
                        </div>
                      </form>
                    </PermissionGate>
                  </section>

                  {/* Attachments */}
                  <section>
                    <h3 className="text-lg font-semibold text-text-color mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                      Attachments
                    </h3>
                    
                    <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'QA_TESTER']}>
                      <div className="mb-4">
                        <label className="flex justify-center w-full h-24 px-4 transition bg-transparent border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-gray-400 focus:outline-none hover:bg-gray-50 dark:hover:bg-gray-800">
                          <span className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="font-medium text-gray-500">
                              {uploadAttachmentMutation.isPending ? 'Uploading...' : 'Drop files to Attach, or browse'}
                            </span>
                          </span>
                          <input type="file" name="file" className="hidden" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const formData = new FormData();
                              formData.append('file', e.target.files[0]);
                              formData.append('taskId', taskId);
                              uploadAttachmentMutation.mutate(formData);
                            }
                          }} disabled={uploadAttachmentMutation.isPending} />
                        </label>
                      </div>
                    </PermissionGate>

                    {/* Gallery */}
                    {task?.attachments?.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {task.attachments.map(att => (
                          <div key={att.id} className="relative group bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-border-color flex flex-col items-center text-center">
                            {att.type.startsWith('image/') ? (
                              <img src={att.url.startsWith('http') ? att.url : `http://localhost:5001${att.url}`} alt={att.filename} className="w-full h-24 object-cover rounded-md mb-2" />
                            ) : (
                              <div className="w-full h-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center mb-2">
                                <span className="text-gray-500 text-xs font-medium uppercase">{att.filename.split('.').pop()}</span>
                              </div>
                            )}
                            <a href={att.url.startsWith('http') ? att.url : `http://localhost:5001${att.url}`} target="_blank" rel="noopener noreferrer" className="text-xs truncate w-full hover:text-blue-500" title={att.filename}>
                              {att.filename}
                            </a>
                            <span className="text-[10px] text-text-muted">{(att.size / 1024).toFixed(1)} KB</span>
                            <button 
                              onClick={() => deleteAttachmentMutation.mutate(att.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Attachment"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                {/* Right Column (Sidebar details) */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-border-color">
                    <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Details</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-xs text-text-muted block mb-1">Assignee</span>
                        <div className="flex items-center space-x-2">
                          {task?.assignees?.length > 0 ? (
                            task.assignees.map(a => (
                              <div key={a.id} className="flex items-center bg-white dark:bg-gray-700 px-2 py-1 rounded shadow-sm">
                                <img src={a.user.avatarUrl || `https://i.pravatar.cc/150?u=${a.user.id}`} alt="avatar" className="w-5 h-5 rounded-full mr-2" />
                                <span className="text-sm font-medium">{a.user.name}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-sm text-text-muted">Unassigned</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-text-muted block mb-1">Reporter</span>
                        <div className="flex items-center space-x-2">
                          <img src={task?.reporter?.avatarUrl || `https://i.pravatar.cc/150?u=${task?.reporter?.id}`} alt="avatar" className="w-5 h-5 rounded-full" />
                          <span className="text-sm font-medium">{task?.reporter?.name}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-text-muted block mb-1">Created</span>
                        <span className="text-sm">{new Date(task?.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div>
                        <span className="text-xs text-text-muted block mb-1">Updated</span>
                        <span className="text-sm">{new Date(task?.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TaskModal;
