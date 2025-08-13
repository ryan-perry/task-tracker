import { useEffect, useState } from 'react';
import type { Task, TaskState } from './types';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import axios from 'axios';
import { Container, Typography, Paper, Alert, CircularProgress, Box } from '@mui/material';
import TaskFilter from './components/TaskFilter';

interface TodoTask {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<TaskState>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate “real world” latency (optional)
        await new Promise((r) => setTimeout(r, 2000));

        const res = await axios.get('https://jsonplaceholder.typicode.com/todos?_limit=10');

        if (cancelled) {
          return;
        }

        const apiTasks: Task[] = res.data.map((t: TodoTask) => ({
          id: t.id,
          text: t.title,
          completed: t.completed,
        }));

        setTasks(apiTasks);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message ?? 'Failed to load tasks.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
