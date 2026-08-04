import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, MessageSquare, Paperclip, Folder } from 'lucide-react';
import { useSearchParams } from 'react-router';
import api from '../utils/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';
import { useSocket } from '../context/SocketContext';
import PermissionGate from '../components/PermissionGate';
import Loader from '../components/Loader';

const columns = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-200 dark:bg-gray-700' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300' },
  { id: 'REVIEW', title: 'Review', color: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300' },
  { id: 'DONE', title: 'Done', color: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' },
];

const PriorityBadge = ({ priority }) => {
  const colors = {
    LOW: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    CRITICAL: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors[priority]}`}>
      {priority}
    </span>
  );
};

const statusBorderColors = {
  TODO: '#9ca3af',
  IN_PROGRESS: '#3b82f6',
  REVIEW: '#a855f7',
  DONE: '#22c55e',
};

const TaskCard = ({ task, onClick }) => {
  return (
    <div 
      className="saas-card p-4 mb-3 cursor-grab active:cursor-grabbing group border-l-4"
      style={{ borderLeftColor: statusBorderColors[task.status] || '#e5e7eb' }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <PriorityBadge priority={task.priority} />
        <button className="text-text-muted hover:text-text-color opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <h4 className="text-sm font-semibold mb-3 text-text-color group-hover:text-primary transition-colors">{task.title}</h4>
      <div className="flex items-center justify-between text-text-muted text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1" title="Comments">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{task.comments?.length || 0}</span>
          </div>
          {task.dueDate && (
            <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 font-medium" title="Due Date">
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20" title={task.reporter?.name}>
          {task.reporter?.avatarUrl ? (
            <img src={task.reporter.avatarUrl} alt="Assignee" />
          ) : (
            <span className="text-[10px] uppercase">{task.reporter?.name?.charAt(0) || '?'}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const Tasks = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';
  const initialTeamId = searchParams.get('teamId') || '';

  const [showModal, setShowModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [teamIdForTasks, setTeamIdForTasks] = useState(initialTeamId);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'MEDIUM',
    projectId: '',
    dueDate: ''
  });

  const { socket } = useSocket();

  // Fetch projects to populate dropdowns
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/projects');
      return data;
    }
  });

  // Automatically select the first project if none is selected
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
      setNewTask(prev => ({ ...prev, projectId: projects[0].id }));
    }
  }, [projects, selectedProjectId]);

  // Handle Socket.IO Real-Time Updates
  useEffect(() => {
    if (socket && selectedProjectId) {
      socket.emit('join_project', selectedProjectId);

      const handleTaskUpdate = () => {
        queryClient.invalidateQueries(['tasks', selectedProjectId]);
      };

      socket.on('TASK_CREATED', handleTaskUpdate);
      socket.on('TASK_UPDATED', handleTaskUpdate);
      socket.on('TASK_DELETED', handleTaskUpdate);

      return () => {
        socket.off('TASK_CREATED', handleTaskUpdate);
        socket.off('TASK_UPDATED', handleTaskUpdate);
        socket.off('TASK_DELETED', handleTaskUpdate);
      };
    }
  }, [socket, selectedProjectId, queryClient]);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', selectedProjectId, teamIdForTasks],
    queryFn: async () => {
      let url = '/tasks';
      if (selectedProjectId) {
        url = `/tasks?projectId=${selectedProjectId}`;
      } else if (teamIdForTasks) {
        url = `/tasks?teamId=${teamIdForTasks}`;
      }
      const { data } = await api.get(url);
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (taskData) => {
      return api.post('/tasks', taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', projectId: selectedProjectId, dueDate: '' });
      toast.success('Task created!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return api.put(`/tasks/${id}`, { status });
    },
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', selectedProjectId, teamIdForTasks] });
      const previousTasks = queryClient.getQueryData(['tasks', selectedProjectId, teamIdForTasks]);
      
      queryClient.setQueryData(['tasks', selectedProjectId, teamIdForTasks], old => {
        if (!old) return old;
        return old.map(task => 
          task.id === newTodo.id ? { ...task, status: newTodo.status } : task
        );
      });
      
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['tasks', selectedProjectId, teamIdForTasks], context.previousTasks);
      toast.error('Failed to move task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(newTask);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskMutation.mutate({ id: taskId, status });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 h-full flex flex-col"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-text-color tracking-tight">Kanban Board</h1>
          <div className="flex items-center mt-2 space-x-2">
            <Folder className="w-4 h-4 text-text-muted" />
            <select 
              value={selectedProjectId}
              onChange={(e) => { setSelectedProjectId(e.target.value); setTeamIdForTasks(''); }}
              className="bg-transparent border-none text-sm text-text-muted font-medium focus:ring-0 p-0 cursor-pointer"
            >
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'QA_TESTER']}>
          <button 
            onClick={() => {
              setNewTask(prev => ({ ...prev, projectId: selectedProjectId || (projects[0]?.id || '') }));
              setShowModal(true);
            }}
            className="saas-button flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </PermissionGate>
      </div>

      <div className="flex-1 overflow-x-auto flex space-x-6 pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col">
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-4 ${col.color} border border-black/5 dark:border-white/5`}>
              <h3 className="font-semibold text-sm">{col.title}</h3>
              <span className="bg-white/50 dark:bg-black/20 text-xs px-2 py-0.5 rounded-full font-medium">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            <div 
              className={`flex-1 overflow-y-auto min-h-[200px] rounded-2xl p-3 border-2 transition-all duration-150 ${
                dragOverColumn === col.id
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-transparent bg-black/5 dark:bg-white/5'
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              {isLoading ? (
                <Loader />
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {tasks.filter((task) => task.status === col.id).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[120px] opacity-60 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl m-1 mt-2">
                      <p className="text-sm font-medium text-text-muted">Empty</p>
                      <p className="text-xs text-text-muted mt-1">Drop a task here</p>
                    </div>
                  ) : (
                    tasks
                      .filter((task) => task.status === col.id)
                      .map((task) => (
                        <motion.div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          layout
                        >
                          <TaskCard task={task} onClick={() => setSelectedTaskId(task.id)} />
                        </motion.div>
                      ))
                  )}
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskModal 
        isOpen={!!selectedTaskId} 
        onClose={() => setSelectedTaskId(null)} 
        taskId={selectedTaskId} 
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-color p-6 rounded-xl w-full max-w-md shadow-xl border border-border-color">
            <h2 className="text-xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Task Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project</label>
                  <select
                    required
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  >
                    <option value="" disabled>Select a Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Due Date</label>
                    <input 
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition-colors">
                  {createMutation.isPending ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Tasks;
