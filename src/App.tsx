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
  MenuItem,
  Pagination,
  Stack,
  TextField,
} from '@mui/material';
import TaskFilter from './components/TaskFilter';

import { useTasks } from './hooks/useTasks';

function App() {
  const {
    paginatedTasks,
    totalPages,
    page,
    setPage,
    perPage,
    setPerPage,
    search,
    setSearch,
    sortBy,
    setSortBy,
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

          {/* sort */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ mb: 2 }}>
            <TextField
              label="Search tasks"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
            <TextField
              label="Sort by"
              variant="outlined"
              value={sortBy}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(e) => setSortBy(e.target.value as any)}
              size="small"
              sx={{ minWidth: 140 }}>
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </TextField>
          </Stack>

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
            <>
              <TaskList
                tasks={paginatedTasks}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(e, val) => setPage(val)}
                    color="primary"
                  />
                </Box>
              )}

              {/* per page selector */}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <TextField
                  select
                  label="Tasks per page"
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                </TextField>
              </Box>
            </>
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
