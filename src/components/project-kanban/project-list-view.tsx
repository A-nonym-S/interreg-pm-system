'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  ChevronUp,
  ChevronDown,
  ExternalLink,
  ArrowUpDown
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

const RECURRENCE_LABELS = {
  PRIEBEZNE: 'Priebežne',
  JEDNORAZOVO: 'Jednorazovo',
  PODLA_POTREBY: 'Podľa potreby',
  PERIODICKY: 'Periodicky'
};

type SortField = 'taskNumber' | 'title' | 'priority' | 'recurrence' | 'responsiblePerson' | 'subtaskCount';
type SortDirection = 'asc' | 'desc';

interface ProjectListViewProps {
  tasks: ProjectTask[];
  loading: boolean;
  onTaskClick: (taskId: string) => void;
}

export default function ProjectListView({ tasks, loading, onTaskClick }: ProjectListViewProps) {
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
        aValue = parseInt(a.taskNumber);
        bValue = parseInt(b.taskNumber);
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
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-1 font-medium text-left justify-start"
      onClick={() => handleSort(field)}
    >
      {children}
      {sortField === field ? (
        sortDirection === 'asc' ? (
          <ChevronUp className="ml-1 h-3 w-3" />
        ) : (
          <ChevronDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam úlohy...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žiadne úlohy nenájdené</h3>
          <p className="text-gray-600">Skúste zmeniť filtre alebo vyhľadávací výraz.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Zoznam projektových úloh</CardTitle>
          <p className="text-sm text-gray-600">{tasks.length} úloh</p>
        </CardHeader>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 w-12"></th>
                  <th className="text-left p-3 min-w-[80px]">
                    <SortButton field="taskNumber">Číslo</SortButton>
                  </th>
                  <th className="text-left p-3 min-w-[300px]">
                    <SortButton field="title">Názov úlohy</SortButton>
                  </th>
                  <th className="text-left p-3 min-w-[120px]">
                    <SortButton field="priority">Priorita</SortButton>
                  </th>
                  <th className="text-left p-3 min-w-[120px]">
                    <SortButton field="recurrence">Periodicita</SortButton>
                  </th>
                  <th className="text-left p-3 min-w-[150px]">
                    <SortButton field="responsiblePerson">Zodpovedná osoba</SortButton>
                  </th>
                  <th className="text-left p-3 min-w-[120px]">
                    <SortButton field="subtaskCount">Podúlohy</SortButton>
                  </th>
                  <th className="text-left p-3 min-w-[100px]">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {sortedTasks.map((task) => {
                  const stats = getTaskStats(task);
                  const isExpanded = expandedRows.has(task.id);
                  
                  return (
                    <React.Fragment key={task.id}>
                      {/* Main Row */}
                      <tr className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleRowExpansion(task.id)}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )}
                          </Button>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {task.taskNumber}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900 line-clamp-2">
                              {task.title}
                            </div>
                            <div className="text-sm text-gray-600">
                              {task.taskType}
                            </div>
                            <div className="flex items-center gap-2">
                              {task.fulfillsKC && (
                                <Badge variant="secondary" className="text-xs">
                                  KC
                                </Badge>
                              )}
                              {task.document && (
                                <Badge variant="outline" className="text-xs">
                                  <FileText className="h-3 w-3 mr-1" />
                                  Dokument
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className={PRIORITY_COLORS[task.priority]}>
                            {PRIORITY_LABELS[task.priority]}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-sm text-gray-900">
                            {RECURRENCE_LABELS[task.recurrence as keyof typeof RECURRENCE_LABELS] || task.recurrence}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {task.responsiblePerson || 'Neurčené'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {stats.total} celkom
                            </div>
                            <div className="flex gap-2 text-xs">
                              <span className="text-green-600">{stats.completed} ✓</span>
                              <span className="text-blue-600">{stats.pending} ○</span>
                              {stats.overdue > 0 && (
                                <span className="text-red-600">{stats.overdue} !</span>
                              )}
                              {stats.upcoming > 0 && (
                                <span className="text-orange-600">{stats.upcoming} ⚡</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onTaskClick(task.id)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Detail
                            </Button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {isExpanded && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="p-4">
                            <div className="space-y-4">
                              {/* Description */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Popis</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {task.description}
                                </p>
                              </div>

                              {/* Timeline */}
                              {(task.startDate || task.endDate || task.duration) && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Časový harmonogram</h4>
                                  <div className="flex gap-6 text-sm text-gray-600">
                                    {task.startDate && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Začiatok: {formatDate(task.startDate)}</span>
                                      </div>
                                    )}
                                    {task.endDate && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>Koniec: {formatDate(task.endDate)}</span>
                                      </div>
                                    )}
                                    {task.duration && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>Trvanie: {task.duration}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Recent Subtasks */}
                              {(task.subtasks?.length || 0) > 0 && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">
                                    Najbližšie podúlohy ({Math.min(3, task.subtasks?.length || 0)} z {task.subtasks?.length || 0})
                                  </h4>
                                  <div className="space-y-2">
                                    {(task.subtasks || [])
                                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                                      .slice(0, 3)
                                      .map((subtask) => (
                                        <div key={subtask.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                          <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                              {subtask.title}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                              Termín: {formatDate(subtask.dueDate)}
                                            </div>
                                          </div>
                                          <Badge 
                                            variant={subtask.status === 'COMPLETED' ? 'default' : 'secondary'}
                                            className="text-xs"
                                          >
                                            {subtask.status === 'COMPLETED' ? 'Dokončené' : 
                                             subtask.status === 'IN_PROGRESS' ? 'V procese' :
                                             subtask.status === 'OVERDUE' ? 'Po termíne' : 'Čakajúce'}
                                          </Badge>
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}

                              {/* Document */}
                              {task.document && (
                                <div>
                                  <h4 className="font-medium text-gray-900 mb-2">Zdrojový dokument</h4>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <FileText className="h-4 w-4" />
                                    <span>{task.document.originalName}</span>
                                    <Badge variant="outline" className="text-xs">
                                      #{task.document.internalNumber}
                                    </Badge>
                                  </div>
                                </div>
                              )}
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
    </div>
  );
}

