import axios from "axios";
import type { Task } from "./types";

interface TodoTask {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export async function fetchTasks(limit: number = 5): Promise<Task[]> {
  // Simulate “real world” latency
        await new Promise((r) => setTimeout(r, 2000));
  const res = await axios.get(`https://jsonplaceholder.typicode.com/todos?_limit=${limit}`);

  return res.data.map((t: TodoTask) => ({
    id: t.id,
    text: t.title,
    completed: t.completed,
  }));
}