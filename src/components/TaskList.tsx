import type { Task } from '../types';
import { IconButton, List, ListItem, ListItemText, Checkbox, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <Typography variant="body2">No tasks to show.</Typography>;
  }

  return (
    <>
      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => onDelete(task.id)}>
                <DeleteIcon />
              </IconButton>
            }>
            <Checkbox
              checked={task.completed}
              onChange={() => onToggle(task.id)}
            />
            <ListItemText
              primary={task.text}
              sx={{ textDecoration: task.completed ? 'line-through' : 'none', fontStyle: 'italic' }}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
}
