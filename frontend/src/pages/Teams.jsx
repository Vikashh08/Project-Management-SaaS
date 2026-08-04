import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Users, Mail, Phone, MoreVertical, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PermissionGate from '../components/PermissionGate';

const Teams = () => {
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');

  const { data: members, isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data } = await api.get('/teams/organization');
      return data; // Array of OrganizationMember with included user
    }
  });

  const sendInviteMutation = useMutation({
    mutationFn: async (inviteData) => {
      return api.post('/invites', inviteData);
    },
    onSuccess: (data) => {
      toast.success(data.data.message || 'Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('VIEWER');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send invite');
    }
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!members || members.length === 0) {
      toast.error('Cannot determine organization ID');
      return;
    }
    const organizationId = members[0].organizationId;
    sendInviteMutation.mutate({
      email: inviteEmail,
      role: inviteRole,
      organizationId,
    });
  };

  if (isLoading) {
    return <div className="p-6 text-text-muted">Loading team members...</div>;
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Team Directory</h1>
          <p className="text-text-muted text-sm mt-1">Manage your organization's members</p>
        </div>
        <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN']}>
          <button 
            onClick={() => setShowInviteModal(true)} 
            className="saas-button flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Invite Member</span>
          </button>
        </PermissionGate>
      </div>

      {(!members || members.length === 0) && (
        <div className="text-text-muted text-sm mt-4">No team members found in your organization.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members?.map((member, i) => {
          const user = member.user;
          return (
            <div key={member.id} className="bg-surface-color p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center relative group">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5" />
              </button>
              <div className="relative inline-block mb-4">
                <img src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="w-20 h-20 rounded-full border-4 border-surface-color shadow-sm mx-auto" />
                <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-surface-color ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
              <h3 className="text-lg font-bold text-text-color">{user.name}</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">{member.role.replace('_', ' ')}</p>
              <p className="text-xs text-text-muted mb-4">{user.email}</p>
              
              <div className="flex justify-center space-x-2">
                <a href={`mailto:${user.email}`} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Mail className="w-4 h-4" />
                </a>
                <button className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-color w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border-color"
            >
              <div className="flex justify-between items-center p-6 border-b border-border-color">
                <h2 className="text-xl font-bold text-text-color">Invite New Member</h2>
                <button onClick={() => setShowInviteModal(false)} className="text-text-muted hover:text-text-color transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleInvite} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none"
                      placeholder="colleague@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-color mb-1">Role</label>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg focus:ring-2 focus:ring-primary outline-none"
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="DEVELOPER">Developer</option>
                      <option value="QA_TESTER">QA Tester</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="TEAM_LEAD">Team Lead</option>
                      <option value="ORG_ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setShowInviteModal(false)}
                    className="px-5 py-2 text-sm font-medium text-text-color hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={sendInviteMutation.isPending}
                    className="saas-button"
                  >
                    {sendInviteMutation.isPending ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teams;
