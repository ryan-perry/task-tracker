import type { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export default function TaskList({ tasks, onToggle, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return <p>No tasks yet</p>;
  }

  return (
    <>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <span
              style={{
                textDecoration: task.completed ? 'line-through' : 'none',
                cursor: 'pointer',
              }}
              onClick={() => onToggle(task.id)}>
              {task.text}
            </span>
            <button
              type="button"
              onClick={() => onDelete(task.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
