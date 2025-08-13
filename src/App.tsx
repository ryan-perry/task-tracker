import { useEffect, useState } from 'react';
import type { Task, TaskState } from './types';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import {
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Box,
  Snackbar,
} from '@mui/material';
import TaskFilter from './components/TaskFilter';
import { fetchTasks, addTask, toggleTask, deleteTask } from './api';

const STORAGE_KEY = 'task-tracker';

type Severity = 'success' | 'error' | 'info';

interface SnackbarSettings {
  open: boolean;
  message: string;
  severity: Severity;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskState>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<boolean>(false);

  // snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarSettings>({
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

  const saveToStorage = (tasksToSave: Task[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
  };

  const loadFromStorage = (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
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
      saveToStorage(apiTasks);
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
    const storedTasks = loadFromStorage();

    if (storedTasks.length > 0) {
      setTasks(storedTasks);
      setLoading(false);
    }
    loadTasks();
  }, []);

  // keep storage in sync when tasks change
  useEffect(() => {
    saveToStorage(tasks);
  }, [tasks]);

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

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') {
      return !task.completed;
    }
    if (filter === 'done') {
      return task.completed;
    }

    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <>
      <Container
        maxWidth="md"
        sx={{ mt: 5 }}>
        <Paper sx={{ p: 3 }}>
          {/* title */}
          <Typography
            variant="h1"
            gutterBottom>
            Task Tracker
          </Typography>

          {/*  */}
          <Typography
            variant="subtitle1"
            gutterBottom>
            Completed: {completedCount} / {tasks.length}
          </Typography>

          {/* error */}
          {error && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => loadTasks(true)}
                  disabled={retrying}>
                  {retrying ? (
                    <CircularProgress
                      size={16}
                      color="inherit"
                    />
                  ) : (
                    'Retry'
                  )}
                </Button>
              }
              sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/*   */}
          <TaskForm onAdd={handleAddTask} />
          <TaskFilter
            filter={filter}
            setFilter={setFilter}
          />

          {/* loading */}
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 4,
              }}>
              <CircularProgress />
            </Box>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
            />
          )}
        </Paper>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}

export default App;
