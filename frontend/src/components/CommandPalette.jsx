import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import { Search, Folder, CheckSquare, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const useDebounceHook = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounceHook(query, 300);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return { projects: [], tasks: [] };
      const { data } = await api.get(`/search?q=${encodeURIComponent(debouncedQuery)}`);
      return data;
    },
    enabled: debouncedQuery.length > 0
  });

  const flatResults = [
    ...(results?.projects || []).map(p => ({ ...p, type: 'project' })),
    ...(results?.tasks || []).map(t => ({ ...t, type: 'task' }))
  ];

  useEffect(() => {
    setSelectedIndex(0);
  }, [debouncedQuery, results]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = flatResults[selectedIndex];
      if (selectedItem) {
        if (selectedItem.type === 'project') {
          navigate('/projects'); // MVP: navigate to projects page
        } else if (selectedItem.type === 'task') {
          navigate('/tasks'); // MVP: navigate to tasks page
        }
        onClose();
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, flatResults]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-surface-color rounded-2xl shadow-2xl overflow-hidden border border-border-color"
        >
          <div className="flex items-center px-4 py-4 border-b border-border-color">
            <Search className="w-5 h-5 text-text-muted mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, tasks, or settings..."
              className="flex-1 bg-transparent border-none outline-none text-text-color placeholder-text-muted text-lg"
            />
            <button onClick={onClose} className="p-1 text-text-muted hover:text-text-color rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!query ? (
              <div className="p-8 text-center text-text-muted">
                <p>Start typing to search for anything...</p>
                <div className="flex items-center justify-center mt-4 space-x-2 text-xs">
                  <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">↑↓</span>
                  <span>to navigate</span>
                  <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">Enter</span>
                  <span>to select</span>
                </div>
              </div>
            ) : isLoading ? (
              <div className="p-8 text-center text-text-muted">Searching...</div>
            ) : flatResults.length === 0 ? (
              <div className="p-8 text-center text-text-muted">No results found for "{query}"</div>
            ) : (
              <ul className="space-y-1">
                {flatResults.map((item, index) => (
                  <li 
                    key={`${item.type}-${item.id}`}
                    className={`flex items-center px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 text-text-color'
                    }`}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onClick={() => {
                      navigate(item.type === 'project' ? '/projects' : '/tasks');
                      onClose();
                      setQuery('');
                    }}
                  >
                    <div className={`p-2 rounded-lg mr-4 ${item.type === 'project' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 'bg-green-100 text-green-600 dark:bg-green-900/30'}`}>
                      {item.type === 'project' ? <Folder className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-medium truncate">{item.type === 'project' ? item.name : item.title}</p>
                      <p className="text-xs opacity-70 mt-0.5 capitalize">{item.type} • {item.status.replace('_', ' ')}</p>
                    </div>
                    {index === selectedIndex && (
                      <span className="text-xs font-medium">↵ Jump</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
