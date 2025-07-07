"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Task, TaskStatus, Priority, TaskCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  X,
  MessageSquare,
  FileText,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

// Status icon mapping
const statusIcons = {
  [TaskStatus.PENDING]: <Clock className="h-5 w-5 text-yellow-500" />,
  [TaskStatus.IN_PROGRESS]: <AlertTriangle className="h-5 w-5 text-blue-500" />,
  [TaskStatus.COMPLETED]: <CheckCircle className="h-5 w-5 text-green-500" />,
  [TaskStatus.BLOCKED]: <X className="h-5 w-5 text-red-500" />,
  [TaskStatus.CANCELLED]: <X className="h-5 w-5 text-gray-500" />,
};

// Priority color mapping
const priorityColors = {
  [Priority.LOW]: 'bg-green-500/10 text-green-500 border-green-500/20',
  [Priority.MEDIUM]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  [Priority.HIGH]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  [Priority.CRITICAL]: 'bg-red-500/10 text-red-500 border-red-500/20',
};

// Category color mapping
const categoryColors = {
  [TaskCategory.PUBLICITA]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  [TaskCategory.FINANCIE]: 'bg-green-500/10 text-green-500 border-green-500/20',
  [TaskCategory.REPORTING]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  [TaskCategory.COMPLIANCE]: 'bg-red-500/10 text-red-500 border-red-500/20',
  [TaskCategory.MONITORING]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  [TaskCategory.OBSTARAVANIE]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  [TaskCategory.PARTNERSTVO]: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  [TaskCategory.GENERAL]: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchTask();
  }, [taskId]);
  
  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await api.tasks.getTask(taskId);
      setTask(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Nepodarilo sa načítať úlohu. Skúste to znova neskôr.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'dd. MMMM yyyy', { locale: sk });
    } catch (error) {
      return 'Neplatný dátum';
    }
  };
  
  // For demo purposes, if no data is available yet
  useEffect(() => {
    if (loading && !task) {
      // Simulate API response with mock data
      setTimeout(() => {
        setTask({
          id: taskId,
          externalId: 'TASK-2025-01-0001',
          title: 'Mesačný report pre INTERREG+',
          description: 'Príprava a odoslanie mesačného reportu pokroku projektu do systému INTERREG+',
          status: TaskStatus.COMPLETED,
          priority: Priority.HIGH,
          category: TaskCategory.REPORTING,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-15T14:30:00Z',
          deadline: '2025-01-15T23:59:59Z',
          assigneeId: 'user1',
          assignee: {
            id: 'user1',
            name: 'Mária Novák',
            email: 'maria.novak@example.com',
            role: UserRole.PROJECT_MANAGER,
            createdAt: '2024-12-01T00:00:00Z',
          },
          progress: 100,
          estimatedHours: 10,
          actualHours: 8,
          activities: [
            {
              id: 'act1',
              type: ActivityType.TASK_COMPLETED,
              description: 'dokončila úlohu "Mesačný report pre INTERREG+"',
              createdAt: '2025-01-15T14:30:00Z',
              userId: 'user1',
              user: {
                id: 'user1',
                name: 'Mária Novák',
                email: 'maria.novak@example.com',
                role: UserRole.PROJECT_MANAGER,
                createdAt: '2024-12-01T00:00:00Z',
              },
              taskId: taskId,
            },
            {
              id: 'act2',
              type: ActivityType.STATUS_CHANGED,
              description: 'zmenila status úlohy z "IN_PROGRESS" na "COMPLETED"',
              createdAt: '2025-01-15T14:29:00Z',
              userId: 'user1',
              user: {
                id: 'user1',
                name: 'Mária Novák',
                email: 'maria.novak@example.com',
                role: UserRole.PROJECT_MANAGER,
                createdAt: '2024-12-01T00:00:00Z',
              },
              taskId: taskId,
            },
          ],
          comments: [
            {
              id: 'comment1',
              content: 'Report bol odoslaný do systému INTERREG+, čakáme na potvrdenie prijatia.',
              createdAt: '2025-01-15T14:28:00Z',
              updatedAt: '2025-01-15T14:28:00Z',
              userId: 'user1',
              user: {
                id: 'user1',
                name: 'Mária Novák',
                email: 'maria.novak@example.com',
                role: UserRole.PROJECT_MANAGER,
                createdAt: '2024-12-01T00:00:00Z',
              },
              taskId: taskId,
            },
          ],
        } as Task);
        setLoading(false);
      }, 1000);
    }
  }, [loading, task, taskId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-8 rounded-md">
        <h2 className="text-xl font-bold mb-2">Chyba</h2>
        <p>{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť
        </Button>
      </div>
    );
  }
  
  if (!task) {
    return (
      <div className="bg-muted/30 border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Úloha nebola nájdená.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 pb-10">
      {/* Back button and actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center gap-1">
            <Edit className="h-4 w-4" />
            <span>Upraviť</span>
          </Button>
          <Button variant="destructive" className="flex items-center gap-1">
            <Trash2 className="h-4 w-4" />
            <span>Vymazať</span>
          </Button>
        </div>
      </div>
      
      {/* Task header */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <Badge variant="outline" className="text-sm font-mono">
            {task.externalId || `TASK-${task.id.substring(0, 8)}`}
          </Badge>
          <Badge className={`${categoryColors[task.category]}`}>
            {task.category}
          </Badge>
          <Badge className={`${priorityColors[task.priority]}`}>
            {task.priority}
          </Badge>
          <div className="flex items-center ml-auto">
            {statusIcons[task.status]}
            <span className="ml-1 text-sm">{task.status}</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold">{task.title}</h1>
      </div>
      
      {/* Task details and activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task details - takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main task info */}
          <Card>
            <CardHeader>
              <CardTitle>Detaily úlohy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              {task.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Popis</h3>
                  <p>{task.description}</p>
                </div>
              )}
              
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <h3 className="font-medium text-muted-foreground">Pokrok</h3>
                  <span>{task.progress}%</span>
                </div>
                <Progress value={task.progress} className="h-2" />
              </div>
              
              {/* Dates and hours */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Dátumy</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-muted-foreground mr-2">Vytvorené:</span>
                      <span>{formatDate(task.createdAt)}</span>
                    </div>
                    {task.deadline && (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-muted-foreground mr-2">Deadline:</span>
                        <span>{formatDate(task.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {(task.estimatedHours || task.actualHours) && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Hodiny</h3>
                    <div className="space-y-2">
                      {task.estimatedHours && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground mr-2">Odhadované:</span>
                          <span>{task.estimatedHours} hodín</span>
                        </div>
                      )}
                      {task.actualHours && (
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground mr-2">Skutočné:</span>
                          <span>{task.actualHours} hodín</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Assignee */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Priradené</h3>
                {task.assignee ? (
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      {task.assignee.avatar ? (
                        <img src={task.assignee.avatar} alt={task.assignee.name} />
                      ) : (
                        <div className="bg-primary/10 text-primary flex items-center justify-center h-full w-full text-xs">
                          {task.assignee.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </Avatar>
                    <div>
                      <p className="font-medium">{task.assignee.name}</p>
                      <p className="text-xs text-muted-foreground">{task.assignee.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-muted-foreground">
                    <User className="h-5 w-5 mr-2" />
                    <span>Nepriradené</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Comments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Komentáre</CardTitle>
              <Button size="sm" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>Pridať komentár</span>
              </Button>
            </CardHeader>
            <CardContent>
              {task.comments && task.comments.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center mb-2">
                        <Avatar className="h-6 w-6 mr-2">
                          {comment.user?.avatar ? (
                            <img src={comment.user.avatar} alt={comment.user.name} />
                          ) : (
                            <div className="bg-primary/10 text-primary flex items-center justify-center h-full w-full text-xs">
                              {comment.user?.name.substring(0, 2).toUpperCase() || 'UN'}
                            </div>
                          )}
                        </Avatar>
                        <span className="font-medium text-sm">{comment.user?.name || 'Neznámy používateľ'}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Žiadne komentáre.
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Dokumenty</CardTitle>
              <Button size="sm" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Pridať dokument</span>
              </Button>
            </CardHeader>
            <CardContent>
              {task.documents && task.documents.length > 0 ? (
                <div className="space-y-2">
                  {task.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.fileSize} bytes • {formatDate(doc.createdAt)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Stiahnuť</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Žiadne dokumenty.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Activity feed - takes 1/3 of the width on large screens */}
        <div>
          <ActivityFeed 
            title="Aktivita úlohy" 
            initialActivities={task.activities} 
            limit={10}
          />
        </div>
      </div>
    </div>
  );
}

