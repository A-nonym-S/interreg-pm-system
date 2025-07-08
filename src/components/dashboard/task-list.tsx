"use client";

import { useState, useEffect } from 'react';
import { TaskCard } from './task-card';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Filter, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  X 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TaskListProps {
  initialTasks?: Task[];
  title?: string;
  showFilters?: boolean;
  limit?: number;
}

export function TaskList({ 
  initialTasks, 
  title = "Úlohy", 
  showFilters = true,
  limit = 10
}: TaskListProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [loading, setLoading] = useState(!initialTasks);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  
  // Fetch tasks if not provided
  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Build filter object
      const filters: Record<string, string> = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      
      const data = await api.tasks.getTasks(filters);
      setTasks(data.slice(0, limit));
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Nepodarilo sa načítať úlohy. Skúste to znova neskôr.');
    } finally {
      setLoading(false);
    }
  };
  
  // Status filter options with icons
  const statusOptions = [
    { value: 'ALL', label: 'Všetky', icon: <Filter className="h-4 w-4" /> },
    { value: TaskStatus.TODO, label: 'Čakajúce', icon: <Clock className="h-4 w-4" /> },
    { value: TaskStatus.IN_PROGRESS, label: 'V procese', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: TaskStatus.DONE, label: 'Dokončené', icon: <CheckCircle className="h-4 w-4" /> },
    { value: TaskStatus.BLOCKED, label: 'Blokované', icon: <X className="h-4 w-4" /> },
  ];
  
  const handleCreateTask = () => {
    router.push('/tasks/create');
  };
  
  const handleTaskClick = (task: Task) => {
    router.push(`/tasks/${task.id}`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{title}</h2>
        
        <div className="flex space-x-2">
          {showFilters && (
            <div className="flex space-x-1">
              {/* Status filter */}
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(option.value as TaskStatus | 'ALL')}
                  className="flex items-center gap-1"
                >
                  {option.icon}
                  <span className="hidden md:inline">{option.label}</span>
                </Button>
              ))}
            </div>
          )}
          
          {/* New task button */}
          <Button className="flex items-center gap-1" onClick={handleCreateTask}>
            <Plus className="h-4 w-4" />
            <span>Nová úloha</span>
          </Button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        /* Task list */
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={handleTaskClick} />
            ))
          ) : (
            <div className="bg-muted/30 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">Žiadne úlohy neboli nájdené.</p>
              <Button variant="outline" className="mt-4" onClick={handleCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Vytvoriť novú úlohu
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

