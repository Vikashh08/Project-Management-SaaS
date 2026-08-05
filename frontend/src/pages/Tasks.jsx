import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MessageSquare, Grid3X3, List, Columns3, Rows3, Filter, ArrowUpDown, Tag, MoreHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router';
import api from '../utils/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';
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
  CRITICAL: { label: 'Critical', bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50', dot: 'bg-red-500' },
  HIGH: { label: 'Important', bg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50', dot: 'bg-orange-500' },
  MEDIUM: { label: 'Medium', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50', dot: 'bg-blue-500' },
  LOW: { label: 'Low', bg: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700', dot: 'bg-gray-500' },
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
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
      className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl p-4 mb-3 cursor-grab active:cursor-grabbing group border border-gray-200 dark:border-gray-700/60 shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 transition-all duration-300 relative overflow-hidden"
      onClick={onClick}
    >
      {/* Top Row: Priority & Menu (mock) */}
      <div className="flex items-center justify-between mb-3">
        <PriorityBadge priority={task.priority} />
        <div className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-5 h-5" />
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-[15px] font-bold mb-4 text-gray-800 dark:text-gray-100 leading-snug group-hover:text-primary transition-colors line-clamp-2">
        {task.title}
      </h4>

      {/* Bottom Row: Avatars + Comments */}
      <div className="flex items-center justify-between mt-auto">
        {/* Avatar Stack */}
        <div className="flex items-center -space-x-2">
          {task.reporter && (
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 flex items-center justify-center overflow-hidden z-10" title={task.reporter.name}>
              {task.reporter.avatarUrl ? (
                <img src={task.reporter.avatarUrl} alt={task.reporter.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-gray-600">{task.reporter.name?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
            </div>
          )}
          {task.assignees?.slice(0, 2).map((assignee, i) => (
            <div key={assignee.id || i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-primary/20 text-primary flex items-center justify-center overflow-hidden z-20" title={assignee.name} style={{ zIndex: 20 + i }}>
              {assignee.avatarUrl ? (
                <img src={assignee.avatarUrl} alt={assignee.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold">{assignee.name?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
            </div>
          ))}
          {task.assignees?.length > 2 && (
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center justify-center text-[10px] font-bold z-30">
              +{task.assignees.length - 2}
            </div>
          )}
          {/* If no reporter or assignees, show a placeholder */}
          {!task.reporter && (!task.assignees || task.assignees.length === 0) && (
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 overflow-hidden z-10">
              <img src={`https://i.pravatar.cc/150?u=${task.id}`} alt="User" />
            </div>
          )}
        </div>

        {/* Comments Count */}
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-md text-xs font-semibold group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span>{task.comments?.length || 0}</span>
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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [teamIdForTasks, setTeamIdForTasks] = useState(initialTeamId);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [activeView, setActiveView] = useState('column');
  
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

  // The create task mutation is now handled inside CreateTaskModal.

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

  // Handler removed because CreateTaskModal handles creation

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 dark:border-gray-700/50 pb-5 gap-4 mt-2">
          <div className="flex p-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-xl shadow-inner w-full sm:w-auto overflow-x-auto">
            {viewTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 whitespace-nowrap ${
                  activeView === tab.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200/50 dark:border-gray-600'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
            <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </button>
            <PermissionGate allowedRoles={['SUPER_ADMIN', 'ORG_ADMIN', 'PROJECT_MANAGER', 'TEAM_LEAD', 'DEVELOPER', 'QA_TESTER']}>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto flex gap-6 pb-6 pt-6">
        {columns.map((col) => {
          const columnTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex-shrink-0 w-[340px] flex flex-col bg-gray-50/50 dark:bg-gray-800/20 rounded-[2rem] p-4 border border-gray-200/60 dark:border-gray-700/50 shadow-sm">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 px-2 pt-1">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3.5 h-3.5 rounded-full shadow-sm border border-black/10 dark:border-white/10" 
                    style={{ backgroundColor: col.dotColor }}
                  ></div>
                  <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-[16px] tracking-tight">{col.title}</h3>
                </div>
                <span className="flex items-center justify-center min-w-[28px] h-7 px-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm">
                  {columnTasks.length}
                </span>
              </div>

              {/* Task Cards Drop Zone */}
              <div 
                className={`flex-1 overflow-y-auto custom-scrollbar rounded-2xl transition-all duration-300 ease-in-out ${
                  dragOverColumn === col.id
                    ? 'ring-2 ring-primary bg-primary/5 scale-[1.02]'
                    : ''
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
                    className="pb-2"
                  >
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[140px] text-center border-2 border-dashed border-gray-200/60 dark:border-gray-700/60 rounded-2xl m-1 mt-2 bg-white/40 dark:bg-gray-900/40">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 shadow-inner">
                          <Plus className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No tasks here</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Drag and drop to add</p>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
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
      <CreateTaskModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        defaultProjectId={selectedProjectId || (projects[0]?.id || '')} 
      />
    </motion.div>
  );
};

export default Tasks;
