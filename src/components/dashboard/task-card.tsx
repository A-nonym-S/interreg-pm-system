"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CustomAvatar } from "@/components/ui/avatar";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { 
  Clock, 
  ArrowRight, 
  XCircle, 
  CheckCircle, 
  Calendar,
  User,
  AlertTriangle,
  MoreHorizontal
} from "lucide-react";
import type { Task, TaskStatus, Priority, TaskCategory } from "@/types";

interface TaskCardProps {
  task: Partial<Task> & {
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
    category: TaskCategory;
  };
  onSelect?: (task: TaskCardProps['task']) => void;
  selected?: boolean;
  showProgress?: boolean;
  compact?: boolean;
}

const priorityConfig = {
  CRITICAL: {
    variant: "critical" as const,
    label: "Kritická",
    color: "text-red-500 bg-red-500/10 border-red-500/20"
  },
  HIGH: {
    variant: "high" as const,
    label: "Vysoká",
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20"
  },
  MEDIUM: {
    variant: "medium" as const,
    label: "Stredná",
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
  },
  LOW: {
    variant: "low" as const,
    label: "Nízka",
    color: "text-gray-500 bg-gray-500/10 border-gray-500/20"
  }
};

const statusConfig = {
  PENDING: {
    icon: Clock,
    label: "Čaká",
    variant: "pending" as const,
    color: "text-semantic-warning"
  },
  IN_PROGRESS: {
    icon: ArrowRight,
    label: "Prebieha",
    variant: "in-progress" as const,
    color: "text-blue-500"
  },
  BLOCKED: {
    icon: XCircle,
    label: "Blokovaná",
    variant: "blocked" as const,
    color: "text-semantic-error"
  },
  COMPLETED: {
    icon: CheckCircle,
    label: "Dokončená",
    variant: "completed" as const,
    color: "text-semantic-success"
  },
  CANCELLED: {
    icon: XCircle,
    label: "Zrušená",
    variant: "cancelled" as const,
    color: "text-gray-500"
  }
};

const categoryConfig = {
  PUBLICITA: { label: "Publicita", variant: "publicita" as const },
  FINANCIE: { label: "Financie", variant: "financie" as const },
  REPORTING: { label: "Reporting", variant: "reporting" as const },
  COMPLIANCE: { label: "Compliance", variant: "compliance" as const },
  MONITORING: { label: "Monitoring", variant: "monitoring" as const },
  OBSTARAVANIE: { label: "Obstarávanie", variant: "obstaravanie" as const },
  PARTNERSTVO: { label: "Partnerstvo", variant: "partnerstvo" as const },
  GENERAL: { label: "Všeobecné", variant: "general" as const }
};

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onSelect, 
  selected = false,
  showProgress = true,
  compact = false
}) => {
  const StatusIcon = statusConfig[task.status].icon;
  const priorityInfo = priorityConfig[task.priority];
  const statusInfo = statusConfig[task.status];
  const categoryInfo = categoryConfig[task.category];

  // Mock data for demonstration
  const mockAssignee = task.assigneeId ? {
    id: task.assigneeId,
    name: "Mária Novák",
    avatar: undefined
  } : undefined;

  const mockProgress = task.status === 'COMPLETED' ? 100 : 
                      task.status === 'IN_PROGRESS' ? 65 : 
                      task.status === 'BLOCKED' ? 30 : 0;

  const mockSubtasks = task.status !== 'PENDING' ? {
    total: 5,
    completed: task.status === 'COMPLETED' ? 5 : 
               task.status === 'IN_PROGRESS' ? 3 : 
               task.status === 'BLOCKED' ? 1 : 0
  } : undefined;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect?.(task)}
      className="cursor-pointer"
    >
      <Card
        className={cn(
          "p-5 hover:bg-dark-bg-elevated hover:border-dark-border-strong transition-all duration-200",
          selected && "ring-2 ring-brand-primary ring-offset-2 ring-offset-dark-bg-primary",
          compact && "p-4"
        )}
        hover
        interactive
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Badge variant={priorityInfo.variant} size="sm">
              {priorityInfo.label}
            </Badge>
            <Badge variant={categoryInfo.variant} size="sm">
              {categoryInfo.label}
            </Badge>
            {task.externalId && (
              <span className="text-xs text-dark-text-tertiary font-mono">
                {task.externalId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusIcon className={cn("w-5 h-5", statusInfo.color)} />
            <button className="p-1 hover:bg-dark-bg-hover rounded">
              <MoreHorizontal className="w-4 h-4 text-dark-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="font-semibold text-dark-text-primary leading-tight">
            {task.title}
          </h3>
          
          {task.description && !compact && (
            <p className="text-sm text-dark-text-secondary line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Progress */}
          {showProgress && mockSubtasks && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-dark-text-secondary">
                  Podúlohy: {mockSubtasks.completed}/{mockSubtasks.total}
                </span>
                <span className="text-dark-text-primary font-medium">
                  {Math.round((mockSubtasks.completed / mockSubtasks.total) * 100)}%
                </span>
              </div>
              <Progress 
                value={mockSubtasks.completed} 
                max={mockSubtasks.total}
                size="sm"
                variant={task.status === 'COMPLETED' ? 'success' : 
                        task.status === 'BLOCKED' ? 'error' : 'default'}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-border-subtle">
          <div className="flex items-center gap-4">
            {mockAssignee && (
              <div className="flex items-center gap-2">
                <CustomAvatar 
                  src={mockAssignee.avatar} 
                  name={mockAssignee.name}
                  size="sm"
                />
                {!compact && (
                  <span className="text-xs text-dark-text-tertiary">
                    {mockAssignee.name}
                  </span>
                )}
              </div>
            )}
            
            {!mockAssignee && (
              <div className="flex items-center gap-2 text-dark-text-muted">
                <User className="w-4 h-4" />
                {!compact && (
                  <span className="text-xs">Nepriradené</span>
                )}
              </div>
            )}
          </div>

          {task.deadline && (
            <div className="flex items-center gap-1 text-xs text-dark-text-tertiary">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(new Date(task.deadline), 'short')}</span>
            </div>
          )}
        </div>

        {/* Urgency Indicator */}
        {task.priority === 'CRITICAL' && task.status !== 'COMPLETED' && (
          <div className="mt-3 pt-3 border-t border-dark-border-subtle">
            <div className="flex items-center gap-2 text-semantic-error">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-medium">Vyžaduje okamžitú pozornosť</span>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

