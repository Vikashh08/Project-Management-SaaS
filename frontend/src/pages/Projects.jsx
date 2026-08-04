import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PermissionGate from '../components/PermissionGate';
import Loader from '../components/Loader';
import { ProjectCard, ProjectModal } from '../components/ProjectComponents';

const Projects = () => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Project deleted');
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const handleModalSuccess = () => {
    queryClient.invalidateQueries(['projects']);
    setShowCreateModal(false);
    setEditProject(null);
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Projects</h1>
          <p className="text-text-muted text-sm mt-1">Manage and track your team's projects</p>
        </div>
        <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD']}>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </PermissionGate>
      </div>

      {isLoading ? (
        <Loader text="Loading projects..." />
      ) : projects?.length === 0 ? (
        <div className="text-center py-20 text-text-muted">No projects found. Create one!</div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {projects?.map(project => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ProjectCard
                project={project}
                onEdit={(p) => setEditProject(p)}
                onDelete={(p) => setDeleteTarget(p)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <ProjectModal onClose={() => setShowCreateModal(false)} onSuccess={handleModalSuccess} />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editProject && (
          <ProjectModal project={editProject} onClose={() => setEditProject(null)} onSuccess={handleModalSuccess} />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
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
              <p className="text-text-muted text-sm mb-6">This will permanently delete the project and all its associated data. This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
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

export default Projects;
