import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, MessageSquare, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import TaskModal from './TaskModal';

const DEFAULT_COLUMNS = [
  { id: 'TODO', title: 'To Do', dotColor: '#eab308' },
  { id: 'IN_PROGRESS', title: 'In Progress', dotColor: '#f97316' },
  { id: 'REVIEW', title: 'Review', dotColor: '#a855f7' },
  { id: 'DONE', title: 'Completed', dotColor: '#22c55e' },
];

const priorityConfig = {
  CRITICAL: { label: 'Critical', bg: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  HIGH: { label: 'Important', bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  MEDIUM: { label: 'Medium', bg: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  LOW: { label: 'Low', bg: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${config.bg} border-transparent`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
      {config.label}
    </span>
  );
};

const TaskCard = ({ task, onClick }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-900 backdrop-blur-md rounded-2xl p-4 mb-3 cursor-grab active:cursor-grabbing group border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 relative"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <PriorityBadge priority={task.priority} />
        <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-5 h-5" />
        </div>
      </div>
      <h4 className="text-[15px] font-bold mb-4 text-gray-800 dark:text-gray-100 leading-snug group-hover:text-primary transition-colors line-clamp-2">
        {task.title}
      </h4>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center -space-x-2">
          {task.reporter && (
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 flex items-center justify-center overflow-hidden z-10">
              {task.reporter.avatarUrl ? (
                <img src={task.reporter.avatarUrl} alt={task.reporter.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold">{task.reporter.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold">
          <MessageSquare className="w-4 h-4" />
          <span>{task.comments?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};

const ProjectBoard = ({ project }) => {
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Determine columns
  const useCustomColumns = project.boardColumns && project.boardColumns.length > 0;
  const columns = useCustomColumns 
    ? project.boardColumns.map(c => ({ id: c.id, title: c.name, dotColor: '#3b82f6', isCustom: true }))
    : DEFAULT_COLUMNS.map(c => ({ ...c, isCustom: false }));

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', project.id],
    queryFn: async () => {
      const { data } = await api.get(`/tasks?projectId=${project.id}`);
      return data;
    },
    enabled: !!project.id
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status, columnId }) => {
      const payload = {};
      if (status) payload.status = status;
      if (columnId) payload.columnId = columnId;
      return api.put(`/tasks/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['project', project.id]);
      queryClient.invalidateQueries(['tasks', project.id]);
    },
    onError: () => toast.error('Failed to move task')
  });

  const handleDragStart = (e, taskId) => e.dataTransfer.setData('taskId', taskId);
  const handleDragOver = (e, columnId) => { e.preventDefault(); setDragOverColumn(columnId); };
  const handleDragLeave = () => setDragOverColumn(null);
  const handleDrop = (e, col) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      if (col.isCustom) {
        updateTaskMutation.mutate({ id: taskId, columnId: col.id });
      } else {
        updateTaskMutation.mutate({ id: taskId, status: col.id });
      }
    }
  };

  return (
    <div className="flex-1 overflow-x-auto flex gap-6 pb-4">
      {columns.map((col) => {
        const columnTasks = tasks.filter(t => {
          if (col.isCustom) return t.columnId === col.id;
          return t.status === col.id;
        });

        return (
          <div key={col.id} className="flex-shrink-0 w-[340px] flex flex-col bg-gray-50 dark:bg-gray-800/30 rounded-3xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: col.dotColor }}></div>
                <h3 className="font-extrabold text-gray-900 dark:text-white">{col.title}</h3>
              </div>
              <span className="flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-bold bg-white dark:bg-gray-900 rounded-full shadow-sm">
                {columnTasks.length}
              </span>
            </div>

            <div 
              className={`flex-1 overflow-y-auto rounded-2xl transition-colors ${dragOverColumn === col.id ? 'bg-primary/5 ring-2 ring-primary' : ''}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col)}
            >
              {isLoading ? (
                <div className="h-24 flex items-center justify-center">
                   <span className="text-gray-400 font-medium">Loading...</span>
                </div>
              ) : columnTasks.length === 0 ? (
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl m-1">
                  <p className="text-xs font-semibold text-gray-400">Drag tasks here</p>
                </div>
              ) : (
                columnTasks.map(task => (
                  <motion.div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} layout>
                    <TaskCard task={task} onClick={() => setSelectedTaskId(task.id)} />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}

      <TaskModal isOpen={!!selectedTaskId} onClose={() => setSelectedTaskId(null)} taskId={selectedTaskId} />
    </div>
  );
};

export default ProjectBoard;
