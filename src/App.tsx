import { useEffect, useState } from 'react';
import type { Task, TaskState } from './types';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import axios from 'axios';
import { Container, Typography, Paper } from '@mui/material';
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

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/todos?_limit=25').then((res) => {
      const apiTasks: Task[] = res.data.map((t: TodoTask) => ({
        id: t.id,
        text: t.title,
        completed: t.completed,
      }));
      setTasks(apiTasks);
    });
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
          <Typography
            variant="h1"
            gutterBottom>
            Task Tracker
          </Typography>
          <Typography
            variant="subtitle1"
            gutterBottom>
            Completed: {completedCount} / {tasks.length}
          </Typography>

          <TaskForm onAdd={addTask} />

          <TaskFilter
            filter={filter}
            setFilter={setFilter}
          />
          <TaskList
            tasks={filteredTasks}
            onToggle={toggleTask}
            onDelete={deleteTask}
          />
        </Paper>
      </Container>
    </>
  );
}

export default App;
