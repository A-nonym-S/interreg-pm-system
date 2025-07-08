'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  CheckCircle2,
  Clock3,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface ProjectTask {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  taskType: string;
  priority: 'VYSOKA' | 'STREDNA' | 'NIZKA';
  recurrence: 'PRIEBEZNE' | 'DVAKRAT_MESACNE' | 'KVARTALNE' | 'JEDNORAZOVO' | 'PODLA_POTREBY' | 'PERIODICKY' | 'POCAS_STAVBY' | 'PO_UKONCENI';
  responsiblePerson?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  fulfillsKC: boolean;
  subtasks: ProjectSubtask[];
  document?: {
    id: string;
    originalName: string;
    internalNumber?: string;
  };
}

interface ProjectSubtask {
  id: string;
  title: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}

interface ProjectListViewStyledProps {
  tasks: ProjectTask[];
  loading: boolean;
  onTaskClick: (taskId: string) => void;
}

const PRIORITY_COLORS = {
  VYSOKA: 'bg-red-500/10 text-red-400 border-red-500/20',
  STREDNA: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  NIZKA: 'bg-green-500/10 text-green-400 border-green-500/20'
};

const PRIORITY_LABELS = {
  VYSOKA: 'Vysoká',
  STREDNA: 'Stredná',
  NIZKA: 'Nízka'
};

const RECURRENCE_LABELS = {
  PRIEBEZNE: 'Priebežne',
  DVAKRAT_MESACNE: '2x mesačne',
  KVARTALNE: 'Kvartálne',
  JEDNORAZOVO: 'Jednorazovo',
  PODLA_POTREBY: 'Podľa potreby',
  PERIODICKY: 'Periodicky',
  POCAS_STAVBY: 'Počas stavby',
  PO_UKONCENI: 'Po ukončení'
};

const RECURRENCE_COLORS = {
  PRIEBEZNE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  JEDNORAZOVO: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  PODLA_POTREBY: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  PERIODICKY: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
};

const STATUS_COLORS = {
  PENDING: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  IN_PROGRESS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
  OVERDUE: 'bg-red-500/10 text-red-400 border-red-500/20'
};

const STATUS_LABELS = {
  PENDING: 'Čakajúce',
  IN_PROGRESS: 'V procese',
  COMPLETED: 'Dokončené',
  OVERDUE: 'Po termíne'
};

type SortField = 'taskNumber' | 'title' | 'priority' | 'recurrence' | 'responsiblePerson' | 'subtaskCount';
type SortDirection = 'asc' | 'desc';

