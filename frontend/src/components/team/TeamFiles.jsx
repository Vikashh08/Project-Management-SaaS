import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { FileText, Image as ImageIcon, Download, Trash2, Upload, File } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const getFileIcon = (type) => {
  if (type.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
  if (type === 'application/pdf') return <FileText className="w-8 h-8 text-red-500" />;
  return <File className="w-8 h-8 text-gray-500" />;
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const TeamFiles = ({ teamId }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['teamFiles', teamId],
    queryFn: async () => {
      const { data } = await api.get(`/teams/${teamId}/files`);
      return data;
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('teamId', teamId);
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.attachment;
    },
    onMutate: () => setUploading(true),
    onSuccess: () => {
      queryClient.invalidateQueries(['teamFiles', teamId]);
      toast.success('File uploaded successfully');
      setUploading(false);
    },
    onError: () => {
      toast.error('Failed to upload file');
      setUploading(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId) => {
      await api.delete(`/teams/${teamId}/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teamFiles', teamId]);
      toast.success('File deleted');
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (isLoading) return <div className="text-center py-10">Loading files...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-text-color">Team Files</h2>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="saas-button bg-primary text-white hover:bg-primary-hover flex items-center gap-2 text-sm disabled:opacity-70"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload File
          </button>
        </div>
      </div>

      {files.length === 0 && !uploading ? (
        <div className="text-center py-16 saas-card">
          <File className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-text-muted">No files uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {files.map(file => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="saas-card p-4 flex flex-col group relative overflow-hidden"
              >
                <div className="flex items-center justify-center h-24 mb-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-color truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {formatBytes(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                    title="Download / View"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => deleteMutation.mutate(file.id)}
                    className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default TeamFiles;
