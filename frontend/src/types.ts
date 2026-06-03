// frontend/src/types.ts
// Shared types used across the frontend

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: string; // Backend: "todo" | "in-progress" | "completed"
  priority: string; // "Low" | "Medium" | "High"
  dueDate?: string;
  startDate?: string;
  estimatedTime?: number;
  estimatedEndDate?: string;
  actualEndDate?: string;
  assignedTo?: number;
  createdBy?: number;
  projectId?: number;
  assignedToUser?: { id: number; name: string; email: string };
  createdByUser?: { id: number; name: string; email: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  isPrivate: boolean;
  Users?: User[];
  totalTasks?: number;
  completedTasks?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Comment {
  id: number;
  text: string;
  taskId: number;
  userId: number;
  User?: { id: number; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  title: string;
  description: string;
  date: string;
  read: boolean;
  type?: string;
}

// Status display mapping
export const STATUS_MAP: Record<string, string> = {
  "todo": "To Do",
  "in-progress": "In Progress",
  "completed": "Done",
};

export const STATUS_REVERSE_MAP: Record<string, string> = {
  "To Do": "todo",
  "In Progress": "in-progress",
  "Done": "completed",
  "Completed": "completed",
};

export const displayStatus = (dbStatus: string): string => STATUS_MAP[dbStatus] || dbStatus;
export const toDbStatus = (displayStatus: string): string => STATUS_REVERSE_MAP[displayStatus] || displayStatus;
