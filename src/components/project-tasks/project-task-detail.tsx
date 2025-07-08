'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  ArrowLeft,
  Edit,
  Download,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface ProjectTask {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  taskType: string;
  priority: 'VYSOKA' | 'STREDNA' | 'NIZKA';
  recurrence: string;
  source: string;
  responsiblePerson?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  expectedResult?: string;
  fulfillsKC: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  parent?: ProjectTask;
  children: ProjectTask[];
  subtasks: ProjectSubtask[];
  document?: {
    id: string;
    internalNumber: number;
    originalName: string;
    taskType: string;
    isDirectSource: boolean;
    notes?: string;
  };
}

interface ProjectSubtask {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

const PRIORITY_COLORS = {
  VYSOKA: 'bg-red-100 text-red-800 border-red-200',
  STREDNA: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  NIZKA: 'bg-green-100 text-green-800 border-green-200'
};

const PRIORITY_LABELS = {
  VYSOKA: 'Vysoká',
  STREDNA: 'Stredná',
  NIZKA: 'Nízka'
};

const STATUS_COLORS = {
  PENDING: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800'
};

const STATUS_LABELS = {
  PENDING: 'Čakajúca',
  IN_PROGRESS: 'V procese',
  COMPLETED: 'Dokončená',
  OVERDUE: 'Po termíne'
};

const STATUS_ICONS = {
  PENDING: Circle,
  IN_PROGRESS: Clock,
  COMPLETED: CheckCircle,
  OVERDUE: AlertCircle
};

interface ProjectTaskDetailProps {
  taskId: string;
}

export default function ProjectTaskDetail({ taskId }: ProjectTaskDetailProps) {
  const [task, setTask] = useState<ProjectTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaskDetail();
  }, [taskId]);

  const fetchTaskDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/project-tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
      } else {
        setError('Úloha nebola nájdená');
      }
    } catch (error) {
      console.error('Error fetching task detail:', error);
      setError('Chyba pri načítavaní úlohy');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTaskStats = () => {
    if (!task) return { total: 0, completed: 0, pending: 0, overdue: 0, progress: 0 };
    
    const total = task.subtasks.length;
    const completed = task.subtasks.filter(s => s.status === 'COMPLETED').length;
    const pending = task.subtasks.filter(s => s.status === 'PENDING').length;
    const overdue = task.subtasks.filter(s => s.status === 'OVERDUE').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, overdue, progress };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam detail úlohy...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-medium mb-2">Chyba pri načítavaní</p>
          <p className="text-gray-600">{error}</p>
          <Button asChild className="mt-4">
            <Link href="/project-kanban">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Späť na kanban
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/project-kanban">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Späť na kanban
            </Link>
          </Button>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono">
                {task.taskNumber}
              </Badge>
              <Badge className={PRIORITY_COLORS[task.priority]}>
                {PRIORITY_LABELS[task.priority]}
              </Badge>
              {task.fulfillsKC && (
                <Badge variant="secondary">KC</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <p className="text-gray-600">{task.taskType}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Upraviť
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prehľad podúloh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Celkom</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-600">Dokončené</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Čakajúce</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                <div className="text-sm text-gray-600">Po termíne</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pokrok</span>
                <span>{stats.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Prehľad</TabsTrigger>
          <TabsTrigger value="subtasks">Podúlohy ({stats.total})</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchia</TabsTrigger>
          {task.document && (
            <TabsTrigger value="document">Dokument</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Základné informácie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Popis</label>
                  <p className="mt-1 text-gray-900">{task.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Zdroj</label>
                  <p className="mt-1 text-gray-900">{task.source}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Periodicita</label>
                  <p className="mt-1 text-gray-900">{task.recurrence}</p>
                </div>

                {task.responsiblePerson && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Zodpovedná osoba</label>
                    <p className="mt-1 text-gray-900">{task.responsiblePerson}</p>
                  </div>
                )}

                {task.expectedResult && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Očakávaný výsledok</label>
                    <p className="mt-1 text-gray-900">{task.expectedResult}</p>
                  </div>
                )}

                {task.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Poznámky</label>
                    <p className="mt-1 text-gray-900">{task.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Časový harmonogram</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {task.startDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Začiatok</div>
                      <div className="text-sm text-gray-600">{formatDate(task.startDate)}</div>
                    </div>
                  </div>
                )}

                {task.endDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <div>
                      <div className="font-medium">Ukončenie</div>
                      <div className="text-sm text-gray-600">{formatDate(task.endDate)}</div>
                    </div>
                  </div>
                )}

                {task.duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Trvanie</div>
                      <div className="text-sm text-gray-600">{task.duration}</div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <div>Vytvorené: {formatDateTime(task.createdAt)}</div>
                    <div>Aktualizované: {formatDateTime(task.updatedAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subtasks Tab */}
        <TabsContent value="subtasks" className="space-y-4">
          {task.subtasks.length > 0 ? (
            <div className="space-y-3">
              {task.subtasks
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((subtask) => {
                  const StatusIcon = STATUS_ICONS[subtask.status];
                  return (
                    <Card key={subtask.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <StatusIcon className={`h-5 w-5 mt-0.5 ${
                            subtask.status === 'COMPLETED' ? 'text-green-600' :
                            subtask.status === 'OVERDUE' ? 'text-red-600' :
                            subtask.status === 'IN_PROGRESS' ? 'text-blue-600' :
                            'text-gray-400'
                          }`} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {subtask.title}
                              </h4>
                              <Badge className={STATUS_COLORS[subtask.status]}>
                                {STATUS_LABELS[subtask.status]}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(subtask.dueDate)}</span>
                              </div>
                              
                              {subtask.completedAt && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Dokončené: {formatDate(subtask.completedAt)}</span>
                                </div>
                              )}
                            </div>

                            {subtask.description && (
                              <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                                {subtask.description}
                              </p>
                            )}

                            {subtask.notes && (
                              <p className="mt-2 text-xs text-gray-500">
                                {subtask.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Žiadne podúlohy</h3>
                <p className="text-gray-600">Pre túto úlohu neboli vygenerované žiadne podúlohy.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Hierarchy Tab */}
        <TabsContent value="hierarchy" className="space-y-4">
          <div className="space-y-4">
            {/* Parent Task */}
            {task.parent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Nadradená úloha</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono">
                          {task.parent.taskNumber}
                        </Badge>
                        <Badge className={PRIORITY_COLORS[task.parent.priority]}>
                          {PRIORITY_LABELS[task.parent.priority]}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-900">{task.parent.title}</h4>
                      <p className="text-sm text-gray-600">{task.parent.taskType}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/project-tasks/${task.parent.id}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Zobraziť
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Child Tasks */}
            {task.children.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Podradené úlohy ({task.children.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="font-mono">
                              {child.taskNumber}
                            </Badge>
                            <Badge className={PRIORITY_COLORS[child.priority]}>
                              {PRIORITY_LABELS[child.priority]}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-gray-900">{child.title}</h4>
                          <p className="text-sm text-gray-600">{child.taskType}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/project-tasks/${child.id}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Zobraziť
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!task.parent && task.children.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Samostatná úloha</h3>
                  <p className="text-gray-600">Táto úloha nemá nadradené ani podradené úlohy.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Document Tab */}
        {task.document && (
          <TabsContent value="document" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Zdrojový dokument</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Názov dokumentu</label>
                      <p className="mt-1 text-gray-900 font-medium">{task.document.originalName}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Interné číslo</label>
                      <p className="mt-1 text-gray-900">{task.document.internalNumber}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Typ úlohy</label>
                      <p className="mt-1 text-gray-900">{task.document.taskType}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">Priamy zdroj</label>
                      <Badge variant={task.document.isDirectSource ? "default" : "secondary"}>
                        {task.document.isDirectSource ? "Áno" : "Nie"}
                      </Badge>
                    </div>

                    {task.document.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Poznámky</label>
                        <p className="mt-1 text-gray-900">{task.document.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Stiahnuť
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Otvoriť
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

