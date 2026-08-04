import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MessageSquare, Grid3X3, List, Columns3, Rows3, Filter, ArrowUpDown, Tag } from 'lucide-react';
import { useSearchParams } from 'react-router';
import api from '../utils/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';
import { useSocket } from '../context/SocketContext';
import PermissionGate from '../components/PermissionGate';
import Loader from '../components/Loader';

const columns = [
  { id: 'TODO', title: 'To Do', dotColor: '#eab308', btnGradient: 'from-yellow-400 to-amber-500', bgClass: 'kanban-column-todo' },
  { id: 'IN_PROGRESS', title: 'In Progress', dotColor: '#f97316', btnGradient: 'from-orange-400 to-orange-500', bgClass: 'kanban-column-inprogress' },
  { id: 'REVIEW', title: 'Review', dotColor: '#a855f7', btnGradient: 'from-purple-400 to-purple-500', bgClass: 'kanban-column-review' },
  { id: 'DONE', title: 'Completed', dotColor: '#22c55e', btnGradient: 'from-green-400 to-emerald-500', bgClass: 'kanban-column-done' },
];

const priorityConfig = {
  CRITICAL: { label: 'Critical', className: 'priority-label priority-critical' },
  HIGH: { label: 'Important', className: 'priority-label priority-high' },
  MEDIUM: { label: 'OK', className: 'priority-label priority-medium' },
  LOW: { label: 'Meh', className: 'priority-label priority-low' },
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;
  return (
    <span className={config.className}>
      {config.label}
    </span>
  );
};

const viewTabs = [
  { id: 'grid', label: 'Grid View', icon: Grid3X3 },
  { id: 'list', label: 'List View', icon: List },
  { id: 'column', label: 'Column View', icon: Columns3 },
  { id: 'row', label: 'Row View', icon: Rows3 },
];

const TaskCard = ({ task, onClick }) => {
  return (
    <div 
      className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 cursor-grab active:cursor-grabbing group border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
      onClick={onClick}
    >
      {/* Priority Label */}
      <div className="mb-3">
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold mb-3 text-text-color leading-snug group-hover:text-primary transition-colors">
        {task.title}
      </h4>

      {/* Bottom Row: Avatars + Comments */}
      <div className="flex items-center justify-between">
        {/* Avatar Stack */}
        <div className="avatar-stack">
          {task.reporter && (
            <div className="avatar-item" title={task.reporter.name}>
              {task.reporter.avatarUrl ? (
                <img src={task.reporter.avatarUrl} alt={task.reporter.name} />
              ) : (
                <span>{task.reporter.name?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
            </div>
          )}
          {task.assignees?.slice(0, 2).map((assignee, i) => (
            <div key={assignee.id || i} className="avatar-item" title={assignee.name}>
              {assignee.avatarUrl ? (
                <img src={assignee.avatarUrl} alt={assignee.name} />
              ) : (
                <span>{assignee.name?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
            </div>
          ))}
          {task.assignees?.length > 2 && (
            <div className="avatar-overflow">
              +{task.assignees.length - 2}
            </div>
          )}
          {/* If no reporter or assignees, show a placeholder */}
          {!task.reporter && (!task.assignees || task.assignees.length === 0) && (
            <div className="avatar-item">
              <img src={`https://i.pravatar.cc/150?u=${task.id}`} alt="User" />
            </div>
          )}
        </div>

        {/* Comments Count */}
        <div className="flex items-center gap-1.5 text-text-muted">
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{task.comments?.length || 0}</span>
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
  const [activeView, setActiveView] = useState('column');
  
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

  // Get current project name
  const currentProject = projects.find(p => p.id === selectedProjectId);
  const projectName = currentProject?.name || 'All Projects';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 lg:p-6 h-full flex flex-col"
    >
      {/* Page Header */}
      <div className="mb-4">
        {/* Project Title + Label */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <h1 className="text-2xl lg:text-3xl font-bold text-text-color tracking-tight">{projectName}</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 rounded-full">
              Label
            </span>
          </div>
          {/* Project Selector */}
          <select 
            value={selectedProjectId}
            onChange={(e) => { setSelectedProjectId(e.target.value); setTeamIdForTasks(''); }}
            className="ml-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-text-muted font-medium rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none cursor-pointer transition-all"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* View Tabs + Filter/Sort */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-0 overflow-x-auto">
            {viewTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`view-tab ${activeView === tab.id ? 'active' : ''}`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-muted hover:text-text-color hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-muted hover:text-text-color hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto flex gap-5 pb-4">
        {columns.map((col) => {
          const columnTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex-shrink-0 w-[300px] lg:w-[320px] flex flex-col">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: col.dotColor }}
                  ></div>
                  <h3 className="font-bold text-text-color text-sm">{col.title}</h3>
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {columnTasks.length} Total
                </span>
              </div>

              {/* Add New Task Button */}
              <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'QA_TESTER']}>
                <button
                  onClick={() => {
                    setNewTask(prev => ({ ...prev, projectId: selectedProjectId || (projects[0]?.id || '') }));
                    setShowModal(true);
                  }}
                  className={`w-full mb-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r ${col.btnGradient} hover:opacity-90 transition-all shadow-md active:scale-[0.98]`}
                >
                  <Plus className="w-4 h-4" />
                  Add New Task
                </button>
              </PermissionGate>

              {/* Task Cards Drop Zone */}
              <div 
                className={`flex-1 overflow-y-auto custom-scrollbar rounded-2xl p-2.5 transition-all duration-200 ${
                  dragOverColumn === col.id
                    ? 'ring-2 ring-primary bg-primary/5 scale-[1.01]'
                    : 'bg-gray-50/70 dark:bg-gray-800/30'
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
                  >
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[120px] opacity-50 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl m-1 mt-2">
                        <p className="text-sm font-medium text-text-muted">Empty</p>
                        <p className="text-xs text-text-muted mt-1">Drop a task here</p>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.015 }}
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
          );
        })}
      </div>

      {/* Task Detail Modal */}
      <TaskModal 
        isOpen={!!selectedTaskId} 
        onClose={() => setSelectedTaskId(null)} 
        taskId={selectedTaskId} 
      />

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-surface-color p-6 rounded-2xl w-full max-w-md shadow-2xl border border-border-color"
          >
            <h2 className="text-xl font-bold mb-4 text-text-color">Create New Task</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-text-color">Task Title</label>
                  <input 
                    type="text" 
                    required
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm"
                    placeholder="Enter task title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-text-color">Project</label>
                  <select
                    required
                    value={newTask.projectId}
                    onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm"
                  >
                    <option value="" disabled>Select a Project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-text-color">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm"
                    >
                      <option value="LOW">Low (Meh)</option>
                      <option value="MEDIUM">Medium (OK)</option>
                      <option value="HIGH">High (Important)</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-text-color">Due Date</label>
                    <input 
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending} 
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold transition-all text-sm shadow-lg shadow-primary/20"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Tasks;
