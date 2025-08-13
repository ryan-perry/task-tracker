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

import { useTasks } from './hooks/useTasks';

function App() {
  const {
    filteredTasks,
    filter,
    setFilter,
    completedCount,
    loading,
    retrying,
    error,
    snackbar,
    handleCloseSnackbar,
    loadTasks,
    handleAddTask,
    handleToggleTask,
    handleDeleteTask,
  } = useTasks();

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
            Completed: {completedCount} / {filteredTasks.length}
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
