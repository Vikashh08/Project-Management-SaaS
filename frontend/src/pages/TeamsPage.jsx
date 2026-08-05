import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, X, ChevronRight, Pencil, Trash2, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import PermissionGate from '../components/PermissionGate';
import Loader from '../components/Loader';

// ── Team Card ──────────────────────────────────────────────────────────────
const TeamCard = ({ team, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const memberPreview = team.members?.slice(0, 4) || [];
  const extra = (team.members?.length || 0) - 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="saas-card p-5 flex flex-col gap-4 relative group hover:shadow-lg transition-shadow"
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
            style={{ backgroundColor: team.color || '#6366f1' }}
          >
            {team.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-text-color text-base leading-tight">{team.name}</h3>
            <p className="text-xs text-text-muted mt-0.5">
              {team.members?.length || 0} member{team.members?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.preventDefault(); setMenuOpen(v => !v); }}
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
                className="absolute right-0 top-8 z-50 w-44 bg-surface-color border border-border-color rounded-xl shadow-xl py-1.5"
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit(team); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-color hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Pencil className="w-4 h-4 text-text-muted" /> Edit Team
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(team); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" /> Delete Team
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Description */}
      {team.description && (
        <p className="text-sm text-text-muted line-clamp-2 -mt-1">{team.description}</p>
      )}

      {/* Lead */}
      {team.lead && (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold overflow-hidden">
            {team.lead.avatarUrl
              ? <img src={team.lead.avatarUrl} alt={team.lead.name} className="w-full h-full object-cover" />
              : team.lead.name.charAt(0)}
          </div>
          <span className="text-xs text-text-muted">Lead: <span className="font-medium text-text-color">{team.lead.name}</span></span>
        </div>
      )}

      {/* Member avatars */}
      {memberPreview.length > 0 && (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {memberPreview.map(m => (
              <div
                key={m.id}
                title={m.user?.name}
                className="w-7 h-7 rounded-full border-2 border-surface-color bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold overflow-hidden"
              >
                {m.user?.avatarUrl
                  ? <img src={m.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : m.user?.name?.charAt(0)}
              </div>
            ))}
            {extra > 0 && (
              <div className="w-7 h-7 rounded-full border-2 border-surface-color bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[9px] font-bold text-text-muted">
                +{extra}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <Link
        to={`/dashboard/teams/${team.id}`}
        className="flex items-center justify-between mt-auto pt-4 border-t border-border-color text-sm font-semibold text-primary hover:gap-2 transition-all group/link"
      >
        Open Team Dashboard
        <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
      </Link>
    </motion.div>

  );
};

// ── Team Modal (Create / Edit) ─────────────────────────────────────────────
const TeamModal = ({ team, onClose, onSuccess }) => {
  const isEdit = !!team;
  const [form, setForm] = useState({
    name: team?.name || '',
    description: team?.description || '',
    color: team?.color || '#6366f1',
    email: team?.email || '',
  });

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? api.put(`/teams/${team.id}`, data) : api.post('/teams', data),
    onSuccess: () => { toast.success(isEdit ? 'Team updated!' : 'Team created!'); onSuccess(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong'),
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-color p-6 rounded-2xl w-full max-w-md shadow-2xl border border-border-color"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">{isEdit ? 'Edit Team' : 'Create New Team'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Team Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. Frontend Team" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              placeholder="What does this team work on?" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5">Team Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                placeholder="team@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Color</label>
              <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                className="w-12 h-10 rounded-lg border border-border-color cursor-pointer bg-transparent" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors disabled:opacity-60">
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Team'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const TeamsPage = () => {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => { const { data } = await api.get('/teams'); return data; }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/teams/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['teams']); toast.success('Team deleted'); setDeleteTarget(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const handleSuccess = () => { queryClient.invalidateQueries(['teams']); setShowCreate(false); setEditTarget(null); };

  if (isLoading) return <Loader text="Loading teams..." />;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Teams</h1>
          <p className="text-text-muted text-sm mt-1">{teams.length} team{teams.length !== 1 ? 's' : ''} in your organization</p>
        </div>
        <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']}>
          <button onClick={() => setShowCreate(true)} className="saas-button flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Team
          </button>
        </PermissionGate>
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-text-color mb-2">No teams yet</h3>
          <p className="text-text-muted text-sm mb-6 max-w-sm">Create a team to organize members around shared projects and goals.</p>
          <button onClick={() => setShowCreate(true)} className="saas-button flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create your first team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teams.map(team => (
            <TeamCard key={team.id} team={team} onEdit={setEditTarget} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showCreate && <TeamModal onClose={() => setShowCreate(false)} onSuccess={handleSuccess} />}
        {editTarget && <TeamModal team={editTarget} onClose={() => setEditTarget(null)} onSuccess={handleSuccess} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
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
              <h3 className="text-lg font-bold mb-2">Delete "{deleteTarget.name}"?</h3>
              <p className="text-text-muted text-sm mb-6">All team members and settings will be permanently removed.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-sm font-medium transition-colors">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium disabled:opacity-60 transition-colors">
                  {deleteMutation.isPending ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamsPage;
