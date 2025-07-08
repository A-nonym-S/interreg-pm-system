"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Calendar, 
  User
} from 'lucide-react';

// Status icon mapping
const statusIcons = {
  [TaskStatus.TODO]: <Clock className="h-5 w-5 text-yellow-500" />,
  [TaskStatus.IN_PROGRESS]: <AlertTriangle className="h-5 w-5 text-blue-500" />,
  [TaskStatus.DONE]: <CheckCircle className="h-5 w-5 text-green-500" />,
  [TaskStatus.BLOCKED]: <X className="h-5 w-5 text-red-500" />,
};

// Priority color mapping
const priorityColors = {
  [TaskPriority.LOW]: 'bg-green-500/10 text-green-500 border-green-500/20',
  [TaskPriority.MEDIUM]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  [TaskPriority.HIGH]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  [TaskPriority.URGENT]: 'bg-red-500/10 text-red-500 border-red-500/20',
};

// Category color mapping
const categoryColors = {
  [TaskCategory.REPORTING]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  [TaskCategory.FINANCIAL]: 'bg-green-500/10 text-green-500 border-green-500/20',
  [TaskCategory.TECHNICAL]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  [TaskCategory.ADMINISTRATIVE]: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  [TaskCategory.COMPLIANCE]: 'bg-red-500/10 text-red-500 border-red-500/20',
  [TaskCategory.COMMUNICATION]: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  [TaskCategory.PROCUREMENT]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  [TaskCategory.MONITORING]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  [TaskCategory.EVALUATION]: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  [TaskCategory.OTHER]: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };
  
  // Format deadline date if exists
  const formattedDeadline = task.dueDate 
    ? format(new Date(task.dueDate), 'dd. MM. yyyy', { locale: sk })
    : null;
  
  return (
    <Card 
      className="hover:border-primary/50 transition-all cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          {/* Task header with ID and category */}
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs font-mono">
                {`TASK-${task.id.substring(0, 8)}`}
              </Badge>
              <Badge className={`${categoryColors[task.category] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                {task.category}
              </Badge>
            </div>
            <Badge className={`${priorityColors[task.priority] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
              {task.priority}
            </Badge>
          </div>
          
          {/* Task title */}
          <h3 className="text-xl font-semibold">{task.title}</h3>
          
          {/* Task description (truncated) */}
          {task.description && (
            <p className="text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
          
          {/* Progress bar (if available) */}
          {task.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progres: {task.progress}%</span>
              </div>
              <Progress value={task.progress} className="h-1" />
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        {/* Assignee */}
        <div className="flex items-center space-x-2">
          {task.assignee ? (
            <>
              <Avatar className="h-6 w-6">
                {task.assignee.avatar ? (
                  <img src={task.assignee.avatar} alt={task.assignee.name} />
                ) : (
                  <div className="bg-primary/10 text-primary flex items-center justify-center h-full w-full text-xs">
                    {task.assignee.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </Avatar>
              <span className="text-sm text-muted-foreground">
                {task.assignee.name}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground flex items-center">
              <User className="h-4 w-4 mr-1" />
              Nepriradené
            </span>
          )}
        </div>
        
        {/* Deadline and status */}
        <div className="flex items-center space-x-3">
          {formattedDeadline && (
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDeadline}
            </span>
          )}
          
          {/* Status icon */}
          {statusIcons[task.status] || <Clock className="h-5 w-5 text-gray-500" />}
        </div>
      </CardFooter>
    </Card>
  );
}

