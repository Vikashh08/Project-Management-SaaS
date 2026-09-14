import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { motion } from 'framer-motion';
import { Plus, Calendar as CalendarIcon, Target, Users, Play, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';

const SprintCard = ({ sprint, onUpdateStatus }) => {
  const isCompleted = sprint.status === 'COMPLETED';
  const isActive = sprint.status === 'ACTIVE';

  return (
    <div className={`bg-white dark:bg-gray-900 border rounded-2xl p-5 shadow-sm transition-all hover:shadow-md ${isActive ? 'border-primary shadow-primary/10' : 'border-gray-200 dark:border-gray-700/60'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{sprint.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
          </p>
        </div>
        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase tracking-wider ${
          isActive ? 'bg-primary/10 text-primary' : 
          isCompleted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {sprint.status}
        </span>
      </div>

      {sprint.goal && (
        <div className="mb-4 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
          <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
            <Target className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span className="leading-relaxed font-medium">{sprint.goal}</span>
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 font-medium">
           <div className="flex items-center gap-1.5" title="Total Tasks">
             <CheckCircle className="w-4 h-4" />
             <span>{sprint.tasks?.length || 0}</span>
           </div>
           {sprint.capacity && (
             <div className="flex items-center gap-1.5" title="Capacity (Hours)">
               <Clock className="w-4 h-4" />
               <span>{sprint.capacity}h</span>
             </div>
           )}
        </div>
        
        {isActive ? (
           <button 
             onClick={() => onUpdateStatus(sprint.id, 'COMPLETED')}
             className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
           >
             <CheckCircle className="w-4 h-4" /> Complete Sprint
           </button>
        ) : !isCompleted ? (
           <button 
             onClick={() => onUpdateStatus(sprint.id, 'ACTIVE')}
             className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
           >
             <Play className="w-4 h-4" /> Start Sprint
           </button>
        ) : null}
      </div>
    </div>
  );
};

const CreateSprintModal = ({ teamId, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ name: '', goal: '', capacity: '', startDate: '', endDate: '' });
  
  const createMutation = useMutation({
    mutationFn: async (data) => api.post(`/teams/${teamId}/sprints`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', teamId] });
      toast.success('Sprint created!');
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create sprint')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.startDate || !formData.endDate) {
      return toast.error('Name, Start Date, and End Date are required');
    }
    createMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Sprint</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sprint Name *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none" placeholder="e.g., Sprint 14" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sprint Goal</label>
            <textarea value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none resize-none h-20" placeholder="What is the main objective?"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity (Hours)</label>
            <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none" placeholder="e.g., 120" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm outline-none" />
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-colors disabled:opacity-70">{createMutation.isPending ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Sprints = () => {
  const queryClient = useQueryClient();
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Fetch teams for the user
  const { data: teams = [], isLoading: isLoadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get('/teams');
      return data;
    }
  });

  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  const { data: sprints = [], isLoading: isLoadingSprints } = useQuery({
    queryKey: ['sprints', selectedTeamId],
    queryFn: async () => {
      if (!selectedTeamId) return [];
      const { data } = await api.get(`/teams/${selectedTeamId}/sprints`);
      return data;
    },
    enabled: !!selectedTeamId
  });

  const statusMutation = useMutation({
    mutationFn: async ({ sprintId, status }) => api.put(`/teams/${selectedTeamId}/sprints/${sprintId}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', selectedTeamId] });
      toast.success('Sprint status updated');
    }
  });

  const handleUpdateStatus = (sprintId, status) => {
    statusMutation.mutate({ sprintId, status });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 lg:p-6 h-full flex flex-col"
    >
      {showModal && <CreateSprintModal teamId={selectedTeamId} onClose={() => setShowModal(false)} />}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-color tracking-tight">Sprints</h1>
          <p className="text-sm text-text-muted mt-1">Plan and manage your team's iterations.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {teams.length > 0 && (
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="flex-1 sm:flex-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-text-muted font-medium rounded-lg px-3 py-2 outline-none cursor-pointer"
            >
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          )}
          <button 
            onClick={() => {
              if(!selectedTeamId) return toast.error('Select a team first');
              setShowModal(true);
            }} 
            className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Create Sprint
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoadingTeams || isLoadingSprints ? (
          <Loader text="Loading sprints..." />
        ) : sprints.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No sprints found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Create a sprint to start planning your next development cycle.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sprints.map(sprint => (
              <SprintCard key={sprint.id} sprint={sprint} onUpdateStatus={handleUpdateStatus} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Sprints;
