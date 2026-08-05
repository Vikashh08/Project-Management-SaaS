import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X, Calendar, Flag, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const CreateTaskModal = ({ isOpen, onClose, defaultProjectId }) => {
  const queryClient = useQueryClient();
  
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    startDate: '',
    dueDate: '',
    projectId: defaultProjectId || ''
  });

  useEffect(() => {
    if (isOpen) {
      setTaskData(prev => ({
        ...prev,
        projectId: defaultProjectId || ''
      }));
    }
  }, [isOpen, defaultProjectId]);

  const createMutation = useMutation({
    mutationFn: async (data) => api.post('/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.invalidateQueries(['project', defaultProjectId]);
      toast.success('Task created successfully');
      setTaskData({ title: '', description: '', priority: 'MEDIUM', startDate: '', dueDate: '', projectId: defaultProjectId || '' });
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) return toast.error('Title is required');
    createMutation.mutate(taskData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-[#131b2e] rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Task Title</label>
              <input 
                type="text" 
                required
                autoFocus
                value={taskData.title}
                onChange={(e) => setTaskData({...taskData, title: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-medium"
                placeholder="What needs to be done?"
              />
            </div>

            {/* Description (Rich Text) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <AlignLeft className="w-4 h-4" /> Description
              </label>
              <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                <ReactQuill 
                  theme="snow" 
                  value={taskData.description} 
                  onChange={(val) => setTaskData({...taskData, description: val})}
                  className="h-40"
                  placeholder="Add details, acceptance criteria..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 md:pt-4">
              
              {/* Priority */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Flag className="w-4 h-4" /> Priority
                </label>
                <select
                  value={taskData.priority}
                  onChange={(e) => setTaskData({...taskData, priority: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-medium appearance-none"
                >
                  <option value="LOW">Low (Meh)</option>
                  <option value="MEDIUM">Medium (OK)</option>
                  <option value="HIGH">High (Important)</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </label>
                  <input 
                    type="date"
                    value={taskData.startDate}
                    onChange={(e) => setTaskData({...taskData, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Due Date
                  </label>
                  <input 
                    type="date"
                    value={taskData.dueDate}
                    onChange={(e) => setTaskData({...taskData, dueDate: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-6">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={createMutation.isPending} 
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;
