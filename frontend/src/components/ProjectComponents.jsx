import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Folder, MoreVertical, Pencil, Trash2, LayoutDashboard, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PermissionGate from './PermissionGate';
import api from '../utils/api';

export const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ON_HOLD: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export const ProjectCard = ({ project, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="saas-card p-5 h-full flex flex-col group relative">
      <div className="flex justify-between items-start mb-4">
        <Link to={`/projects/${project.id}`} className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary dark:text-primary-light group-hover:scale-110 transition-transform duration-300">
          <Folder className="w-6 h-6" />
        </Link>
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(v => !v); }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-8 z-50 w-48 bg-surface-color border border-border-color rounded-xl shadow-xl py-1.5 overflow-hidden"
              >
                <Link
                  to={`/projects/${project.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-color hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-text-muted" /> View Dashboard
                </Link>
                <Link
                  to={`/tasks?projectId=${project.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-color hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-text-muted" /> Open Kanban Board
                </Link>
                <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']}>
                  <div className="border-t border-border-color my-1" />
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); onEdit(project); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-color hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-text-muted" /> Edit Project
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); onDelete(project); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Project
                  </button>
                </PermissionGate>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Link to={`/projects/${project.id}`} className="flex-1 flex flex-col min-h-0">
        <h3 className="text-lg font-bold text-text-color mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
        <p className="text-sm text-text-muted mb-4 line-clamp-2">{project.description || 'No description provided.'}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <StatusBadge status={project.status} />
          <span className="text-xs text-text-muted">By {project.owner?.name}</span>
        </div>
      </Link>
    </div>
  );
};

export const ProjectModal = ({ project, teamId, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'ACTIVE',
    teamId: teamId || project?.teamId || null,
  });
  const isEdit = !!project;

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (isEdit) return api.put(`/projects/${project.id}`, data);
      return api.post('/projects', data);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Project updated!' : 'Project created!');
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Something went wrong'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-color p-6 rounded-2xl w-full max-w-md shadow-2xl border border-border-color"
      >
        <h2 className="text-xl font-bold mb-5">{isEdit ? 'Edit Project' : 'Create New Project'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Project Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="e.g. Website Redesign"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
              placeholder="What is this project about?"
            />
          </div>
          {isEdit && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium text-text-color transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors disabled:opacity-60">
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
