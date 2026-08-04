import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { Plus, Calendar, CheckCircle2, CircleDashed, Rocket, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SprintModal = ({ teamId, sprint, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: sprint?.name || '',
    startDate: sprint?.startDate ? new Date(sprint.startDate).toISOString().slice(0, 10) : '',
    endDate: sprint?.endDate ? new Date(sprint.endDate).toISOString().slice(0, 10) : '',
    status: sprint?.status || 'PLANNED'
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (sprint) return api.put(`/teams/${teamId}/sprints/${sprint.id}`, data);
      return api.post(`/teams/${teamId}/sprints`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamSprints', teamId]);
      toast.success(sprint ? 'Sprint updated' : 'Sprint created');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Error saving sprint')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-color p-6 rounded-2xl w-full max-w-md shadow-2xl border border-border-color"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">{sprint ? 'Edit Sprint' : 'Create Sprint'}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Sprint Name</label>
            <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" placeholder="e.g. Sprint 14" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Start Date</label>
              <input type="date" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">End Date</label>
              <input type="date" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none" />
            </div>
          </div>
          {sprint && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none">
                <option value="PLANNED">Planned</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors">{mutation.isPending ? 'Saving...' : 'Save Sprint'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const SprintCard = ({ sprint, onEdit, teamId }) => {
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async () => api.delete(`/teams/${teamId}/sprints/${sprint.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamSprints', teamId]);
      toast.success('Sprint deleted');
    }
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'COMPLETED': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'ACTIVE': return <Rocket className="w-4 h-4" />;
      case 'COMPLETED': return <CheckCircle2 className="w-4 h-4" />;
      default: return <CircleDashed className="w-4 h-4" />;
    }
  };

  const completedTasks = sprint.tasks?.filter(t => t.status === 'DONE').length || 0;
  const totalTasks = sprint.tasks?.length || 0;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="saas-card p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-text-color">{sprint.name}</h3>
          <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> 
            {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(sprint.status)}`}>
            {getStatusIcon(sprint.status)}
            {sprint.status}
          </span>
          <button onClick={() => deleteMutation.mutate()} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="mb-2 flex justify-between text-xs font-medium text-text-muted">
        <span>Progress</span>
        <span>{progress}% ({completedTasks}/{totalTasks})</span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-4">
        <div className="bg-primary h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex -space-x-2">
          {/* Simple Assignee visualizer based on tasks */}
          {Array.from(new Set(sprint.tasks?.flatMap(t => t.assignees.map(a => a.user.avatarUrl || a.user.name)))).slice(0,3).map((u, i) => (
             <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border border-white dark:border-gray-800 flex items-center justify-center text-[10px] overflow-hidden">
                {u.startsWith('http') ? <img src={u} alt="user" className="w-full h-full object-cover"/> : u.charAt(0)}
             </div>
          ))}
          {sprint.tasks?.some(t => t.assignees?.length > 3) && (
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 border border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-medium text-gray-500">
              +
            </div>
          )}
        </div>
        <button onClick={() => onEdit(sprint)} className="text-sm text-primary hover:underline font-medium">Edit Sprint</button>
      </div>
    </div>
  );
};

const TeamSprints = ({ teamId }) => {
  const [showModal, setShowModal] = useState(false);
  const [editSprint, setEditSprint] = useState(null);

  const { data: sprints = [], isLoading } = useQuery({
    queryKey: ['teamSprints', teamId],
    queryFn: async () => {
      const { data } = await api.get(`/teams/${teamId}/sprints`);
      return data;
    }
  });

  if (isLoading) return <div className="text-center py-10">Loading sprints...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-text-color">Team Sprints</h2>
          <p className="text-sm text-text-muted">Organize and track your team's work cycles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="saas-button bg-primary text-white hover:bg-primary-hover flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Sprint
        </button>
      </div>

      {sprints.length === 0 ? (
        <div className="text-center py-16 saas-card">
          <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-text-muted mb-4">No sprints planned yet.</p>
          <button onClick={() => setShowModal(true)} className="saas-button bg-surface-color border border-border-color">Create First Sprint</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sprints.map(sprint => (
            <SprintCard key={sprint.id} sprint={sprint} teamId={teamId} onEdit={setEditSprint} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && <SprintModal teamId={teamId} onClose={() => setShowModal(false)} />}
        {editSprint && <SprintModal teamId={teamId} sprint={editSprint} onClose={() => setEditSprint(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default TeamSprints;
