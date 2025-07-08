// src/lib/api.ts
import { 
  Task, 
  User, 
  ComplianceCheck, 
  Activity, 
  ProjectTask, 
  ProjectDocument, 
  SubTask, 
  KanbanBoard 
} from '@/types';

// Base API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Generic fetch function with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred while fetching the data.');
  }

  return response.json();
}

// Task API
export const TaskAPI = {
  // Get all tasks with optional filters
  getTasks: (filters?: Record<string, string>) => {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    return fetchAPI<Task[]>(`/api/tasks${queryParams}`);
  },

  // Get a single task by ID
  getTask: (id: string) => {
    return fetchAPI<Task>(`/api/tasks/${id}`);
  },

  // Create a new task
  createTask: (task: Partial<Task>) => {
    return fetchAPI<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  // Update a task
  updateTask: (id: string, task: Partial<Task>) => {
    return fetchAPI<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(task),
    });
  },

  // Delete a task
  deleteTask: (id: string) => {
    return fetchAPI<{ success: boolean }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

// User API
export const UserAPI = {
  // Get all users with optional filters
  getUsers: (filters?: Record<string, string>) => {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    return fetchAPI<User[]>(`/api/users${queryParams}`);
  },

  // Get a single user by ID
  getUser: (id: string) => {
    return fetchAPI<User>(`/api/users/${id}`);
  },

  // Create a new user
  createUser: (user: Partial<User>) => {
    return fetchAPI<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  // Update a user
  updateUser: (id: string, user: Partial<User>) => {
    return fetchAPI<User>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(user),
    });
  },

  // Delete a user
  deleteUser: (id: string) => {
    return fetchAPI<{ success: boolean }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Compliance API
export const ComplianceAPI = {
  // Get all compliance checks with optional filters
  getComplianceChecks: (filters?: Record<string, string>) => {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    return fetchAPI<ComplianceCheck[]>(`/api/compliance${queryParams}`);
  },

  // Create a new compliance check
  createComplianceCheck: (check: Partial<ComplianceCheck>) => {
    return fetchAPI<ComplianceCheck>('/api/compliance', {
      method: 'POST',
      body: JSON.stringify(check),
    });
  },
};

// Activity API
export const ActivityAPI = {
  // Get all activities with optional filters
  getActivities: (filters?: Record<string, string>) => {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    return fetchAPI<Activity[]>(`/api/activities${queryParams}`);
  },
};

// Project Task API
export const ProjectTaskAPI = {
  // Get all project tasks with optional filters
  getProjectTasks: (filters?: Record<string, string>) => {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    return fetchAPI<ProjectTask[]>(`/api/project-tasks${queryParams}`);
  },

  // Get a single project task by ID
  getProjectTask: (id: string) => {
    return fetchAPI<ProjectTask>(`/api/project-tasks/${id}`);
  },

  // Create a new project task
  createProjectTask: (task: Partial<ProjectTask>) => {
    return fetchAPI<ProjectTask>('/api/project-tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  // Update a project task
  updateProjectTask: (id: string, task: Partial<ProjectTask>) => {
    return fetchAPI<ProjectTask>(`/api/project-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  },

  // Delete a project task
  deleteProjectTask: (id: string) => {
    return fetchAPI<{ success: boolean }>(`/api/project-tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Generate subtasks for a project task
  generateSubTasks: (id: string) => {
    return fetchAPI<{ message: string; subTasks: SubTask[] }>(`/api/project-tasks/${id}/generate-subtasks`, {
      method: 'POST',
    });
  },
};

// Project Document API
export const ProjectDocumentAPI = {
  // Get all project documents with optional filters
  getProjectDocuments: (filters?: Record<string, string>) => {
    const queryParams = filters
      ? `?${new URLSearchParams(filters).toString()}`
      : '';
    return fetchAPI<ProjectDocument[]>(`/api/project-documents${queryParams}`);
  },

  // Create a new project document
  createProjectDocument: (document: Partial<ProjectDocument>) => {
    return fetchAPI<ProjectDocument>('/api/project-documents', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  },
};

// Kanban API
export const KanbanAPI = {
  // Get kanban board data
  getKanbanBoard: () => {
    return fetchAPI<KanbanBoard>('/api/kanban');
  },
};

// Export all APIs
export const api = {
  tasks: TaskAPI,
  users: UserAPI,
  compliance: ComplianceAPI,
  activities: ActivityAPI,
  projectTasks: ProjectTaskAPI,
  projectDocuments: ProjectDocumentAPI,
  kanban: KanbanAPI,
};

