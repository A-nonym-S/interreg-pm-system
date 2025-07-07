// User Types
export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  assignedTasks?: Task[];
  activities?: Activity[];
}

// Task Types
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum TaskCategory {
  PUBLICITA = 'PUBLICITA',
  FINANCIE = 'FINANCIE',
  REPORTING = 'REPORTING',
  COMPLIANCE = 'COMPLIANCE',
  MONITORING = 'MONITORING',
  OBSTARAVANIE = 'OBSTARAVANIE',
  PARTNERSTVO = 'PARTNERSTVO',
  GENERAL = 'GENERAL',
}

export interface Task {
  id: string;
  externalId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  startDate?: string;
  assigneeId?: string;
  assignee?: User;
  parentId?: string;
  parent?: Task;
  subtasks?: Task[];
  progress: number;
  estimatedHours?: number;
  actualHours?: number;
  activities?: Activity[];
  comments?: Comment[];
  documents?: Document[];
  compliance?: ComplianceCheck[];
}

// Activity Types
export enum ActivityType {
  TASK_CREATED = 'TASK_CREATED',
  TASK_UPDATED = 'TASK_UPDATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  COMMENT_ADDED = 'COMMENT_ADDED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  COMPLIANCE_CHECK = 'COMPLIANCE_CHECK',
  STATUS_CHANGED = 'STATUS_CHANGED',
}

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  userId: string;
  user?: User;
  taskId?: string;
  task?: Task;
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: User;
  taskId: string;
  task?: Task;
}

// Document Types
export enum DocumentCategory {
  REPORT = 'REPORT',
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  PRESENTATION = 'PRESENTATION',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER',
}

export interface Document {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  category: DocumentCategory;
  createdAt: string;
  updatedAt: string;
  taskId?: string;
  task?: Task;
}

// Compliance Types
export enum ComplianceCategory {
  VISUAL_IDENTITY = 'VISUAL_IDENTITY',
  SANCTIONS_CHECK = 'SANCTIONS_CHECK',
  GDPR = 'GDPR',
  REPORTING = 'REPORTING',
  FINANCIAL = 'FINANCIAL',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  NEEDS_ACTION = 'NEEDS_ACTION',
}

export interface ComplianceCheck {
  id: string;
  category: ComplianceCategory;
  status: ComplianceStatus;
  description?: string;
  details?: Record<string, any>;
  nextCheck?: string;
  lastCheck?: string;
  createdAt: string;
  updatedAt: string;
  taskId?: string;
  task?: Task;
}

// Project Settings
export interface ProjectSettings {
  id: string;
  key: string;
  value: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

