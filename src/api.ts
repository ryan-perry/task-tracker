import axios from "axios";
import type { Task } from "./types";

const API_URL = 'http://localhost:3001';

export async function fetchTasks() : Promise<Task[]> {
  const res = await axios.get(`${API_URL}/tasks`);
  return res.data;
}

export async function addTask(text: string): Promise<Task> {
  const newTask = {
      text,
      completed: false
  };
  const res = await axios.post(`${API_URL}/tasks`, newTask);
  return res.data;
}

export async function toggleTask(id: number, completed: boolean): Promise<Task> {
  const res = await axios.patch(`${API_URL}/tasks/${id}`, { completed });
  return res.data;
}

export async function deleteTask(id: number): Promise<void> {
  await axios.delete(`${API_URL}/tasks/${id}`);
}