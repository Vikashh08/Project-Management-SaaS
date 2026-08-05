import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Users, Shield, Plus, X, Building, Save } from 'lucide-react';
import Loader from './Loader';

const ProjectSettings = ({ project }) => {
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState(project.teamId || '');
  const [memberRole, setMemberRole] = useState('VIEWER');
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch all organization members
  const { data: orgMembers = [], isLoading: loadingMembers } = useQuery({
    queryKey: ['orgMembers', project.organizationId],
    queryFn: async () => {
      const { data } = await api.get(`/teams/organization?organizationId=${project.organizationId}`);
      return data;
    }
  });

  // Fetch all teams in the organization
  const { data: teams = [], isLoading: loadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await api.get('/teams');
      return data;
    }
  });

  // Mutations
  const addMemberMutation = useMutation({
    mutationFn: async (data) => api.post(`/projects/${project.id}/members`, data),
    onSuccess: () => {
      toast.success('Member added successfully');
      queryClient.invalidateQueries(['project', project.id]);
      setSelectedUserId('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (userId) => api.delete(`/projects/${project.id}/members/${userId}`),
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries(['project', project.id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  });

  const assignTeamMutation = useMutation({
    mutationFn: async (teamId) => api.put(`/projects/${project.id}/team`, { teamId }),
    onSuccess: () => {
      toast.success('Team assignment updated');
      queryClient.invalidateQueries(['project', project.id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to assign team');
    }
  });

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!selectedUserId) return toast.error('Please select a user');
    addMemberMutation.mutate({ userId: selectedUserId, role: memberRole });
  };

  const handleAssignTeam = () => {
    assignTeamMutation.mutate(selectedTeam);
  };

  if (loadingMembers || loadingTeams) return <Loader />;

  // Filter out users who are already project members
  const existingMemberIds = project.members?.map(m => m.userId) || [];
  const availableUsers = orgMembers.filter(m => !existingMemberIds.includes(m.userId));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Team Assignment Section */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assign a Team</h3>
            <p className="text-sm text-gray-500">Bind an entire team to this project so they all inherit access.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <select 
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-gray-900 dark:text-white font-medium"
          >
            <option value="">No Team Assigned</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <button 
            onClick={handleAssignTeam}
            disabled={assignTeamMutation.isPending || selectedTeam === project.teamId}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {assignTeamMutation.isPending ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>

      {/* Direct Members Section */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Project Members</h3>
            <p className="text-sm text-gray-500">Directly assign organization members to this project.</p>
          </div>
        </div>

        {/* Add Member Form */}
        <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-4 mb-8 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          <div className="flex-1">
            <select 
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-gray-900 dark:text-white font-medium"
              required
            >
              <option value="" disabled>Select User from Organization...</option>
              {availableUsers.map(m => (
                <option key={m.userId} value={m.userId}>{m.user.name} ({m.user.email})</option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select 
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-gray-900 dark:text-white font-medium"
            >
              <option value="VIEWER">Viewer</option>
              <option value="DEVELOPER">Developer</option>
              <option value="PROJECT_MANAGER">Manager</option>
              <option value="ORG_ADMIN">Admin</option>
            </select>
          </div>
          <button 
            type="submit"
            disabled={addMemberMutation.isPending || availableUsers.length === 0}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </form>

        {/* Member List */}
        <div className="space-y-3">
          {project.members?.map((pm) => (
            <div key={pm.userId} className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800 rounded-xl group hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 overflow-hidden shadow-sm">
                  {pm.user.avatarUrl ? (
                    <img src={pm.user.avatarUrl} alt={pm.user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full text-xs font-bold text-gray-500 dark:text-gray-400">
                      {pm.user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{pm.user.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">{pm.role.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
              
              {pm.userId !== project.ownerId && (
                <button 
                  onClick={() => removeMemberMutation.mutate(pm.userId)}
                  disabled={removeMemberMutation.isPending}
                  className="p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Remove from project"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {(!project.members || project.members.length === 0) && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm font-medium">
              No members assigned directly to this project.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectSettings;
