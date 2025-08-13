import { useEffect, useState } from 'react';
import type { Task, TaskState } from './types';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { Button, Container, Typography, Paper, Alert, CircularProgress, Box } from '@mui/material';
import TaskFilter from './components/TaskFilter';
import { fetchTasks } from './api';

const STORAGE_KEY = 'task-tracker';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskState>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const saveToStorage = (tasksToSave: Task[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
  };

  const loadFromStorage = (): Task[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiTasks = await fetchTasks(10);
      setTasks(apiTasks);
      saveToStorage(apiTasks);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load tasks.');
    } finally {
      setLoading(false);
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
  };

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
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
                  onClick={loadTasks}>
                  Retry
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
      </Container>
    </>
  );
}

export default App;
