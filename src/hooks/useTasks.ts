import { useEffect, useMemo, useState } from 'react';
import type { Task, TaskState } from '../types';
import { fetchTasks, addTask, toggleTask, deleteTask } from '../api';

type Severity = 'success' | 'error' | 'info';

type SnackbarType = {
  open: boolean;
  message: string;
  severity: Severity;
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<boolean>(false);
  const [filter, setFilter] = useState<TaskState>('all');

  // snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarType>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showToast = (message: string, severity: Severity) => {
    setSnackbar({
      open: true,
      message,
      severity: severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const loadTasks = async (isRetry: boolean = false) => {
    try {
      if (isRetry) {
        setRetrying(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const apiTasks = await fetchTasks();
      setTasks(apiTasks);

      if (isRetry) {
        showToast('Tasks refreshed', 'success');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load tasks.');
    } finally {
      if (isRetry) {
        setRetrying(false);
      } else {
        setLoading(false);
      }
    }
  };

  // load from storage first, then try fetching
  useEffect(() => {
    loadTasks();
  }, []);

  const handleAddTask = async (text: string) => {
    const tempId = Date.now();
    const optimisticTask: Task = {
      id: tempId,
      text,
      completed: false,
    };
    setTasks((prev) => [...prev, optimisticTask]);
    showToast('Task added', 'success');

    try {
      const newTask = await addTask(text);
      // replace temporary task id with real one from server
      setTasks((prev) => prev.map((t) => (t.id === tempId ? newTask : t)));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message);
      // rollback on failure
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
      showToast('Failed to add task', 'error');
    }
  };

  const handleToggleTask = async (id: number) => {
    const prevTasks = [...tasks];
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      return;
    }

    // update instantly
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    showToast('Task updated', 'info');

    try {
      await toggleTask(id, !task.completed);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      // rollback
      setError(e.message);
      setTasks(prevTasks);
      showToast('Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (id: number) => {
    const prevTasks = [...tasks];

    // remove immediately
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task deleted', 'info');

    try {
      await deleteTask(id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e.message);
      // rollback
      setTasks(prevTasks);
      showToast('Failed to delete task', 'error');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'active') {
        return !task.completed;
      }
      if (filter === 'done') {
        return task.completed;
      }
      return true;
    });
  }, [tasks, filter]);

  const completedCount = useMemo(() => {
    return tasks.filter((t) => t.completed).length;
  }, [tasks]);

  return {
    tasks,
    filteredTasks,
    filter,
    setFilter,
    completedCount,
    loading,
    retrying,
    error,
    snackbar,
    showToast,
    handleCloseSnackbar,
    loadTasks,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
  };
}
