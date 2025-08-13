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
import { fetchTasks } from './api';

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
      const apiTasks = await fetchTasks(10);
      setTasks(apiTasks);
      saveToStorage(apiTasks);
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

  // add task
  const addTask = (text: string) => {
    const newTask: Task = {
      id: Date.now(),
      text,
      completed: false,
    };

    setTasks((prev) => [...prev, newTask]);
    showToast('Task added', 'success');
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
    showToast('Task updated', 'info');
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    showToast('Task deleted', 'info');
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
          <TaskForm onAdd={addTask} />
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
              onToggle={toggleTask}
              onDelete={deleteTask}
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