export default function ProjectListViewStyled({ tasks, loading, onTaskClick }: ProjectListViewStyledProps) {
  const [sortField, setSortField] = useState<SortField>('taskNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRowExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedRows(newExpanded);
  };

  const getTaskStats = (task: ProjectTask) => {
    const subtasks = task.subtasks || [];
    const total = subtasks.length;
    const completed = subtasks.filter(s => s.status === 'COMPLETED').length;
    const pending = subtasks.filter(s => s.status === 'PENDING').length;
    const overdue = subtasks.filter(s => s.status === 'OVERDUE').length;
    const upcoming = subtasks.filter(s => {
      const dueDate = new Date(s.dueDate);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate >= now && dueDate <= weekFromNow && s.status === 'PENDING';
    }).length;

    return { total, completed, pending, overdue, upcoming };
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'taskNumber':
        aValue = parseInt(a.taskNumber) || 0;
        bValue = parseInt(b.taskNumber) || 0;
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { VYSOKA: 3, STREDNA: 2, NIZKA: 1 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      case 'recurrence':
        aValue = a.recurrence.toLowerCase();
        bValue = b.recurrence.toLowerCase();
        break;
      case 'responsiblePerson':
        aValue = (a.responsiblePerson || '').toLowerCase();
        bValue = (b.responsiblePerson || '').toLowerCase();
        break;
      case 'subtaskCount':
        aValue = a.subtasks?.length || 0;
        bValue = b.subtasks?.length || 0;
        break;
      default:
        aValue = a.taskNumber;
        bValue = b.taskNumber;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sk-SK');
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-2 justify-start font-medium text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover"
    >
      {children}
      <ArrowUpDown className="ml-2 h-3 w-3" />
    </Button>
  );

  if (loading) {
    return (
      <Card className="bg-dark-bg-elevated border-dark-border-default">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Načítavam úlohy...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-dark-bg-elevated border-dark-border-default">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border-subtle">
                  <th className="text-left p-4 w-12">
                    <span className="text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                      Rozbaľ
                    </span>
                  </th>
                  <th className="text-left p-4 min-w-[80px]">
                    <SortButton field="taskNumber">
                      <span className="text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                        Číslo
                      </span>
                    </SortButton>
                  </th>
                  <th className="text-left p-4 min-w-[300px]">
                    <SortButton field="title">
                      <span className="text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                        Názov úlohy
                      </span>
                    </SortButton>
                  </th>
                  <th className="text-left p-4 min-w-[100px]">
                    <SortButton field="priority">
                      <span className="text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                        Priorita
                      </span>
                    </SortButton>
                  </th>
                  <th className="text-left p-4 min-w-[120px]">
                    <SortButton field="recurrence">
                      <span className="text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                        Periodicita
                      </span>
                    </SortButton>
                  </th>
                  <th className="text-left p-4 min-w-[150px]">
                    <SortButton field="responsiblePerson">
                      <span className="text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                        Zodpovedná osoba
                      </span>
                    </SortButton>
                  </th>
                  <th className="text-left p-4 min-w-[100px]">
                    <SortButton field="subtaskCount">
                      <span className="text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                        Podúlohy
                      </span>
                    </SortButton>
                  </th>
                  <th className="text-left p-4 min-w-[100px]">
                    <span className="text-xs font-medium text-dark-text-tertiary uppercase tracking-wider">
                      Akcie
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((task) => {
                  const stats = getTaskStats(task);
                  const isExpanded = expandedRows.has(task.id);
                  const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

                  return (
                    <React.Fragment key={task.id}>
                      <tr className="border-b border-dark-border-subtle hover:bg-dark-bg-hover/50 transition-colors">
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRowExpansion(task.id)}
                            className="h-6 w-6 p-0 hover:bg-dark-bg-tertiary"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4 text-dark-text-muted" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-dark-text-muted" />
                            )}
                          </Button>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="font-mono text-xs bg-dark-bg-tertiary border-dark-border-default text-dark-text-secondary">
                            {task.taskNumber}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <h3 className="font-medium text-dark-text-primary line-clamp-1">
                              {task.title}
                            </h3>
                            <p className="text-sm text-dark-text-tertiary line-clamp-1">
                              {task.taskType}
                            </p>
                            <div className="flex items-center gap-2">
                              {task.fulfillsKC && (
                                <Badge className="text-xs bg-brand-primary/20 text-brand-primary border-brand-primary/30">
                                  KC
                                </Badge>
                              )}
                              {task.document && (
                                <Badge variant="outline" className="text-xs bg-dark-bg-tertiary border-dark-border-default text-dark-text-muted">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Dokument
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={`${PRIORITY_COLORS[task.priority]} text-xs font-medium`}>
                            {PRIORITY_LABELS[task.priority]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={`${RECURRENCE_COLORS[task.recurrence] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'} text-xs`}>
                            {RECURRENCE_LABELS[task.recurrence]}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
                            <User className="h-4 w-4 text-dark-text-muted" />
                            <span className="truncate">{task.responsiblePerson || 'Nepriradené'}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-dark-text-secondary">{stats.total} celkom</span>
                              <span className="text-dark-text-tertiary">•</span>
                              <span className="text-green-400">{stats.completed} ✓</span>
                            </div>
                            {stats.total > 0 && (
                              <div className="w-full bg-dark-bg-secondary rounded-full h-1">
                                <div 
                                  className="bg-gradient-to-r from-brand-primary to-brand-accent h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${progressPercentage}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            onClick={() => onTaskClick(task.id)}
                            className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                          >
                            Detail
                          </Button>
                        </td>
                      </tr>

                      {/* Expanded Row Content */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={8} className="p-0">
                            <div className="bg-dark-bg-secondary border-t border-dark-border-subtle">
                              <div className="p-6 space-y-6">
                                {/* Description */}
                                <div>
                                  <h4 className="font-medium text-dark-text-primary mb-2">Popis</h4>
                                  <p className="text-sm text-dark-text-secondary leading-relaxed">
                                    {task.description}
                                  </p>
                                </div>

                                {/* Timeline */}
                                {(task.startDate || task.endDate || task.duration) && (
                                  <div>
                                    <h4 className="font-medium text-dark-text-primary mb-2">Časový harmonogram</h4>
                                    <div className="flex gap-6 text-sm text-dark-text-secondary">
                                      {task.startDate && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4 text-dark-text-muted" />
                                          <span>Začiatok: {formatDate(task.startDate)}</span>
                                        </div>
                                      )}
                                      {task.endDate && (
                                        <div className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4 text-dark-text-muted" />
                                          <span>Koniec: {formatDate(task.endDate)}</span>
                                        </div>
                                      )}
                                      {task.duration && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4 text-dark-text-muted" />
                                          <span>Trvanie: {task.duration}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Recent Subtasks */}
                                {(task.subtasks?.length || 0) > 0 && (
                                  <div>
                                    <h4 className="font-medium text-dark-text-primary mb-2">
                                      Najbližšie podúlohy ({Math.min(3, task.subtasks?.length || 0)} z {task.subtasks?.length || 0})
                                    </h4>
                                    <div className="space-y-2">
                                      {(task.subtasks || [])
                                        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                                        .slice(0, 3)
                                        .map((subtask) => (
                                          <div key={subtask.id} className="flex items-center justify-between p-3 bg-dark-bg-elevated rounded-lg border border-dark-border-default">
                                            <div className="flex-1">
                                              <div className="text-sm font-medium text-dark-text-primary">
                                                {subtask.title}
                                              </div>
                                              <div className="text-xs text-dark-text-tertiary">
                                                Termín: {formatDate(subtask.dueDate)}
                                              </div>
                                            </div>
                                            <Badge className={`${STATUS_COLORS[subtask.status]} text-xs ml-3`}>
                                              {STATUS_LABELS[subtask.status]}
                                            </Badge>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}

                                {/* Document */}
                                {task.document && (
                                  <div>
                                    <h4 className="font-medium text-dark-text-primary mb-2">Zdrojový dokument</h4>
                                    <div className="flex items-center gap-2 text-sm text-dark-text-secondary">
                                      <FileText className="h-4 w-4 text-dark-text-muted" />
                                      <span>{task.document.originalName}</span>
                                      {task.document.internalNumber && (
                                        <Badge variant="outline" className="text-xs bg-dark-bg-tertiary border-dark-border-default text-dark-text-muted">
                                          #{task.document.internalNumber}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {tasks.length === 0 && (
        <Card className="bg-dark-bg-elevated border-dark-border-default">
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-dark-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-dark-text-primary mb-2">Žiadne úlohy nenájdené</h3>
            <p className="text-dark-text-secondary">Skúste zmeniť filtre alebo vyhľadávací výraz.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

