'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Clock, 
  FileText, 
  MoreHorizontal,
  RefreshCw,
  Filter
} from 'lucide-react';
import { api } from '@/lib/api';
import { KanbanBoard, ProjectTask } from '@/types';

interface KanbanBoardProps {
  className?: string;
}

export default function KanbanBoardComponent({ className }: KanbanBoardProps) {
  const router = useRouter();
  const [kanbanData, setKanbanData] = useState<KanbanBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKanbanData = async () => {
    try {
      setLoading(true);
      const data = await api.kanban.getKanbanBoard();
      setKanbanData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch kanban data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanbanData();
  }, []);

  const handleTaskClick = (task: ProjectTask) => {
    router.push(`/project-tasks/${task.id}`);
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'vysoká':
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'stredná':
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'nízka':
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPeriodicityColor = (periodicityType: string) => {
    switch (periodicityType) {
      case 'ONCE':
        return 'bg-blue-50 border-blue-200';
      case 'MONTHLY':
        return 'bg-green-50 border-green-200';
      case 'QUARTERLY':
        return 'bg-purple-50 border-purple-200';
      case 'SEMI_ANNUALLY':
        return 'bg-orange-50 border-orange-200';
      case 'ANNUALLY':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Načítavam Kanban board...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <p className="text-red-600 mb-2">Chyba pri načítavaní dát</p>
          <Button onClick={fetchKanbanData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Skúsiť znovu
          </Button>
        </div>
      </div>
    );
  }

  if (!kanbanData) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <p>Žiadne dáta na zobrazenie</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projektové úlohy - Kanban Board</h2>
          <p className="text-gray-400">
            Celkovo {kanbanData.totalTasks} úloh organizovaných podľa periodicity
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchKanbanData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Obnoviť
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kanbanData.columns.map((column) => (
          <Card 
            key={column.id} 
            className={`${getPeriodicityColor(column.periodicityType)} border-2`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>{column.title}</span>
                <Badge variant="secondary" className="text-xs">
                  {column.tasks.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {column.tasks.map((task: any) => (
                    <Card 
                      key={task.id}
                      className="cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200"
                      onClick={() => handleTaskClick(task)}
                    >
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          {/* Task Number and Title */}
                          <div>
                            <div className="text-xs text-gray-500 font-mono">
                              {task.sequenceNumber}
                            </div>
                            <h4 className="text-sm font-medium line-clamp-2">
                              {task.title}
                            </h4>
                          </div>

                          {/* Priority and Special Frequency */}
                          <div className="flex items-center justify-between">
                            {task.priority && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(task.priority)}`}
                              >
                                {task.priority}
                              </Badge>
                            )}
                            {task.specialFrequency && (
                              <Badge variant="secondary" className="text-xs">
                                {task.specialFrequency}
                              </Badge>
                            )}
                          </div>

                          {/* Document Info */}
                          {task.document && (
                            <div className="flex items-center text-xs text-gray-500">
                              <FileText className="h-3 w-3 mr-1" />
                              <span className="truncate">
                                {task.document.originalName}
                              </span>
                            </div>
                          )}

                          {/* SubTasks Count */}
                          {task.subTasks && task.subTasks.length > 0 && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                {task.subTasks.length} termínov realizácie
                              </span>
                            </div>
                          )}

                          {/* Next Due Date */}
                          {task.subTasks && task.subTasks.length > 0 && (
                            <div className="flex items-center text-xs text-blue-600">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>
                                Ďalší termín: {new Date(task.subTasks[0].dueDate).toLocaleDateString('sk-SK')}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {column.tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Žiadne úlohy</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Detail Modal would go here */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {selectedTask.sequenceNumber} - {selectedTask.title}
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTask(null)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Detailný popis</h4>
                  <p className="text-sm text-gray-600">
                    {selectedTask.detailedDescription || 'Žiadny detailný popis'}
                  </p>
                </div>
                
                {selectedTask.document && (
                  <div>
                    <h4 className="font-medium mb-2">Zdrojový dokument</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      {selectedTask.document.originalName}
                    </div>
                  </div>
                )}

                {selectedTask.subTasks && selectedTask.subTasks.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">
                      Termíny realizácie ({selectedTask.subTasks.length})
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedTask.subTasks.slice(0, 10).map((subTask: any, index: number) => (
                        <div key={subTask.id} className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                          <span>{new Date(subTask.dueDate).toLocaleDateString('sk-SK')}</span>
                        </div>
                      ))}
                      {selectedTask.subTasks.length > 10 && (
                        <p className="text-xs text-gray-500 mt-2">
                          ... a ďalších {selectedTask.subTasks.length - 10} termínov
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

