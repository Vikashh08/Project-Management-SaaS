import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import Loader from '../components/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Play, Square, Plus, Trash2, Timer, X
} from 'lucide-react';
import toast from 'react-hot-toast';

const formatDuration = (minutes) => {
  if (!minutes) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
};

const formatElapsed = (startTime) => {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  const s = Math.floor((diffMs % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// ── Active Timer Banner ──────────────────────────────────────────────────
const ActiveTimerBanner = ({ timer, onStop }) => {
  const [elapsed, setElapsed] = React.useState(() => timer ? formatElapsed(timer.startTime) : '00:00:00');

  React.useEffect(() => {
    if (!timer) return;
    setElapsed(formatElapsed(timer.startTime));
    const interval = setInterval(() => {
      setElapsed(formatElapsed(timer.startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  if (!timer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 flex items-center justify-between shadow-lg"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Timer className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium opacity-80">Timer Running</p>
          <p className="text-lg font-bold">{timer.task?.title || 'Unknown Task'}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-2xl font-mono font-bold tabular-nums">{elapsed}</span>
        <button
          onClick={onStop}
          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
        >
          <Square className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};

// ── Manual Log Modal ─────────────────────────────────────────────────────
const ManualLogModal = ({ tasks, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    taskId: '',
    hours: '',
    minutes: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post(`/timelogs/task/${data.taskId}`, {
      durationMinutes: (parseInt(data.hours || 0) * 60) + parseInt(data.minutes || 0),
      description: data.description,
      date: data.date
    }),
    onSuccess: () => { toast.success('Time logged!'); onSuccess(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to log time')
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-color p-6 rounded-2xl w-full max-w-md shadow-2xl border border-border-color"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-text-color">Log Time Manually</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!form.taskId) return toast.error('Select a task');
          const totalMin = (parseInt(form.hours || 0) * 60) + parseInt(form.minutes || 0);
          if (totalMin <= 0) return toast.error('Duration must be positive');
          mutation.mutate(form);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Task *</label>
            <select
              value={form.taskId}
              onChange={e => setForm({...form, taskId: e.target.value})}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a task...</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5">Hours</label>
              <input
                type="number" min="0" value={form.hours}
                onChange={e => setForm({...form, hours: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5">Minutes</label>
              <input
                type="number" min="0" max="59" value={form.minutes}
                onChange={e => setForm({...form, minutes: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="30"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Date</label>
            <input
              type="date" value={form.date}
              onChange={e => setForm({...form, date: e.target.value})}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <input
              type="text" value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="What were you working on?"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition-colors disabled:opacity-60">
              {mutation.isPending ? 'Saving...' : 'Log Time'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────
const Timesheet = () => {
  const queryClient = useQueryClient();
  const [showLogModal, setShowLogModal] = useState(false);

  const { data: activeTimer } = useQuery({
    queryKey: ['activeTimer'],
    queryFn: async () => {
      const { data } = await api.get('/timelogs/active');
      return data;
    },
    refetchInterval: 5000
  });

  const { data: myLogs = [], isLoading } = useQuery({
    queryKey: ['myTimeLogs'],
    queryFn: async () => {
      const { data } = await api.get('/timelogs/my');
      return data;
    }
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['allTasks'],
    queryFn: async () => {
      const { data } = await api.get('/tasks');
      return data;
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => api.put('/timelogs/stop'),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['activeTimer'] });
      const previousTimer = queryClient.getQueryData(['activeTimer']);
      queryClient.setQueryData(['activeTimer'], null);
      return { previousTimer };
    },
    onError: (err, variables, context) => {
      if (context?.previousTimer) {
        queryClient.setQueryData(['activeTimer'], context.previousTimer);
      }
      toast.error(err.response?.data?.message || 'Failed to stop');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
      queryClient.invalidateQueries({ queryKey: ['myTimeLogs'] });
    },
    onSuccess: () => {
      toast.success('Timer stopped!');
    }
  });

  const startMutation = useMutation({
    mutationFn: (taskId) => api.post(`/timelogs/task/${taskId}/start`),
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ['activeTimer'] });
      const previousTimer = queryClient.getQueryData(['activeTimer']);
      const task = tasks.find(t => t.id === taskId);
      queryClient.setQueryData(['activeTimer'], {
        id: 'optimistic-timer',
        startTime: new Date().toISOString(),
        taskId,
        task: task || { title: 'Starting...' }
      });
      return { previousTimer };
    },
    onError: (err, variables, context) => {
      if (context?.previousTimer !== undefined) {
        queryClient.setQueryData(['activeTimer'], context.previousTimer);
      }
      toast.error(err.response?.data?.message || 'Failed to start');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTimer'] });
    },
    onSuccess: () => {
      toast.success('Timer started!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/timelogs/${id}`),
    onSuccess: () => {
      toast.success('Entry deleted');
      queryClient.invalidateQueries(['myTimeLogs']);
    }
  });

  const handleLogSuccess = () => {
    setShowLogModal(false);
    queryClient.invalidateQueries(['myTimeLogs']);
  };

  // Group logs by date
  const groupedLogs = {};
  myLogs.forEach(log => {
    if (!log.endTime) return; // Skip running timers
    const dateKey = new Date(log.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (!groupedLogs[dateKey]) groupedLogs[dateKey] = { logs: [], totalMinutes: 0 };
    groupedLogs[dateKey].logs.push(log);
    groupedLogs[dateKey].totalMinutes += (log.durationMinutes || 0);
  });

  // Total time this week
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const weeklyMinutes = myLogs
    .filter(l => l.endTime && new Date(l.startTime) >= startOfWeek)
    .reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

  const totalMinutes = myLogs.filter(l => l.endTime).reduce((sum, l) => sum + (l.durationMinutes || 0), 0);

  if (isLoading) return <Loader text="Loading timesheet..." />;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-text-color">Timesheet</h1>
            <p className="text-text-muted text-sm mt-1">Track time spent on tasks with timers or manual entries.</p>
          </div>
          <button
            onClick={() => setShowLogModal(true)}
            className="saas-button flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log Time
          </button>
        </div>

        {/* Active Timer */}
        {activeTimer && (
          <ActiveTimerBanner
            timer={activeTimer}
            onStop={() => stopMutation.mutate()}
          />
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="saas-card p-5 text-center">
            <p className="text-sm text-text-muted mb-1">This Week</p>
            <p className="text-2xl font-bold text-primary">{formatDuration(weeklyMinutes)}</p>
          </div>
          <div className="saas-card p-5 text-center">
            <p className="text-sm text-text-muted mb-1">Total Logged</p>
            <p className="text-2xl font-bold text-text-color">{formatDuration(totalMinutes)}</p>
          </div>
          <div className="saas-card p-5 text-center">
            <p className="text-sm text-text-muted mb-1">Entries</p>
            <p className="text-2xl font-bold text-text-color">{myLogs.filter(l => l.endTime).length}</p>
          </div>
        </div>

        {/* Quick Start Timers */}
        {!activeTimer && tasks.length > 0 && (
          <div className="saas-card p-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Quick Start Timer</h2>
            <div className="flex flex-wrap gap-2">
              {tasks.slice(0, 8).map(task => (
                <button
                  key={task.id}
                  onClick={() => startMutation.mutate(task.id)}
                  disabled={startMutation.isPending}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-border-color rounded-lg text-sm hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-800 transition-colors group"
                >
                  <Play className="w-3.5 h-3.5 text-green-600 group-hover:scale-110 transition-transform" />
                  <span className="text-text-color max-w-[200px] truncate">{task.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Entries grouped by date */}
        {Object.keys(groupedLogs).length === 0 ? (
          <div className="saas-card p-10 text-center">
            <Clock className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-20" />
            <p className="font-medium text-text-color">No time entries yet</p>
            <p className="text-sm text-text-muted mt-1">Start a timer or log time manually to see your entries here.</p>
          </div>
        ) : (
          Object.entries(groupedLogs).map(([dateKey, { logs, totalMinutes: dayTotal }]) => (
            <motion.div key={dateKey} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="saas-card overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-border-color flex justify-between items-center">
                <span className="text-sm font-semibold text-text-color">{dateKey}</span>
                <span className="text-sm font-bold text-primary">{formatDuration(dayTotal)}</span>
              </div>
              <div className="divide-y divide-border-color">
                {logs.map(log => (
                  <div key={log.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-color truncate">{log.task?.title || 'Unknown Task'}</p>
                      <p className="text-xs text-text-muted">
                        {log.task?.project?.name && <span className="mr-2">{log.task.project.name}</span>}
                        {log.description && <span>· {log.description}</span>}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-text-color">{formatDuration(log.durationMinutes)}</p>
                      <p className="text-xs text-text-muted">
                        {new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' – '}
                        {new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(log.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showLogModal && (
          <ManualLogModal
            tasks={tasks}
            onClose={() => setShowLogModal(false)}
            onSuccess={handleLogSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Timesheet;
