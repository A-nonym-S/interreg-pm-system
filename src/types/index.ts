// User Types
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VIEWER = 'VIEWER'
}

export enum Language {
  SK = 'SK',
  EN = 'EN',
  HU = 'HU',
  UK = 'UK'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  language: Language;
  notifications: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Task Types
export enum TaskCategory {
  PUBLICITA = 'PUBLICITA',
  FINANCIE = 'FINANCIE',
  REPORTING = 'REPORTING',
  COMPLIANCE = 'COMPLIANCE',
  MONITORING = 'MONITORING',
  OBSTARAVANIE = 'OBSTARAVANIE',
  PARTNERSTVO = 'PARTNERSTVO',
  GENERAL = 'GENERAL'
}

export enum Priority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum Recurrence {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  AS_NEEDED = 'AS_NEEDED'
}

export interface Task {
  id: string;
  externalId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  status: TaskStatus;
  recurrence: Recurrence;
  deadline?: Date;
  assigneeId?: string;
  assignee?: User;
  creatorId: string;
  creator?: User;
  metadata?: Record<string, any>;
  complianceData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  subtasks?: Task[];
  parentTaskId?: string;
  parentTask?: Task;
  activities?: Activity[];
  documents?: Document[];
  comments?: Comment[];
}

// Activity Types
export enum ActivityType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  ASSIGNEE_CHANGED = 'ASSIGNEE_CHANGED'
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  userId: string;
  user?: User;
  taskId?: string;
  task?: Task;
  createdAt: Date;
}

// Document Types
export interface Document {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  taskId: string;
  task?: Task;
  uploadedBy: string;
  createdAt: Date;
  extractedText?: string;
  aiProcessed: boolean;
}

// Compliance Types
export enum ComplianceCategory {
  VISUAL_IDENTITY = 'VISUAL_IDENTITY',
  SANCTIONS_CHECK = 'SANCTIONS_CHECK',
  GDPR = 'GDPR',
  REPORTING = 'REPORTING',
  FINANCIAL = 'FINANCIAL'
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  NEEDS_ACTION = 'NEEDS_ACTION'
}

export interface ComplianceLog {
  id: string;
  action: string;
  category: ComplianceCategory;
  status: ComplianceStatus;
  details: Record<string, any>;
  performedBy: string;
  performedAt: Date;
  nextCheckDate?: Date;
}

// AI Types
export interface TaskClassification {
  category: TaskCategory;
  priority: Priority;
  confidence: number;
  suggestedAgent: string;
  keywords: string[];
  complianceFlags: string[];
}

export interface ExtractedTask {
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  deadline?: Date;
  assignee?: string;
  recurrence: Recurrence;
}

// Agent Types
export interface AgentResponse {
  status: 'processed' | 'blocked' | 'pending';
  reason?: string;
  actions?: AgentAction[];
  suggestedActions?: string[];
  nextSteps?: string[];
}

export interface AgentAction {
  type: string;
  platform?: string;
  scheduledFor?: Date;
  content?: string;
  metadata?: Record<string, any>;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  userId: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  url?: string;
}

// Dashboard Types
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  complianceRate: number;
  recentActivities: Activity[];
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  task?: Task;
  authorId: string;
  author?: User;
  createdAt: Date;
  updatedAt: Date;
}

