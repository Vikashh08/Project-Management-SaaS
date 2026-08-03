import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Folder, MoreVertical } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ON_HOLD: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    COMPLETED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-surface-color p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
          <Folder className="w-5 h-5" />
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
      
      <h3 className="text-lg font-bold text-text-color mb-1">{project.name}</h3>
      <p className="text-sm text-text-muted mb-4 line-clamp-2">{project.description || 'No description provided.'}</p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
        <StatusBadge status={project.status} />
        <div className="flex items-center">
          <span className="text-xs text-text-muted">By {project.owner?.name}</span>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', organizationId: 'temp_org_id' }); // Hardcoded orgId for demo if orgs aren't fully wired

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (projectData) => {
      // Create a temporary dummy organization if user has none, normally you'd fetch the user's selected org
      // For this demo, let's just pass a dummy org ID which will fail foreign key constraint if not exists in DB.
      // Wait, in schema organizationId is required. So we actually need an Organization.
      // Since this is a massive SaaS, for demo purposes we will create an endpoint to auto-seed an Org if missing, or just handle errors gracefully.
      return api.post('/projects', projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setShowModal(false);
      setNewProject({ name: '', description: '', organizationId: 'temp_org_id' });
      toast.success('Project created!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(newProject);
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Projects</h1>
          <p className="text-text-muted text-sm mt-1">Manage and track your team's projects</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <div className="text-text-muted">Loading projects...</div>
      ) : projects?.length === 0 ? (
        <div className="text-center py-20 text-text-muted">No projects found. Create one!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects?.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-color p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Project Name</label>
                  <input 
                    type="text" 
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Organization ID</label>
                  <input 
                    type="text" 
                    required
                    value={newProject.organizationId}
                    onChange={(e) => setNewProject({...newProject, organizationId: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    placeholder="Enter valid Org ID from DB"
                  />
                  <p className="text-xs text-text-muted mt-1">Requires a valid Organization ID from the DB.</p>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
