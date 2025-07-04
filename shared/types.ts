// Database entity types (will be imported from backend)
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: number;
  title: string;
  description: string | null;
  isCompleted: boolean;
  projectId: number;
  finishDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Request types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  finishDate?: string; // ISO string
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  finishDate?: string; // ISO string
}

export interface ToggleTaskCompletionRequest {
  isCompleted: boolean;
}

// API Response types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// Extended types with relations for frontend use
export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

export interface TaskWithProject extends Task {
  project: Project;
}

// Utility types
export type CreateProjectData = Omit<Project, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type CreateTaskData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>;
export type UpdateProjectData = Partial<CreateProjectData>;
export type UpdateTaskData = Partial<Omit<CreateTaskData, 'projectId'>>;

// Auth types
export interface AuthUser {
  id: number;
  email: string;
  name: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
} 