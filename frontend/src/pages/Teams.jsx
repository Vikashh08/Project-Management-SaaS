import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Users, Mail, MoreVertical, Plus, X, Search, UserPlus, Check, Shield, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PermissionGate from '../components/PermissionGate';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

// ─── Role Badge ──────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    ORG_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    PROJECT_MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    TEAM_LEAD: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    DEVELOPER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    QA_TESTER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    VIEWER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[role] || styles.VIEWER}`}>
      {role?.replace(/_/g, ' ')}
    </span>
  );
};

// ─── Member Card ─────────────────────────────────────────────────────────────
const MemberCard = ({ member, currentUserId, onRoleChange, onRemove }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const user = member.user;
  const isMe = user.id === currentUserId;
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roles = ['DEVELOPER', 'QA_TESTER', 'TEAM_LEAD', 'PROJECT_MANAGER', 'ORG_ADMIN'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="saas-card p-5 flex flex-col items-center text-center relative group"
    >
      {/* Three-dot menu */}
      {!isMe && (
        <div className="absolute top-4 right-4" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-8 z-50 w-52 bg-surface-color border border-border-color rounded-xl shadow-2xl py-1.5"
              >
                <p className="px-4 py-1.5 text-[10px] uppercase tracking-widest text-text-muted font-bold">Change Role</p>
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => { onRoleChange(member.id, r); setMenuOpen(false); }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      member.role === r ? 'text-primary font-semibold' : 'text-text-color'
                    }`}
                  >
                    {member.role === r && <Check className="w-3.5 h-3.5 shrink-0" />}
                    <span className={member.role !== r ? 'ml-5' : ''}>{r.replace(/_/g, ' ')}</span>
                  </button>
                ))}
                <div className="border-t border-border-color my-1" />
                <button
                  onClick={() => { onRemove(member); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Member
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Avatar */}
      <div className="relative mb-4">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full border-4 border-surface-color shadow-md object-cover"
          />
        ) : (
          <div className="w-20 h-20 rounded-full border-4 border-surface-color shadow-md bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {initials}
          </div>
        )}
        {/* Online indicator — green for all active members */}
        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full border-2 border-surface-color bg-green-500" />
      </div>

      {/* Info */}
      <h3 className="text-base font-bold text-text-color mb-1">{user.name}</h3>
      <div className="mb-1"><RoleBadge role={member.role} /></div>
      <p className="text-xs text-text-muted mb-1 truncate w-full">{user.email}</p>
      {isMe && <span className="text-[10px] font-semibold text-primary">You</span>}

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border-color w-full justify-center">
        <a
          href={`mailto:${user.email}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-text-muted hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </a>
      </div>
    </motion.div>
  );
};

// ─── Invite Modal ─────────────────────────────────────────────────────────────
const InviteModal = ({ organizationId, currentMemberEmails, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('DEVELOPER');
  const [sentTo, setSentTo] = useState(new Set());

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const { data } = await api.get('/users/all');
      return data;
    },
  });

  const sendInviteMutation = useMutation({
    mutationFn: async ({ email }) =>
      api.post('/invites', { email, role: selectedRole, organizationId }),
    onSuccess: (_, variables) => {
      setSentTo(prev => new Set([...prev, variables.userId]));
      toast.success(`Invite sent to ${variables.name}!`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send invite'),
  });

  // Filter out users already in the org
  const filtered = allUsers
    .filter(u => !currentMemberEmails.has(u.email))
    .filter(u =>
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
        <div className="flex justify-between items-center p-6 border-b border-border-color shrink-0">
          <div>
            <h2 className="text-xl font-bold text-text-color">Invite Members</h2>
            <p className="text-sm text-text-muted mt-0.5">Select users to invite to your workspace</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

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

        <div className="overflow-y-auto flex-1 px-6 pb-4">
          {isLoading ? (
            <div className="py-8 flex justify-center"><Loader /></div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-text-muted text-sm">
              {allUsers.length === 0 ? 'No other users in the system yet.' : 'No users match your search or everyone is already a member.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(user => {
                const invited = sentTo.has(user.id);
                return (
                  <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                      {user.avatarUrl
                        ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        : <span className="text-sm">{user.name.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text-color text-sm truncate">{user.name}</p>
                      <p className="text-xs text-text-muted truncate">{user.email}</p>
                    </div>
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

        <div className="px-6 py-4 border-t border-border-color shrink-0">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Teams = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [search, setSearch] = useState('');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: async () => {
      const { data } = await api.get('/teams/organization');
      return data;
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }) =>
      api.put(`/teams/members/${memberId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      toast.success('Role updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update role'),
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId) =>
      api.delete(`/teams/members/${memberId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamMembers']);
      toast.success('Member removed');
      setRemoveTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove member'),
  });

  if (isLoading) return <Loader text="Loading team members..." />;

  const organizationId = members[0]?.organizationId;
  const currentMemberEmails = new Set(members.map(m => m.user?.email));

  const filtered = members.filter(m =>
    m.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    m.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Team Directory</h1>
          <p className="text-text-muted text-sm mt-1">
            {members.length} {members.length === 1 ? 'member' : 'members'} in your organization
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-9 pr-4 py-2 bg-surface-color border border-border-color rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN']}>
            <button
              onClick={() => setShowInviteModal(true)}
              className="saas-button flex items-center gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Invite
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Member Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          {search ? 'No members match your search.' : 'No team members found in your organization.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(member => (
            <PermissionGate
              key={member.id}
              allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN']}
              fallback={
                <MemberCard
                  member={member}
                  currentUserId={currentUser?.id}
                  onRoleChange={() => {}}
                  onRemove={() => {}}
                />
              }
            >
              <MemberCard
                member={member}
                currentUserId={currentUser?.id}
                onRoleChange={(memberId, role) => updateRoleMutation.mutate({ memberId, role })}
                onRemove={(m) => setRemoveTarget(m)}
              />
            </PermissionGate>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && organizationId && (
          <InviteModal
            organizationId={organizationId}
            currentMemberEmails={currentMemberEmails}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Remove Confirmation */}
      <AnimatePresence>
        {removeTarget && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-color p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-border-color"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Remove {removeTarget.user?.name}?</h3>
              <p className="text-text-muted text-sm mb-6">They will lose access to all projects in this organization.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setRemoveTarget(null)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => removeMemberMutation.mutate(removeTarget.id)}
                  disabled={removeMemberMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {removeMemberMutation.isPending ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teams;
