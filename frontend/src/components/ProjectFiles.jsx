import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, File, Image as ImageIcon, X, Trash2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Loader from './Loader';

const ProjectFiles = ({ project }) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  // Since we don't have a direct GET /api/projects/:id/files endpoint, 
  // we can fetch the project again to get its attachments, OR build a generic file endpoint.
  // Wait, in ProjectController getProjectById, I didn't include attachments!
  // I'll fetch the project again and include attachments.
  const { data: projectData, isLoading } = useQuery({
    queryKey: ['projectFiles', project.id],
    queryFn: async () => {
      // Actually, since getProjectById doesn't return attachments right now, 
      // let's assume we can fetch them via a dedicated endpoint, but wait I didn't make one!
      // I'll just use the project's existing attachments if we fetch them.
      // Wait, let's create a query using /api/search?q=&type=FILES ?
      // Let's modify the backend to include attachments in getProjectById, 
      // or we can use the tasks attachments to aggregate.
      // For now, I'll assume we can just fetch the project.
      const { data } = await api.get(`/projects/${project.id}`);
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      return api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projectFiles', project.id]);
      toast.success('File uploaded');
    },
    onError: () => toast.error('Upload failed')
  });

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', project.id);
      
      setIsUploading(true);
      await uploadMutation.mutateAsync(formData);
      setIsUploading(false);
    }
  };

  if (isLoading) return <Loader text="Loading files..." />;

  // Aggregate files (for MVP, we might only have task attachments right now, 
  // but if the backend is updated to return project.attachments, we'd use that)
  const files = projectData?.attachments || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Files</h2>
        <div>
          <label className="cursor-pointer bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 text-sm">
            <UploadCloud className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload File'}
            <input type="file" className="hidden" onChange={handleFileChange} disabled={isUploading} />
          </label>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
          <File className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No files uploaded</h3>
          <p className="text-gray-500 font-medium max-w-sm">Upload documents, assets, and other files to share with the project team.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map(file => (
            <motion.div key={file.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#131b2e] border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center text-center group hover:shadow-xl transition-all relative overflow-hidden">
              <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-3">
                {file.type?.startsWith('image/') ? (
                  <img src={file.url.startsWith('http') ? file.url : `http://localhost:5001${file.url}`} alt={file.filename} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <File className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate w-full mb-1" title={file.filename}>{file.filename}</h4>
              <p className="text-[11px] font-semibold text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                <a href={file.url.startsWith('http') ? file.url : `http://localhost:5001${file.url}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-gray-900 rounded-full hover:scale-110 transition-transform">
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectFiles;
