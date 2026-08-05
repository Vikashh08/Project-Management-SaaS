import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, Flag, AlignLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'text-blue-500' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-yellow-500' },
  { value: 'HIGH', label: 'High', color: 'text-orange-500' },
  { value: 'CRITICAL', label: 'Critical', color: 'text-red-500' },
];

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
    mutationFn: async (data) => {
      const { data: res } = await api.post('/tasks', data);
      return res;
    },
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries(['tasks']);
      const previousTasks = queryClient.getQueryData(['tasks']);
      // Optimistically add the new task to the list immediately
      queryClient.setQueryData(['tasks'], (old = []) => [
        { id: `temp-${Date.now()}`, ...newTask, status: 'TODO', assignees: [], createdAt: new Date().toISOString() },
        ...(Array.isArray(old) ? old : [])
      ]);
      return { previousTasks };
    },
    onSuccess: (savedTask) => {
      // Replace the optimistic temp entry with the real saved task
      queryClient.setQueryData(['tasks'], (old = []) =>
        Array.isArray(old)
          ? old.map(t => (t.id?.startsWith('temp-') ? savedTask : t))
          : old
      );
      queryClient.invalidateQueries(['tasks']);
      if (defaultProjectId) queryClient.invalidateQueries(['project', defaultProjectId]);
      toast.success('Task created successfully');
      setTaskData({ title: '', description: '', priority: 'MEDIUM', startDate: '', dueDate: '', projectId: defaultProjectId || '' });
      onClose();
    },
    onError: (err, _vars, context) => {
      // Roll back to the state before optimistic update
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.title.trim()) return toast.error('Title is required');
    createMutation.mutate(taskData);
  };

  const set = (field) => (e) => setTaskData(prev => ({ ...prev, [field]: e.target.value }));

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
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
              <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={taskData.title}
                  onChange={set('title')}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-medium placeholder:text-gray-400"
                  placeholder="What needs to be done?"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <AlignLeft className="w-4 h-4" /> Description
                </label>
                <textarea
                  rows={5}
                  value={taskData.description}
                  onChange={set('description')}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-medium placeholder:text-gray-400 resize-none"
                  placeholder="Add details, acceptance criteria, context..."
                />
              </div>

              {/* Priority + Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Priority */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Flag className="w-4 h-4" /> Priority
                  </label>
                  <select
                    value={taskData.priority}
                    onChange={set('priority')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-medium appearance-none"
                  >
                    {PRIORITIES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Start Date
                  </label>
                  <input
                    type="date"
                    value={taskData.startDate}
                    onChange={set('startDate')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-medium"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Due Date
                  </label>
                  <input
                    type="date"
                    value={taskData.dueDate}
                    onChange={set('dueDate')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-gray-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
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
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-60"
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
