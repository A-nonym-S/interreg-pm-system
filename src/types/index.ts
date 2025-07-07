// User Types
export enum UserRole {
  ADMIN = "ADMIN",
  PROJECT_MANAGER = "PROJECT_MANAGER",
  TEAM_MEMBER = "TEAM_MEMBER",
  STAKEHOLDER = "STAKEHOLDER",
  GUEST = "GUEST"
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Task Types
export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  BLOCKED = "BLOCKED"
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

export enum TaskCategory {
  REPORTING = "REPORTING",
  FINANCIAL = "FINANCIAL",
  TECHNICAL = "TECHNICAL",
  ADMINISTRATIVE = "ADMINISTRATIVE",
  COMPLIANCE = "COMPLIANCE",
  COMMUNICATION = "COMMUNICATION",
  PROCUREMENT = "PROCUREMENT",
  MONITORING = "MONITORING",
  EVALUATION = "EVALUATION",
  OTHER = "OTHER"
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assigneeId?: string;
  assignee?: User;
  createdById: string;
  createdBy?: User;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  attachments?: string[];
  comments?: Comment[];
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

// Activity Types
export enum ActivityType {
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_COMPLETED = "TASK_COMPLETED",
  TASK_ASSIGNED = "TASK_ASSIGNED",
  COMMENT_ADDED = "COMMENT_ADDED",
  COMPLIANCE_CHECK = "COMPLIANCE_CHECK"
}

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  user?: User;
  taskId?: string;
  task?: Task;
  description: string;
  createdAt: string;
}

// Compliance Types
export enum ComplianceCategory {
  VISUAL_IDENTITY = "VISUAL_IDENTITY",
  SANCTIONS_CHECK = "SANCTIONS_CHECK",
  GDPR = "GDPR",
  REPORTING = "REPORTING",
  FINANCIAL = "FINANCIAL"
}

export enum ComplianceStatus {
  COMPLIANT = "COMPLIANT",
  NON_COMPLIANT = "NON_COMPLIANT",
  PENDING_REVIEW = "PENDING_REVIEW",
  NEEDS_ACTION = "NEEDS_ACTION"
}

export interface ComplianceCheck {
  id: string;
  category: ComplianceCategory;
  status: ComplianceStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter Types
export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  category?: TaskCategory[];
  assigneeId?: string;
  search?: string;
  dueDate?: {
    from?: string;
    to?: string;
  };
}

export interface ComplianceFilter {
  category?: ComplianceCategory[];
  status?: ComplianceStatus[];
  search?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  complianceRate: number;
  recentActivities: Activity[];
}

// AI Types
export interface AIClassification {
  category: TaskCategory;
  priority: TaskPriority;
  suggestedAssigneeId?: string;
  confidence: number;
}

export interface AISummary {
  summary: string;
  keyPoints: string[];
  suggestedActions: string[];
}

// Agent Types
export interface AgentTask {
  id: string;
  type: string;
  status: string;
  data: any;
  result?: any;
  createdAt: string;
  updatedAt: string;
}

