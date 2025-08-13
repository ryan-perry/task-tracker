export interface Task {
  id: number;
  text: string;
  completed: boolean;
}

export type TaskState = 'all' | 'active' | 'done';