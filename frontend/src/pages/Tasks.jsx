import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, MessageSquare, Paperclip } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

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

const TaskCard = ({ task }) => {
  return (
    <div className="bg-surface-color p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-3 cursor-pointer hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-2">
        <PriorityBadge priority={task.priority} />
        <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <h4 className="text-sm font-semibold mb-3 text-text-color">{task.title}</h4>
      <div className="flex items-center justify-between text-text-muted text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{task.comments?.length || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Paperclip className="w-3.5 h-3.5" />
            <span>{task.attachments?.length || 0}</span>
          </div>
        </div>
        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
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
  const [showModal, setShowModal] = useState(false);
  const [projectId, setProjectId] = useState('temp_project_id'); // We'd normally get this from context or route params
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM' });

  // For demo, we just fetch all tasks. In a real app, we'd pass projectId: `?projectId=${projectId}`
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.get('/tasks');
      return data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (taskData) => {
      return api.post('/tasks', { ...taskData, projectId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      setShowModal(false);
      setNewTask({ title: '', description: '', priority: 'MEDIUM' });
      toast.success('Task created!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(newTask);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-color">Kanban Board</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </button>
      </div>

      <div className="flex-1 overflow-x-auto flex space-x-6 pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col">
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg mb-4 ${col.color}`}>
              <h3 className="font-semibold text-sm">{col.title}</h3>
              <span className="bg-white/50 dark:bg-black/20 text-xs px-2 py-0.5 rounded-full font-medium">
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto min-h-[200px] bg-gray-50/50 dark:bg-gray-800/20 rounded-xl p-2 border border-dashed border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
              {isLoading ? (
                <div className="text-xs text-center mt-4 text-gray-400">Loading...</div>
              ) : (
                tasks
                  .filter((task) => task.status === col.id)
                  .map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-color p-6 rounded-xl w-full max-w-md shadow-xl">
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
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project ID</label>
                  <input 
                    type="text" 
                    required
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                    placeholder="Enter valid Project ID from DB"
                  />
                  <p className="text-xs text-text-muted mt-1">Requires a valid Project ID from the DB.</p>
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

export default Tasks;
