// User Types
export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  TEAM_MEMBER = 'TEAM_MEMBER',
  STAKEHOLDER = 'STAKEHOLDER',
  GUEST = 'GUEST',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  assignedTasks?: Task[];
}

// Task Types
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  BLOCKED = 'BLOCKED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// For backward compatibility
export const Priority = TaskPriority;

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL',
}

export enum TaskCategory {
  GENERAL = 'GENERAL',
  REPORTING = 'REPORTING',
  FINANCIAL = 'FINANCIAL',
  PROCUREMENT = 'PROCUREMENT',
  COMPLIANCE = 'COMPLIANCE',
  PUBLICITY = 'PUBLICITY',
  PARTNERSHIP = 'PARTNERSHIP',
  MONITORING = 'MONITORING',
}

export interface Task {
  id: string;
  externalId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  progress: number;
  deadline?: string;
  assigneeId?: string;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
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
  userId: string;
  user?: User;
  taskId?: string;
  task?: Task;
  createdAt: string;
}

// Compliance Types
export enum ComplianceType {
  VISUAL_IDENTITY = 'VISUAL_IDENTITY',
  SANCTIONS_LIST = 'SANCTIONS_LIST',
  GDPR = 'GDPR',
  PROCUREMENT = 'PROCUREMENT',
  FINANCIAL = 'FINANCIAL',
  REPORTING = 'REPORTING',
}

export enum ComplianceStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  PENDING = 'PENDING',
}

export interface ComplianceCheck {
  id: string;
  title: string;
  description?: string;
  type: ComplianceType;
  status: ComplianceStatus;
  dueDate?: string;
  assigneeId?: string;
  assignee?: User;
  createdAt: string;
  updatedAt: string;
}

// Document Types
export enum DocumentType {
  REPORT = 'REPORT',
  FINANCIAL = 'FINANCIAL',
  CONTRACT = 'CONTRACT',
  PRESENTATION = 'PRESENTATION',
  OTHER = 'OTHER',
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: DocumentType;
  url: string;
  uploaderId: string;
  uploader?: User;
  createdAt: string;
  updatedAt: string;
}

