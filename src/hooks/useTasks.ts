import { useEffect, useMemo, useState } from 'react';
import type { Task, TaskState } from '../types';
import { fetchTasks, addTask, toggleTask, deleteTask } from '../api';

type Severity = 'success' | 'error' | 'info';
type Sort = 'newest' | 'oldest' | 'completed' | 'pending';

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
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<Sort>('newest');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

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
    let filtered = tasks;

    // filter
    if (filter === 'active') {
      filtered = filtered.filter((t) => !t.completed);
    }
    if (filter === 'done') {
      filtered = filtered.filter((t) => t.completed);
    }

    // search
    if (search.trim() !== '') {
      const lower = search.toLowerCase();
      filtered = filtered.filter((t) => t.text.toLowerCase().includes(lower));
    }

    // sort
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.id - a.id;
        case 'oldest':
          return a.id - b.id;
        case 'completed':
          return Number(a.completed) - Number(b.completed);
        case 'pending':
          return Number(b.completed) - Number(a.completed);
        default:
          return 0;
      }
    });

    return filtered;
  }, [tasks, filter, search, sortBy]);

  // pagination
  const paginatedTasks = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredTasks.slice(start, start + perPage);
  }, [filteredTasks, page, perPage]);

  const totalPages = Math.ceil(filteredTasks.length / perPage);

  const completedCount = useMemo(() => {
    return tasks.filter((t) => t.completed).length;
  }, [tasks]);

  return {
    tasks,
    filteredTasks,
    filter,
    setFilter,
    page,
    totalPages,
    setPage,
    perPage,
    setPerPage,
    paginatedTasks,
    search,
    setSearch,
    sortBy,
    setSortBy,
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
