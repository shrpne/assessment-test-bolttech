import axios from 'axios';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  ProjectWithTasks,
  CreateProjectRequest,
  UpdateProjectRequest,
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  ToggleTaskCompletionRequest
} from '@shared/types';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Utility function to extract error message from axios error
export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // If the error has a response with data, try to extract the error message
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    // If it's a network error or other issue, provide a generic message
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      return 'Network error. Please check your connection.';
    }
    // For other HTTP errors, provide a generic message
    return `Request failed: ${error.response?.status || 'Unknown error'}`;
  }
  
  // For non-axios errors, return the error message or a fallback
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Auth token management
let authToken: string | null = localStorage.getItem('authToken');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize token if it exists
if (authToken) {
  setAuthToken(authToken);
}

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data!;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  }
};

// Projects API
export const projectsAPI = {
  getAll: async (): Promise<ProjectWithTasks[]> => {
    const response = await api.get<ApiResponse<ProjectWithTasks[]>>('/projects');
    return response.data.data!;
  },

  create: async (data: CreateProjectRequest): Promise<ProjectWithTasks> => {
    const response = await api.post<ApiResponse<ProjectWithTasks>>('/projects', data);
    return response.data.data!;
  },

  update: async (id: number, data: UpdateProjectRequest): Promise<ProjectWithTasks> => {
    const response = await api.put<ApiResponse<ProjectWithTasks>>(`/projects/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/projects/${id}`);
  }
};

// Tasks API
export const tasksAPI = {
  getByProject: async (projectId: number): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>(`/projects/${projectId}/tasks`);
    return response.data.data!;
  },

  create: async (projectId: number, data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>(`/projects/${projectId}/tasks`, data);
    return response.data.data!;
  },

  update: async (projectId: number, taskId: number, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}`, data);
    return response.data.data!;
  },

  toggleCompletion: async (projectId: number, taskId: number, data: ToggleTaskCompletionRequest): Promise<Task> => {
    const response = await api.patch<ApiResponse<Task>>(`/projects/${projectId}/tasks/${taskId}/toggle`, data);
    return response.data.data!;
  },

  delete: async (projectId: number, taskId: number): Promise<void> => {
    await api.delete<ApiResponse<null>>(`/projects/${projectId}/tasks/${taskId}`);
  }
};

export default api; 