import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, LayoutGrid, List as ListIcon, Folder, MoreVertical, LayoutDashboard, Calendar, Users, AlertCircle, CheckCircle2, Archive, Clock } from 'lucide-react';
import { Link } from 'react-router';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PermissionGate from '../components/PermissionGate';
import Loader from '../components/Loader';
import { ProjectModal } from '../components/ProjectComponents';

// --- STUNNING PROJECT CARD ---
const ModernProjectCard = ({ project, onEdit, onDelete, viewMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Calculate Progress
  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0;
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  // Check if overdue
  const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'COMPLETED';

  // Members Preview
  const members = project.members?.map(m => m.user) || [];
  const memberPreview = members.slice(0, 3);
  const extraMembers = members.length - 3;

  if (viewMode === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-md p-4 rounded-2xl flex items-center gap-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0"
             style={{ 
               background: project.color ? `linear-gradient(135deg, ${project.color}88, ${project.color})` : 'linear-gradient(135deg, #4f46e5, #3b82f6)' 
             }}>
          <Folder className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <Link to={`/dashboard/projects/${project.id}`} className="text-lg font-bold text-gray-900 dark:text-white hover:text-primary transition-colors truncate block">
            {project.name}
          </Link>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <span className={`px-2 py-0.5 rounded-full font-bold ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              {project.status}
            </span>
            {project.deadline && (
              <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
                <Calendar className="w-3.5 h-3.5" /> 
                {new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
              </span>
            )}
            <span className="flex items-center gap-1"><LayoutDashboard className="w-3.5 h-3.5" /> {totalTasks} Tasks</span>
          </div>
        </div>

        <div className="hidden md:flex flex-col w-32 shrink-0">
          <div className="flex justify-between text-xs font-bold mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="hidden lg:flex items-center -space-x-2 shrink-0 px-4">
          {memberPreview.map((m, i) => (
            <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#131b2e] bg-gray-200 flex items-center justify-center text-[10px] font-bold overflow-hidden" style={{ zIndex: 10 - i }}>
              {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" /> : m.name.charAt(0)}
            </div>
          ))}
          {extraMembers > 0 && <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#131b2e] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500" style={{ zIndex: 0 }}>+{extraMembers}</div>}
        </div>

        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 w-40 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
              <button onClick={() => { setMenuOpen(false); onEdit(project); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Edit Project</button>
              <button onClick={() => { setMenuOpen(false); onDelete(project); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">Delete Project</button>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // GRID VIEW CARD
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all flex flex-col group relative overflow-hidden"
    >
      {/* Background Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 opacity-20 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: project.color || '#4f46e5' }}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <Link to={`/dashboard/projects/${project.id}`}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
               style={{ 
                 background: project.color ? `linear-gradient(135deg, ${project.color}88, ${project.color})` : 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                 boxShadow: project.color ? `0 4px 20px 0 ${project.color}40` : '0 4px 20px 0 rgba(79,70,229,0.4)'
               }}>
            <Folder className="w-7 h-7 text-white" />
          </div>
        </Link>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-40 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
              <button onClick={() => { setMenuOpen(false); onEdit(project); }} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Edit Project</button>
              <button onClick={() => { setMenuOpen(false); onDelete(project); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">Delete Project</button>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
            {project.status}
          </span>
          {isOverdue && <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Overdue</span>}
        </div>
        
        <Link to={`/dashboard/projects/${project.id}`}>
          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-1">{project.name}</h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[40px] mb-5">{project.description || 'No description available for this project.'}</p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1.5"><LayoutDashboard className="w-4 h-4"/> {completedTasks} / {totalTasks} Tasks</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="h-2.5 bg-gray-100 dark:bg-gray-800/80 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-blue-500 relative"
            >
              <div className="absolute top-0 left-0 bottom-0 right-0 overflow-hidden">
                <div className="w-full h-full bg-white/20 animate-[shimmer_2s_infinite] -translate-x-full"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/60 flex items-center justify-between relative z-10">
        <div className="flex items-center -space-x-2">
          {memberPreview.length > 0 ? memberPreview.map((m, i) => (
            <div key={m.id} title={m.name} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#131b2e] bg-gray-200 flex items-center justify-center text-[10px] font-bold overflow-hidden" style={{ zIndex: 10 - i }}>
              {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" /> : m.name.charAt(0)}
            </div>
          )) : <div className="text-xs text-gray-400 font-medium">No members</div>}
          {extraMembers > 0 && <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#131b2e] bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500" style={{ zIndex: 0 }}>+{extraMembers}</div>}
        </div>
        
        {project.deadline && (
          <div className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${isOverdue ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
            <Calendar className="w-3.5 h-3.5" />
            {new Date(project.deadline).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- MAIN PROJECTS PAGE ---
const Projects = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted');
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    setShowCreateModal(false);
    setEditProject(null);
  };

  // CALCULATE STATS
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'ACTIVE').length;
    const completed = projects.filter(p => p.status === 'COMPLETED').length;
    const archived = projects.filter(p => p.status === 'ARCHIVED').length;
    const overdue = projects.filter(p => p.deadline && new Date(p.deadline) < new Date() && p.status !== 'COMPLETED').length;
    
    return { total, active, completed, archived, overdue };
  }, [projects]);

  return (
    <div className="p-6 lg:p-8 h-full overflow-y-auto">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white/50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 backdrop-blur-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Projects Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 font-medium">Manage and track your entire portfolio.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']}>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" /> New Project
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center"><Folder className="w-6 h-6 text-blue-600 dark:text-blue-400" /></div>
          <div><p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">{stats.total}</p><p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</p></div>
        </div>
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center"><LayoutDashboard className="w-6 h-6 text-green-600 dark:text-green-400" /></div>
          <div><p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">{stats.active}</p><p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active</p></div>
        </div>
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" /></div>
          <div><p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">{stats.completed}</p><p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</p></div>
        </div>
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center"><Archive className="w-6 h-6 text-gray-600 dark:text-gray-400" /></div>
          <div><p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">{stats.archived}</p><p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Archived</p></div>
        </div>
        <div className="bg-white dark:bg-[#131b2e] p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><Clock className="w-6 h-6 text-red-600 dark:text-red-400" /></div>
          <div><p className="text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">{stats.overdue}</p><p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overdue</p></div>
        </div>
      </div>

      {/* PROJECTS LIST / GRID */}
      {isLoading ? (
        <Loader text="Loading projects..." />
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white/40 dark:bg-gray-900/40 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
          <Folder className="w-16 h-16 text-primary/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Projects Yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first project to start organizing tasks.</p>
          <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']}>
            <button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95">
              Create Project
            </button>
          </PermissionGate>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-3"}
        >
          {projects.map(project => (
            <ModernProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              onEdit={setEditProject}
              onDelete={setDeleteTarget}
            />
          ))}
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && <ProjectModal onClose={() => setShowCreateModal(false)} onSuccess={handleModalSuccess} />}
        {editProject && <ProjectModal project={editProject} onClose={() => setEditProject(null)} onSuccess={handleModalSuccess} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/95 dark:bg-gray-900/95 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl border border-red-100 dark:border-red-900/30 text-center"
            >
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-100 dark:border-red-900/50">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-extrabold mb-2 text-gray-900 dark:text-white">Delete Project?</h3>
              <p className="text-gray-500 text-sm mb-8 font-medium">All tasks, files, and discussions inside "{deleteTarget.name}" will be permanently removed.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 transition-colors">Cancel</button>
                <button onClick={() => deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold disabled:opacity-70 transition-colors shadow-lg shadow-red-600/20">
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

export default Projects;
