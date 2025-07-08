'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, FileText, Filter, Search, Plus } from 'lucide-react';

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
  fulfillsKC: boolean;
  subtasks: ProjectSubtask[];
  document?: {
    id: string;
    originalName: string;
  };
}

interface ProjectSubtask {
  id: string;
  title: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}

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

export default function ProjectKanbanBoard() {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [taskTypes, setTaskTypes] = useState<string[]>([]);

  // Načítanie projektových úloh
  useEffect(() => {
    fetchProjectTasks();
  }, []);

  const fetchProjectTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/project-tasks?includeSubtasks=true&includeChildren=true');
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        
        // Extrakcia unikátnych typov úloh
        const types = [...new Set(data.map((task: ProjectTask) => task.taskType))];
        setTaskTypes(types);
      } else {
        console.error('Failed to fetch project tasks');
      }
    } catch (error) {
      console.error('Error fetching project tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrovanie úloh
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.taskNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTaskType = selectedTaskType === 'all' || task.taskType === selectedTaskType;
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    
    return matchesSearch && matchesTaskType && matchesPriority;
  });

  // Organizácia úloh podľa periodicity
  const tasksByRecurrence = filteredTasks.reduce((acc, task) => {
    if (!acc[task.recurrence]) {
      acc[task.recurrence] = [];
    }
    acc[task.recurrence].push(task);
    return acc;
  }, {} as Record<string, ProjectTask[]>);

  // Výpočet štatistík pre úlohu
  const getTaskStats = (task: ProjectTask) => {
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter(s => s.status === 'COMPLETED').length;
    const overdueSubtasks = task.subtasks.filter(s => s.status === 'OVERDUE').length;
    const upcomingSubtasks = task.subtasks.filter(s => {
      const dueDate = new Date(s.dueDate);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return s.status === 'PENDING' && dueDate <= nextWeek;
    }).length;

    return {
      total: totalSubtasks,
      completed: completedSubtasks,
      overdue: overdueSubtasks,
      upcoming: upcomingSubtasks,
      progress: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
    };
  };

  // Komponenta pre kartu úlohy
  const TaskCard = ({ task }: { task: ProjectTask }) => {
    const stats = getTaskStats(task);
    
    return (
      <Card className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/project-tasks/${task.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs font-mono">
                  {task.taskNumber}
                </Badge>
                <Badge className={PRIORITY_COLORS[task.priority]}>
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
                {task.fulfillsKC && (
                  <Badge variant="secondary" className="text-xs">
                    KC
                  </Badge>
                )}
              </div>
              <CardTitle className="text-sm font-medium leading-tight">
                {task.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Typ úlohy */}
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <FileText className="h-3 w-3" />
              <span>{task.taskType}</span>
            </div>

            {/* Zodpovedná osoba */}
            {task.responsiblePerson && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <User className="h-3 w-3" />
                <span>{task.responsiblePerson}</span>
              </div>
            )}

            {/* Dokument */}
            {task.document && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FileText className="h-3 w-3" />
                <span className="truncate">{task.document.originalName}</span>
              </div>
            )}

            {/* Progress bar */}
            {stats.total > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{stats.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Štatistiky podúloh */}
            {stats.total > 0 && (
              <div className="flex gap-2 text-xs">
                <Badge variant="outline" className="text-xs">
                  {stats.total} úloh
                </Badge>
                {stats.completed > 0 && (
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {stats.completed} hotových
                  </Badge>
                )}
                {stats.upcoming > 0 && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                    {stats.upcoming} blížiacich sa
                  </Badge>
                )}
                {stats.overdue > 0 && (
                  <Badge className="bg-red-100 text-red-800 text-xs">
                    {stats.overdue} po termíne
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Komponenta pre stĺpec kanban
  const KanbanColumn = ({ recurrence, tasks }: { recurrence: string, tasks: ProjectTask[] }) => {
    const totalTasks = tasks.length;
    const totalSubtasks = tasks.reduce((sum, task) => sum + task.subtasks.length, 0);
    
    return (
      <div className="flex-shrink-0 w-80">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">
                {RECURRENCE_LABELS[recurrence as keyof typeof RECURRENCE_LABELS] || recurrence}
              </h3>
              <p className="text-sm text-gray-600">
                {totalTasks} úloh • {totalSubtasks} podúloh
              </p>
            </div>
            <Button variant="ghost" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítavam projektové úlohy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projektové úlohy - Kanban</h1>
          <p className="text-gray-600">
            Organizované podľa periodicity • {filteredTasks.length} úloh
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <Input
            placeholder="Hľadať úlohy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        
        <Select value={selectedTaskType} onValueChange={setSelectedTaskType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Typ úlohy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky typy</SelectItem>
            {taskTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPriority} onValueChange={setSelectedPriority}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priorita" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všetky</SelectItem>
            <SelectItem value="VYSOKA">Vysoká</SelectItem>
            <SelectItem value="STREDNA">Stredná</SelectItem>
            <SelectItem value="NIZKA">Nízka</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={fetchProjectTasks}>
          <Filter className="h-4 w-4 mr-2" />
          Obnoviť
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-6 pb-4" style={{ minWidth: 'max-content' }}>
          {Object.entries(tasksByRecurrence).map(([recurrence, tasks]) => (
            <KanbanColumn key={recurrence} recurrence={recurrence} tasks={tasks} />
          ))}
          
          {Object.keys(tasksByRecurrence).length === 0 && (
            <div className="flex items-center justify-center w-full h-64 text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Žiadne úlohy nenájdené</p>
                <p className="text-sm">Skúste zmeniť filtre</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

