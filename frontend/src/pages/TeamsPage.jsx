import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, X, ChevronRight, Pencil, Trash2, MoreVertical, Shield } from 'lucide-react';
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-5 rounded-[1.5rem] flex flex-col gap-4 relative group border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
            style={{ 
              background: `linear-gradient(135deg, ${team.color || '#6366f1'}88, ${team.color || '#6366f1'})`,
              boxShadow: `0 4px 14px 0 ${team.color || '#6366f1'}40`
            }}
          >
            {team.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-lg leading-tight tracking-tight group-hover:text-primary transition-colors">{team.name}</h3>
            <p className="text-xs font-semibold text-gray-500 mt-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {team.members?.length || 0} Member{team.members?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.preventDefault(); setMenuOpen(v => !v); }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-10 z-50 w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-2xl shadow-2xl py-2 overflow-hidden"
              >
                <button
                  onClick={() => { setMenuOpen(false); onEdit(team); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-400" /> Edit Team
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(team); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{team.description}</p>
      )}

      {/* Lead */}
      {team.lead && (
        <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-800 w-max">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold overflow-hidden ring-2 ring-white dark:ring-gray-900">
            {team.lead.avatarUrl
              ? <img src={team.lead.avatarUrl} alt={team.lead.name} className="w-full h-full object-cover" />
              : <Shield className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs text-gray-500 font-semibold pr-2">Lead: <span className="text-gray-800 dark:text-gray-200 font-bold">{team.lead.name}</span></span>
        </div>
      )}

      {/* Member avatars & Footer Link */}
      <div className="flex items-center justify-between mt-auto pt-4">
        {memberPreview.length > 0 ? (
          <div className="flex items-center -space-x-2">
            {memberPreview.map((m, i) => (
              <div
                key={m.id}
                title={m.user?.name}
                className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 flex items-center justify-center text-gray-700 text-[10px] font-bold overflow-hidden relative"
                style={{ zIndex: 10 - i }}
              >
                {m.user?.avatarUrl
                  ? <img src={m.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : m.user?.name?.charAt(0).toUpperCase()}
              </div>
            ))}
            {extra > 0 && (
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-extrabold text-gray-500" style={{ zIndex: 0 }}>
                +{extra}
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs font-semibold text-gray-400">No members yet</div>
        )}

        <Link
          to={`/dashboard/teams/${team.id}`}
          className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-dark transition-colors group/link bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg"
        >
          View Team
          <ChevronRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
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
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl p-7 rounded-[2rem] w-full max-w-md shadow-2xl border border-white/20 dark:border-gray-700/50"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 tracking-tight">{isEdit ? 'Edit Team' : 'Create New Team'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Team Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              placeholder="e.g. Frontend Superstars" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description</label>
            <textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none resize-none transition-all"
              placeholder="What does this team focus on?" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Team Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="team@company.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Color</label>
              <div className="relative">
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-14 h-[46px] rounded-xl border-2 border-gray-200 dark:border-gray-700 cursor-pointer bg-transparent p-1 transition-all" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex items-center gap-2">
              {mutation.isPending && <Loader size={16} color="white" />}
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
    <div className="p-6 lg:p-8 h-full overflow-y-auto custom-scrollbar">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white/50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 backdrop-blur-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Teams Directory</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 font-medium">Manage {teams.length} team{teams.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']}>
          <button 
            onClick={() => setShowCreate(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Create New Team
          </button>
        </PermissionGate>
      </div>

      {teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center bg-white/40 dark:bg-gray-900/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-5 shadow-inner">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Teams Yet</h3>
          <p className="text-gray-500 text-sm mb-8 max-w-sm">Create a team to organize members around shared projects and scale your workflow.</p>
          <button 
            onClick={() => setShowCreate(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" /> Build Your First Team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 dark:bg-gray-900/95 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl border border-red-100 dark:border-red-900/30 text-center"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100 dark:border-red-900/50">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold mb-2 text-gray-900 dark:text-white">Delete Team?</h3>
              <p className="text-gray-500 text-sm mb-8 font-medium">All team members and settings for "{deleteTarget.name}" will be permanently removed.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setDeleteTarget(null)} 
                  className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deleteMutation.mutate(deleteTarget.id)} 
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-70 transition-colors shadow-lg shadow-red-600/20"
                >
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
