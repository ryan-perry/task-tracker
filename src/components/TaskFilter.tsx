import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { TaskState } from '../types';

interface TaskFilterProps {
  filter: TaskState;
  setFilter: (filter: TaskState) => void;
}

export default function TaskFilter({ filter, setFilter }: TaskFilterProps) {
  return (
    <>
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, value) => value && setFilter(value)}
        sx={{ mb: 2 }}>
        <ToggleButton value="all">All</ToggleButton>
        <ToggleButton value="active">Active</ToggleButton>
        <ToggleButton value="done">Done</ToggleButton>
      </ToggleButtonGroup>
    </>
  );
}
