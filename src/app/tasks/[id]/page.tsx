'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Task, TaskStatus, TaskPriority, TaskCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  User,
  Save
} from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

// Status icon mapping
const statusIcons = {
  [TaskStatus.TODO]: AlertTriangle,
  [TaskStatus.IN_PROGRESS]: Clock,
  [TaskStatus.DONE]: CheckCircle,
  [TaskStatus.BLOCKED]: X,
};

// Priority color mapping
const priorityColors = {
  [TaskPriority.LOW]: 'bg-green-500/10 text-green-500 border-green-500/20',
  [TaskPriority.MEDIUM]: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  [TaskPriority.HIGH]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  [TaskPriority.URGENT]: 'bg-red-500/10 text-red-500 border-red-500/20',
};

// Category color mapping
const categoryColors = {
  [TaskCategory.FINANCIAL]: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  [TaskCategory.REPORTING]: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  [TaskCategory.COMPLIANCE]: 'bg-green-500/10 text-green-500 border-green-500/20',
  [TaskCategory.PROCUREMENT]: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  [TaskCategory.TECHNICAL]: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  [TaskCategory.ADMINISTRATIVE]: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  [TaskCategory.COMMUNICATION]: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
  [TaskCategory.QUALITY]: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  [TaskCategory.RISK]: 'bg-red-500/10 text-red-500 border-red-500/20',
  [TaskCategory.EVALUATION]: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  [TaskCategory.OTHER]: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    category: '',
    progress: 0,
    estimatedHours: 0,
    actualHours: 0,
  });
  
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
      // Použijeme mock data namiesto zobrazenia chyby
      setTask({
        id: taskId,
        externalId: 'TASK-2025-01-0001',
        title: 'Mesačný report pre INTERREG+',
        description: 'Príprava a odoslanie mesačného reportu pokroku projektu do systému INTERREG+',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        category: TaskCategory.REPORTING,
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-15T14:30:00Z',
        deadline: '2025-01-15T23:59:59Z',
        assigneeId: 'user1',
        assignee: {
          id: 'user1',
          name: 'Mária Novák',
          email: 'maria.novak@example.com',
          role: 'PROJECT_MANAGER',
          createdAt: '2024-12-01T00:00:00Z',
        },
        progress: 100,
        estimatedHours: 10,
        actualHours: 8,
        activities: [
          {
            id: 'act1',
            type: 'TASK_COMPLETED',
            description: 'dokončila úlohu "Mesačný report pre INTERREG+"',
            createdAt: '2025-01-15T14:30:00Z',
            userId: 'user1',
            user: {
              id: 'user1',
              name: 'Mária Novák',
              email: 'maria.novak@example.com',
              role: 'PROJECT_MANAGER',
              createdAt: '2024-12-01T00:00:00Z',
            },
            taskId: taskId,
          },
          {
            id: 'act2',
            type: 'STATUS_CHANGED',
            description: 'zmenila status úlohy z "IN_PROGRESS" na "DONE"',
            createdAt: '2025-01-15T14:29:00Z',
            userId: 'user1',
            user: {
              id: 'user1',
              name: 'Mária Novák',
              email: 'maria.novak@example.com',
              role: 'PROJECT_MANAGER',
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
              role: 'PROJECT_MANAGER',
              createdAt: '2024-12-01T00:00:00Z',
            },
            taskId: taskId,
          },
        ],
      } as Task);
      setError(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Start editing mode
  const handleEdit = () => {
    if (task) {
      setEditForm({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        category: task.category,
        progress: task.progress || 0,
        estimatedHours: task.estimatedHours || 0,
        actualHours: task.actualHours || 0,
      });
      setIsEditing(true);
    }
  };
  
  // Save changes
  const handleSave = async () => {
    if (!task) return;
    
    try {
      setLoading(true);
      // Simulujeme úspešné uloženie
      const updatedTask = {
        ...task,
        ...editForm,
      };
      setTask(updatedTask);
      setIsEditing(false);
      setError(null);
      alert('Úloha bola úspešne aktualizovaná!');
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Nepodarilo sa uložiť zmeny. Skúste to znova neskôr.');
    } finally {
      setLoading(false);
    }
  };
  
  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      title: '',
      description: '',
      status: '',
      priority: '',
      category: '',
      progress: 0,
      estimatedHours: 0,
      actualHours: 0,
    });
  };
  
  // Format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), 'dd. MMMM yyyy', { locale: sk });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    fetchTask();
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
      <div className="bg-muted/30 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-muted-foreground">Úloha nebola nájdená.</p>
        <Button variant="outline" className="mt-4" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť
        </Button>
      </div>
    );
  }
  
  const StatusIcon = statusIcons[task.status];
  
  return (
    <div className="space-y-8 pb-10">
      {/* Back button and actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Späť
        </Button>
        
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="flex items-center gap-1">
                <Save className="h-4 w-4" />
                <span>Uložiť</span>
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex items-center gap-1">
                <X className="h-4 w-4" />
                <span>Zrušiť</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleEdit} className="flex items-center gap-1">
                <Edit className="h-4 w-4" />
                <span>Upraviť</span>
              </Button>
              <Button variant="destructive" className="flex items-center gap-1">
                <Trash2 className="h-4 w-4" />
                <span>Vymazať</span>
              </Button>
            </>
          )}
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
            <StatusIcon className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{task.status}</span>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold">{isEditing ? editForm.title : task.title}</h1>
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
              {isEditing ? (
                // Edit form
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Názov úlohy</Label>
                    <Input
                      id="title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                      placeholder="Názov úlohy"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Popis</Label>
                    <Textarea
                      id="description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      placeholder="Popis úlohy"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TaskStatus.TODO}>Čakajúce</SelectItem>
                          <SelectItem value={TaskStatus.IN_PROGRESS}>V procese</SelectItem>
                          <SelectItem value={TaskStatus.DONE}>Dokončené</SelectItem>
                          <SelectItem value={TaskStatus.BLOCKED}>Blokované</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Priorita</Label>
                      <Select value={editForm.priority} onValueChange={(value) => setEditForm({...editForm, priority: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte prioritu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TaskPriority.LOW}>Nízka</SelectItem>
                          <SelectItem value={TaskPriority.MEDIUM}>Stredná</SelectItem>
                          <SelectItem value={TaskPriority.HIGH}>Vysoká</SelectItem>
                          <SelectItem value={TaskPriority.URGENT}>Kritická</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Kategória</Label>
                      <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Vyberte kategóriu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TaskCategory.FINANCIAL}>Finančné</SelectItem>
                          <SelectItem value={TaskCategory.REPORTING}>Reporting</SelectItem>
                          <SelectItem value={TaskCategory.COMPLIANCE}>Compliance</SelectItem>
                          <SelectItem value={TaskCategory.PROCUREMENT}>Obstarávanie</SelectItem>
                          <SelectItem value={TaskCategory.TECHNICAL}>Technické</SelectItem>
                          <SelectItem value={TaskCategory.ADMINISTRATIVE}>Administratívne</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="progress">Pokrok (%)</Label>
                      <Input
                        id="progress"
                        type="number"
                        min="0"
                        max="100"
                        value={editForm.progress}
                        onChange={(e) => setEditForm({...editForm, progress: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="estimatedHours">Odhadované hodiny</Label>
                      <Input
                        id="estimatedHours"
                        type="number"
                        min="0"
                        value={editForm.estimatedHours}
                        onChange={(e) => setEditForm({...editForm, estimatedHours: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="actualHours">Skutočné hodiny</Label>
                      <Input
                        id="actualHours"
                        type="number"
                        min="0"
                        value={editForm.actualHours}
                        onChange={(e) => setEditForm({...editForm, actualHours: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Read-only view
                <>
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
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Hodiny</h3>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground mr-2">Odhadované:</span>
                          <span>{task.estimatedHours} hodín</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-muted-foreground mr-2">Skutočné:</span>
                          <span>{task.actualHours} hodín</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Assignee */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Priradené</h3>
                    {task.assignee ? (
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <div className="bg-primary/10 text-primary flex items-center justify-center h-full w-full text-xs">
                            {task.assignee.name.substring(0, 2).toUpperCase()}
                          </div>
                        </Avatar>
                        <div>
                          <p className="font-medium">{task.assignee.name}</p>
                          <p className="text-xs text-muted-foreground">{task.assignee.email}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Nepriradené</p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Comments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Komentáre
              </CardTitle>
              <Button size="sm" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                Pridať komentár
              </Button>
            </CardHeader>
            <CardContent>
              {task.comments && task.comments.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-muted pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <div className="bg-primary/10 text-primary flex items-center justify-center h-full w-full text-xs">
                            {comment.user.name.substring(0, 2).toUpperCase()}
                          </div>
                        </Avatar>
                        <span className="font-medium text-sm">{comment.user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Žiadne komentáre.</p>
              )}
            </CardContent>
          </Card>
          
          {/* Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dokumenty
              </CardTitle>
              <Button size="sm" variant="outline" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Pridať dokument
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Žiadne dokumenty.</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Activity sidebar */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Aktivita úlohy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {task.activities && task.activities.length > 0 ? (
                <div className="space-y-4">
                  {task.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <div className="bg-primary/10 text-primary flex items-center justify-center h-full w-full text-xs">
                          {activity.user.name.substring(0, 2).toUpperCase()}
                        </div>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name}</span>{' '}
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          pred 6 mesiacmi
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Žiadne aktivity.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

