'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Filter, 
  Search, 
  Plus, 
  LayoutGrid, 
  List,
  RefreshCw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProjectListView from './project-list-view';

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

type ViewMode = 'kanban' | 'list';

export default function ProjectKanbanBoardWithToggle() {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [recurrenceFilter, setRecurrenceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const router = useRouter();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/project-tasks');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Chyba pri načítavaní úloh. Skúste to znovu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskClick = (taskId: string) => {
    router.push(`/project-tasks/${taskId}`);
  };

  const handleRefresh = () => {
    fetchTasks();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    setRecurrenceFilter('all');
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.taskType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.responsiblePerson && task.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesRecurrence = recurrenceFilter === 'all' || task.recurrence === recurrenceFilter;

    return matchesSearch && matchesPriority && matchesRecurrence;
  });

  // Group tasks by recurrence for kanban view
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const key = task.recurrence;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(task);
    return acc;
  }, {} as Record<string, ProjectTask[]>);

  // Calculate total subtasks
  const totalSubtasks = filteredTasks.reduce((sum, task) => sum + (task.subtasks?.length || 0), 0);

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

  // Komponenta pre kartu úlohy v kanban view
  const TaskCard = ({ task }: { task: ProjectTask }) => {
    const stats = getTaskStats(task);
    
    return (
      <Card 
        className="mb-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleTaskClick(task.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <Badge variant="outline" className="text-xs font-mono">
              {task.taskNumber}
            </Badge>
            <Badge className={PRIORITY_COLORS[task.priority]}>
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {task.fulfillsKC && (
                <Badge variant="secondary" className="text-xs">KC</Badge>
              )}
            </div>
            
            <h3 className="font-medium text-sm leading-tight line-clamp-2">
              {task.title}
            </h3>
            
            <p className="text-xs text-gray-600 line-clamp-1">
              {task.taskType}
            </p>
            
            {task.responsiblePerson && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <User className="h-3 w-3" />
                <span className="truncate">{task.responsiblePerson}</span>
              </div>
            )}
            
            {task.document && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <FileText className="h-3 w-3" />
                <span className="truncate">{task.document.originalName}</span>
              </div>
            )}
            
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-600 mb-1">
                Pokrok {Math.round((stats.completed / stats.total) * 100) || 0}%
              </div>
              <div className="flex justify-between text-xs">
                <span>{stats.total} úloh</span>
                <span className="text-orange-600">
                  {stats.upcoming} blížiacich sa
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-4">
            <FileText className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium">Chyba pri načítavaní</h3>
            <p className="text-sm">{error}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Skúsiť znovu
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projektové úlohy - {viewMode === 'kanban' ? 'Kanban' : 'Zoznam'}</h1>
          <p className="text-gray-600">
            {viewMode === 'kanban' ? 'Organizované podľa periodicity' : 'Tabuľkové zobrazenie'} • {filteredTasks.length} úloh
            {totalSubtasks > 0 && ` • ${totalSubtasks} podúloh`}
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="flex items-center gap-2"
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              Zoznam
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Hľadať úlohy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Priorita" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky priority</SelectItem>
                <SelectItem value="VYSOKA">Vysoká</SelectItem>
                <SelectItem value="STREDNA">Stredná</SelectItem>
                <SelectItem value="NIZKA">Nízka</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={recurrenceFilter} onValueChange={setRecurrenceFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Periodicita" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Všetky periodicity</SelectItem>
                <SelectItem value="PRIEBEZNE">Priebežne</SelectItem>
                <SelectItem value="JEDNORAZOVO">Jednorazovo</SelectItem>
                <SelectItem value="PODLA_POTREBY">Podľa potreby</SelectItem>
                <SelectItem value="PERIODICKY">Periodicky</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Obnoviť
              </Button>
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'list' ? (
        <ProjectListView 
          tasks={filteredTasks} 
          loading={loading}
          onTaskClick={handleTaskClick}
        />
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {Object.entries(groupedTasks).map(([recurrence, tasks]) => {
            const totalSubtasks = tasks.reduce((sum, task) => sum + (task.subtasks?.length || 0), 0);
            
            return (
              <div key={recurrence} className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                      {RECURRENCE_LABELS[recurrence as keyof typeof RECURRENCE_LABELS] || recurrence}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {tasks.length} úloh • {totalSubtasks} podúloh
                    </p>
                  </CardHeader>
                </Card>
                
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredTasks.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žiadne úlohy nenájdené</h3>
            <p className="text-gray-600">Skúste zmeniť filtre alebo vyhľadávací výraz.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

