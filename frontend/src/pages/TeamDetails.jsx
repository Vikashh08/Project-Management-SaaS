import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, CheckCircle2, Clock, TrendingUp, Settings, UserPlus,
  Trash2, X, Search, UserCheck, Star, Mail, Activity, Shield, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import PermissionGate from '../components/PermissionGate';
import { ProjectCard, ProjectModal } from '../components/ProjectComponents';
import TeamChat from '../components/team/TeamChat';
import TeamFiles from '../components/team/TeamFiles';
import TeamSprints from '../components/team/TeamSprints';

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="saas-card p-5">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-2xl font-bold text-text-color">{value}</p>
    <p className="text-sm text-text-muted mt-0.5">{label}</p>
  </div>
);

// ── Member Card ────────────────────────────────────────────────────────────
const MemberCard = ({ member, teamColor, onRemove, currentUserId }) => {
  const user = member.user;
  const isMe = user.id === currentUserId;
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  const roleColors = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    ORG_ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    PROJECT_MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    TEAM_LEAD: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    DEVELOPER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    QA_TESTER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    VIEWER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <div className="saas-card p-4 flex items-center gap-4 group">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 overflow-hidden"
        style={{ backgroundColor: teamColor || '#6366f1' }}>
        {user.avatarUrl
          ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          : initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-text-color text-sm">{user.name}</p>
          {isMe && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">You</span>}
        </div>
        <p className="text-xs text-text-muted">{user.email}</p>
        {member.designation && <p className="text-xs text-text-muted italic">{member.designation}</p>}
        {member.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {member.skills.slice(0, 3).map(s => (
              <span key={s} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-text-muted rounded-full">{s}</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColors[member.role] || roleColors.VIEWER}`}>
          {member.role?.replace(/_/g, ' ')}
        </span>
        {!isMe && (
          <button
            onClick={() => onRemove(member)}
            className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ── Add Member Modal ───────────────────────────────────────────────────────
const AddMemberModal = ({ teamId, existingUserIds, onClose, onSuccess }) => {
  const [search, setSearch] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => { const { data } = await api.get('/users/all'); return data; }
  });

  const addMutation = useMutation({
    mutationFn: ({ userId }) => api.post(`/teams/${teamId}/members`, { userId, role: 'DEVELOPER' }),
    onSuccess: (_, { userId, name }) => {
      setAddedIds(prev => new Set([...prev, userId]));
      toast.success(`${name} added to team!`);
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add member'),
  });

  const available = allUsers
    .filter(u => !existingUserIds.has(u.id))
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-color w-full max-w-lg rounded-2xl shadow-2xl border border-border-color flex flex-col max-h-[80vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-border-color">
          <h2 className="text-xl font-bold">Add Team Member</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 border-b border-border-color">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-2">
          {available.length === 0
            ? <p className="text-center py-8 text-text-muted text-sm">No users available</p>
            : available.map(user => {
              const added = addedIds.has(user.id);
              return (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 overflow-hidden">
                    {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-color">{user.name}</p>
                    <p className="text-xs text-text-muted">{user.email}</p>
                  </div>
                  {added
                    ? <span className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <UserCheck className="w-3.5 h-3.5" /> Added
                      </span>
                    : <button
                        onClick={() => addMutation.mutate({ userId: user.id, name: user.name })}
                        disabled={addMutation.isPending}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-semibold transition-all disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Add
                      </button>
                  }
                </div>
              );
            })
          }
        </div>
        <div className="p-4 border-t border-border-color">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors">Done</button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Activity Feed ──────────────────────────────────────────────────────────
const ActivityFeed = ({ activities = [] }) => {
  if (activities.length === 0)
    return <p className="text-sm text-text-muted text-center py-8">No recent activity</p>;
  return (
    <div className="space-y-3">
      {activities.map(log => (
        <div key={log.id} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 overflow-hidden">
            {log.user?.avatarUrl
              ? <img src={log.user.avatarUrl} alt="" className="w-full h-full object-cover" />
              : log.user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-color"><span className="font-semibold">{log.user?.name}</span> {log.action.toLowerCase().replace(/_/g, ' ')}</p>
            <p className="text-xs text-text-muted mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [showAddMember, setShowAddMember] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const storedUser = currentUser || JSON.parse(localStorage.getItem('userInfo') || '{}');


  const { data, isLoading, error } = useQuery({
    queryKey: ['team', id],
    queryFn: async () => { const { data } = await api.get(`/teams/${id}`); return data; },
    enabled: !!id
  });

  const removeMutation = useMutation({
    mutationFn: (userId) => api.delete(`/teams/${id}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['team', id]);
      toast.success('Member removed');
      setRemoveTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove member'),
  });

  const { data: teamProjects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['teamProjects', id],
    queryFn: async () => { const { data } = await api.get(`/projects?teamId=${id}`); return data; },
    enabled: activeTab === 'projects' || activeTab === 'overview'
  });

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState(null);

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId) => api.delete(`/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamProjects', id]);
      toast.success('Project deleted');
      setDeleteProjectTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  if (isLoading) return <Loader text="Loading team..." />;
  if (error || !data) return (
    <div className="p-6 text-center">
      <p className="text-text-muted">Team not found.</p>
      <button onClick={() => navigate('/dashboard/teams')} className="mt-4 saas-button">Go Back</button>
    </div>
  );

  const team = data;
  const stats = data.stats || {};
  const existingUserIds = new Set(team.members?.map(m => m.userId) || []);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: `Projects` },
    { id: 'sprints', label: 'Sprints' },
    { id: 'chat', label: 'Chat' },
    { id: 'files', label: 'Files' },
    { id: 'members', label: `Members (${team.members?.length || 0})` },
    { id: 'activity', label: 'Activity' },
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* Hero Header */}
      <div className="relative p-6 pb-0">
        <button onClick={() => navigate('/dashboard/teams')} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-color mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Teams
        </button>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
            style={{ backgroundColor: team.color || '#6366f1' }}>
            {team.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-text-color">{team.name}</h1>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                team.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>{team.status}</span>
            </div>
            {team.description && <p className="text-text-muted mt-1">{team.description}</p>}
            <div className="flex items-center gap-4 mt-2 text-sm text-text-muted flex-wrap">
              {team.lead && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> Lead: <span className="font-medium text-text-color">{team.lead.name}</span></span>}
              {team.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{team.email}</span>}
              <span>Created {new Date(team.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
          <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']}>
            <button onClick={() => setShowAddMember(true)} className="saas-button flex items-center gap-2 shrink-0">
              <UserPlus className="w-4 h-4" /> Add Member
            </button>
          </PermissionGate>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Members" value={team.members?.length || 0} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" />
          <StatCard icon={CheckCircle2} label="Tasks Completed" value={stats.completedTasks || 0} color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" />
          <StatCard icon={Clock} label="Pending Tasks" value={stats.pendingTasks || 0} color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" />
          <StatCard icon={TrendingUp} label="Team Efficiency" value={`${stats.efficiency || 0}%`} color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
        </div>

        {/* Efficiency Bar */}
        <div className="saas-card p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-text-color">Overall Team Progress</span>
            <span className="text-sm font-bold text-primary">{stats.efficiency || 0}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.efficiency || 0}%` }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: team.color || '#6366f1' }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">{stats.completedTasks || 0} of {stats.totalTasks || 0} tasks completed</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border-color">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-color'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Members preview */}
            <div className="lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-text-color">Team Members</h2>
                <button onClick={() => setActiveTab('members')} className="text-sm text-primary hover:underline">See all →</button>
              </div>
              <div className="space-y-3 mb-8">
                {team.members?.slice(0, 5).map(m => (
                  <MemberCard key={m.id} member={m} teamColor={team.color} currentUserId={storedUser.id} onRemove={setRemoveTarget} />
                ))}
              </div>

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-text-color">Team Projects</h2>
                <button onClick={() => setActiveTab('projects')} className="text-sm text-primary hover:underline">See all →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamProjects.length === 0 ? (
                  <div className="col-span-full saas-card p-6 text-center text-text-muted text-sm">
                    No projects found for this team.
                  </div>
                ) : (
                  teamProjects.slice(0, 4).map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onEdit={setEditProject}
                      onDelete={setDeleteProjectTarget}
                    />
                  ))
                )}
              </div>
            </div>
            {/* Quick info */}
            <div className="space-y-4">
              <div className="saas-card p-5">
                <h3 className="font-bold text-text-color mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Team Info</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-text-muted text-xs uppercase tracking-wider mb-0.5">Organization</dt>
                    <dd className="font-medium text-text-color">{team.organization?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted text-xs uppercase tracking-wider mb-0.5">Created</dt>
                    <dd className="font-medium text-text-color">{new Date(team.createdAt).toLocaleDateString()}</dd>
                  </div>
                  {team.lead && (
                    <div>
                      <dt className="text-text-muted text-xs uppercase tracking-wider mb-0.5">Team Lead</dt>
                      <dd className="font-medium text-text-color flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold overflow-hidden">
                          {team.lead.avatarUrl ? <img src={team.lead.avatarUrl} alt="" className="w-full h-full object-cover" /> : team.lead.name.charAt(0)}
                        </div>
                        {team.lead.name}
                      </dd>
                    </div>
                  )}
                  {team.email && (
                    <div>
                      <dt className="text-text-muted text-xs uppercase tracking-wider mb-0.5">Team Email</dt>
                      <dd className="font-medium text-text-color">{team.email}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-text-color">{team.members?.length || 0} Members</h2>
              <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']}>
                <button onClick={() => setShowAddMember(true)} className="saas-button flex items-center gap-2 text-sm py-2">
                  <UserPlus className="w-4 h-4" /> Add Member
                </button>
              </PermissionGate>
            </div>
            <div className="space-y-3">
              {team.members?.map(m => (
                <MemberCard key={m.id} member={m} teamColor={team.color} currentUserId={storedUser.id} onRemove={setRemoveTarget} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-text-color">Team Projects</h2>
              <div className="flex items-center gap-3">
                <Link to={`/dashboard/tasks?teamId=${id}`} className="saas-button bg-surface-color text-text-color border border-border-color hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm py-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Team Tasks
                </Link>
                <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']}>
                  <button onClick={() => setShowProjectModal(true)} className="saas-button flex items-center gap-2 text-sm py-2">
                    <Plus className="w-4 h-4" /> New Project
                  </button>
                </PermissionGate>
              </div>
            </div>
            
            {isLoadingProjects ? <Loader text="Loading projects..." /> : teamProjects.length === 0 ? (
              <div className="text-center py-20 text-text-muted">No projects found. Create one!</div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {teamProjects.map(project => (
                  <motion.div key={project.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <ProjectCard
                      project={project}
                      onEdit={setEditProject}
                      onDelete={setDeleteProjectTarget}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <TeamChat teamId={id} />
        )}

        {activeTab === 'files' && (
          <TeamFiles teamId={id} />
        )}

        {activeTab === 'sprints' && (
          <TeamSprints teamId={id} />
        )}

        {activeTab === 'activity' && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-text-color mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> Recent Activity
            </h2>
            <div className="saas-card p-5">
              <ActivityFeed activities={data.recentActivity || []} />
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <AddMemberModal
            teamId={id}
            existingUserIds={existingUserIds}
            onClose={() => setShowAddMember(false)}
            onSuccess={() => queryClient.invalidateQueries(['team', id])}
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
              <p className="text-text-muted text-sm mb-6">They will be removed from this team and lose access to team resources.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setRemoveTarget(null)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-sm font-medium transition-colors">Cancel</button>
                <button
                  onClick={() => removeMutation.mutate(removeTarget.userId)}
                  disabled={removeMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-60 transition-colors"
                >
                  {removeMutation.isPending ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProjectModal && (
          <ProjectModal teamId={id} onClose={() => setShowProjectModal(false)} onSuccess={() => {
            queryClient.invalidateQueries(['teamProjects', id]);
            setShowProjectModal(false);
          }} />
        )}
        {editProject && (
          <ProjectModal project={editProject} teamId={id} onClose={() => setEditProject(null)} onSuccess={() => {
            queryClient.invalidateQueries(['teamProjects', id]);
            setEditProject(null);
          }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteProjectTarget && (
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
              <h3 className="text-lg font-bold mb-2">Delete "{deleteProjectTarget.name}"?</h3>
              <p className="text-text-muted text-sm mb-6">This will permanently delete the project and all its associated data. This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteProjectTarget(null)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => deleteProjectMutation.mutate(deleteProjectTarget.id)}
                  disabled={deleteProjectMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {deleteProjectMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamDetails;
