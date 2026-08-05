import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Plus, Edit3, Trash2, X, FileText, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Loader from './Loader';

const ProjectWiki = ({ project }) => {
  const queryClient = useQueryClient();
  const [activePageId, setActivePageId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '' });

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['wiki', project.id],
    queryFn: async () => {
      const { data } = await api.get(`/wiki/project/${project.id}`);
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post(`/wiki/project/${project.id}`, data),
    onSuccess: (newPage) => {
      queryClient.invalidateQueries(['wiki', project.id]);
      setActivePageId(newPage.id);
      setIsEditing(false);
      toast.success('Page created');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => api.put(`/wiki/${activePageId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['wiki', project.id]);
      setIsEditing(false);
      toast.success('Page updated');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/wiki/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['wiki', project.id]);
      setActivePageId(null);
      toast.success('Page deleted');
    }
  });

  const handleSave = () => {
    if (!editForm.title.trim()) return toast.error('Title required');
    if (activePageId === 'NEW') {
      createMutation.mutate(editForm);
    } else {
      updateMutation.mutate(editForm);
    }
  };

  if (isLoading) return <Loader text="Loading wiki..." />;

  const activePage = pages.find(p => p.id === activePageId);

  return (
    <div className="flex h-full gap-6">
      {/* Sidebar Navigation */}
      <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 pr-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Wiki Pages</h3>
          <button 
            onClick={() => { setActivePageId('NEW'); setIsEditing(true); setEditForm({ title: 'Untitled Page', content: '' }); }}
            className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => { setActivePageId(page.id); setIsEditing(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 truncate ${activePageId === page.id ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <FileText className="w-4 h-4 opacity-70 flex-shrink-0" />
              <span className="truncate">{page.title}</span>
            </button>
          ))}
          {pages.length === 0 && activePageId !== 'NEW' && (
             <p className="text-xs text-gray-400 font-medium py-4 text-center">No pages yet.</p>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white dark:bg-[#131b2e] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col relative">
        {!activePageId && activePageId !== 'NEW' ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
             <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
             <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Project Wiki</h2>
             <p className="text-gray-500 font-medium max-w-sm mb-6">Select a page from the sidebar or create a new one to start documenting.</p>
             <button onClick={() => { setActivePageId('NEW'); setIsEditing(true); setEditForm({ title: 'Untitled Page', content: '' }); }} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center gap-2">
               <Plus className="w-5 h-5" /> Create Page
             </button>
           </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="px-8 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
              {isEditing ? (
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="text-2xl font-bold bg-transparent border-b-2 border-primary outline-none focus:ring-0 px-0 py-1 w-1/2 text-gray-900 dark:text-white"
                  placeholder="Page Title"
                  autoFocus
                />
              ) : (
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{activePage?.title}</h2>
              )}
              
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button onClick={() => {
                      if (activePageId === 'NEW') setActivePageId(null);
                      setIsEditing(false);
                    }} className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-sm transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-5 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary-dark transition-colors">Save</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditForm({ title: activePage.title, content: activePage.content }); setIsEditing(true); }} className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button onClick={() => { if(window.confirm('Delete this page?')) deleteMutation.mutate(activePage.id); }} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                <div className="h-full p-4">
                  <textarea 
                    rows={16}
                    value={editForm.content} 
                    onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                    className="w-full h-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none text-gray-900 dark:text-white font-medium resize-none font-mono text-sm"
                    placeholder="Write your documentation here..."
                  />
                </div>
              ) : (
                <div className="p-8 prose dark:prose-invert max-w-3xl mx-auto" dangerouslySetInnerHTML={{ __html: activePage?.content || '<p class="text-gray-400 italic">No content written yet.</p>' }} />
              )}
            </div>
            
            {!isEditing && activePage && (
              <div className="px-8 py-3 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 flex justify-between">
                <span>Last updated: {new Date(activePage.updatedAt).toLocaleString()}</span>
                <span>By: {activePage.author?.name}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectWiki;
