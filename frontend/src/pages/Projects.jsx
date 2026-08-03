import React from 'react';
import { Plus, Folder, MoreVertical, Clock } from 'lucide-react';

const mockProjects = [
  { id: '1', name: 'Website Redesign', description: 'Overhaul of the main corporate website', status: 'ACTIVE', progress: 65, members: 4 },
  { id: '2', name: 'Mobile App V2', description: 'Adding new features to iOS and Android apps', status: 'ON_HOLD', progress: 30, members: 6 },
  { id: '3', name: 'Marketing Campaign', description: 'Q3 social media and email marketing', status: 'COMPLETED', progress: 100, members: 3 },
];

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
      <p className="text-sm text-text-muted mb-4 line-clamp-2">{project.description}</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">Progress</span>
          <span className="text-text-muted">{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-blue-600 h-1.5 rounded-full" 
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
        <StatusBadge status={project.status} />
        <div className="flex -space-x-2">
          {[...Array(Math.min(project.members, 3))].map((_, i) => (
            <img key={i} className="w-6 h-6 rounded-full border-2 border-surface-color" src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="Member" />
          ))}
          {project.members > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-surface-color bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-medium text-text-muted">
              +{project.members - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-color">Projects</h1>
          <p className="text-text-muted text-sm mt-1">Manage and track your team's projects</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
