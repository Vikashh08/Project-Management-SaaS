import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Users, Mail, Phone, MoreVertical, Plus, X, Search, UserPlus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PermissionGate from '../components/PermissionGate';
import Loader from '../components/Loader';

const InviteModal = ({ organizationId, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('DEVELOPER');
  const [sentTo, setSentTo] = useState(new Set()); // Track which user IDs have been invited

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data } = await api.get('/users/all');
      return data;
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: async ({ email }) => {
      return api.post('/invites', { email, role: selectedRole, organizationId });
    },
    onSuccess: (_, variables) => {
      setSentTo(prev => new Set([...prev, variables.userId]));
      toast.success(`Invite sent to ${variables.name}!`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send invite'),
  });

  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-color w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-border-color flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border-color shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-color">Invite Members</h2>
            <p className="text-sm text-text-muted mt-0.5">Select users to invite to your workspace</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Selector */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Invite As</label>
          <div className="flex flex-wrap gap-2">
            {['DEVELOPER', 'QA_TESTER', 'TEAM_LEAD', 'PROJECT_MANAGER', 'ORG_ADMIN'].map(role => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedRole === role
                    ? 'bg-primary text-white shadow-sm shadow-primary/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-text-muted hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {role.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 py-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* User List */}
        <div className="overflow-y-auto flex-1 px-6 pb-4">
          {isLoading ? (
            <div className="py-8 flex justify-center"><Loader /></div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-text-muted text-sm">No users found</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(user => {
                const invited = sentTo.has(user.id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm">{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-color text-sm truncate">{user.name}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>

                    {/* Invite Button */}
                    {invited ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        Sent
                      </div>
                    ) : (
                      <button
                        onClick={() => sendInviteMutation.mutate({ email: user.email, userId: user.id, name: user.name })}
                        disabled={sendInviteMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-semibold transition-all shrink-0 disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Invite
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-color shrink-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Teams = () => {
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: members, isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data } = await api.get('/teams/organization');
      return data;
    }
  });

  if (isLoading) {
    return <Loader text="Loading team members..." />;
  }

  const organizationId = members?.[0]?.organizationId;

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
            className="saas-button flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Invite Member
          </button>
        </PermissionGate>
      </div>

      {(!members || members.length === 0) && (
        <div className="text-text-muted text-sm mt-4">No team members found in your organization.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members?.map((member) => {
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
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">{member.role.replace(/_/g, ' ')}</p>
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

      <AnimatePresence>
        {showInviteModal && organizationId && (
          <InviteModal
            organizationId={organizationId}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teams;
