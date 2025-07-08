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
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProjectListViewStyled from './project-list-view-styled';

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
  VYSOKA: 'bg-red-500/10 text-red-400 border-red-500/20',
  STREDNA: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  NIZKA: 'bg-green-500/10 text-green-400 border-green-500/20'
};

const PRIORITY_LABELS = {
  VYSOKA: 'Vysoká',
  STREDNA: 'Stredná',
  NIZKA: 'Nízka'
};

const RECURRENCE_COLORS = {
  PRIEBEZNE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  JEDNORAZOVO: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  PODLA_POTREBY: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  PERIODICKY: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
};

type ViewMode = 'kanban' | 'list';

export default function ProjectKanbanBoardStyled() {
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
    const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    
    return (
      <Card 
        className="mb-4 cursor-pointer hover-lift bg-dark-bg-elevated border-dark-border-default hover:border-dark-border-strong transition-all duration-200"
        onClick={() => handleTaskClick(task.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="outline" className="text-xs font-mono bg-dark-bg-tertiary border-dark-border-default text-dark-text-secondary">
              {task.taskNumber}
            </Badge>
            <Badge className={`${PRIORITY_COLORS[task.priority]} text-xs font-medium`}>
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {task.fulfillsKC && (
                <Badge variant="secondary" className="text-xs bg-brand-primary/20 text-brand-primary border-brand-primary/30">
                  KC
                </Badge>
              )}
              <Badge className={`${RECURRENCE_COLORS[task.recurrence] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'} text-xs`}>
                {RECURRENCE_LABELS[task.recurrence]}
              </Badge>
            </div>
            
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-dark-text-primary">
              {task.title}
            </h3>
            
            <p className="text-xs text-dark-text-tertiary line-clamp-1">
              {task.taskType}
            </p>
            
            {task.responsiblePerson && (
              <div className="flex items-center gap-2 text-xs text-dark-text-secondary">
                <User className="h-3 w-3 text-dark-text-muted" />
                <span className="truncate">{task.responsiblePerson}</span>
              </div>
            )}
            
            {task.document && (
              <div className="flex items-center gap-2 text-xs text-dark-text-secondary">
                <FileText className="h-3 w-3 text-dark-text-muted" />
                <span className="truncate">{task.document.originalName}</span>
              </div>
            )}
            
            <div className="pt-3 border-t border-dark-border-subtle">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-dark-text-tertiary">Pokrok</span>
                <span className="text-xs font-medium text-dark-text-secondary">{progressPercentage}%</span>
              </div>
              
              <div className="w-full bg-dark-bg-secondary rounded-full h-1.5 mb-3">
                <div 
                  className="bg-gradient-to-r from-brand-primary to-brand-accent h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-dark-text-secondary">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{stats.total} úloh</span>
                </div>
                {stats.upcoming > 0 && (
                  <div className="flex items-center gap-1 text-orange-400">
                    <Clock3 className="h-3 w-3" />
                    <span>{stats.upcoming} blížiacich sa</span>
                  </div>
                )}
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Načítavam úlohy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-dark-bg-elevated border-dark-border-default">
        <CardContent className="p-8 text-center">
          <div className="text-red-400 mb-4">
            <AlertCircle className="h-12 w-12 mx-auto mb-2" />
            <h3 className="text-lg font-medium text-dark-text-primary">Chyba pri načítavaní</h3>
            <p className="text-sm text-dark-text-secondary">{error}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="border-dark-border-default hover:bg-dark-bg-hover">
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
          <h1 className="text-2xl font-bold text-dark-text-primary">
            Projektové úlohy
            <span className="text-brand-primary ml-2">
              {viewMode === 'kanban' ? 'Kanban' : 'Zoznam'}
            </span>
          </h1>
          <p className="text-dark-text-secondary">
            {viewMode === 'kanban' ? 'Organizované podľa periodicity' : 'Tabuľkové zobrazenie'} • 
            <span className="text-brand-accent font-medium"> {filteredTasks.length} úloh</span>
            {totalSubtasks > 0 && (
              <span className="text-dark-text-tertiary"> • {totalSubtasks} podúloh</span>
            )}
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex bg-dark-bg-tertiary rounded-lg p-1 border border-dark-border-default">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 ${
                viewMode === 'kanban' 
                  ? 'bg-brand-primary hover:bg-brand-primary/90 text-white' 
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 ${
                viewMode === 'list' 
                  ? 'bg-brand-primary hover:bg-brand-primary/90 text-white' 
                  : 'text-dark-text-secondary hover:text-dark-text-primary hover:bg-dark-bg-hover'
              }`}
            >
              <List className="h-4 w-4" />
              Zoznam
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-dark-bg-elevated border-dark-border-default">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-muted h-4 w-4" />
                <Input
                  placeholder="Hľadať úlohy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-dark-bg-secondary border-dark-border-default text-dark-text-primary placeholder:text-dark-text-muted focus:border-brand-primary"
                />
              </div>
            </div>
            
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-dark-bg-secondary border-dark-border-default text-dark-text-primary">
                <SelectValue placeholder="Priorita" />
              </SelectTrigger>
              <SelectContent className="bg-dark-bg-elevated border-dark-border-default">
                <SelectItem value="all">Všetky priority</SelectItem>
                <SelectItem value="VYSOKA">Vysoká</SelectItem>
                <SelectItem value="STREDNA">Stredná</SelectItem>
                <SelectItem value="NIZKA">Nízka</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={recurrenceFilter} onValueChange={setRecurrenceFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-dark-bg-secondary border-dark-border-default text-dark-text-primary">
                <SelectValue placeholder="Periodicita" />
              </SelectTrigger>
              <SelectContent className="bg-dark-bg-elevated border-dark-border-default">
                <SelectItem value="all">Všetky periodicity</SelectItem>
                <SelectItem value="PRIEBEZNE">Priebežne</SelectItem>
                <SelectItem value="JEDNORAZOVO">Jednorazovo</SelectItem>
                <SelectItem value="PODLA_POTREBY">Podľa potreby</SelectItem>
                <SelectItem value="PERIODICKY">Periodicky</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="border-dark-border-default hover:bg-dark-bg-hover text-dark-text-secondary hover:text-dark-text-primary"
              >
                <Filter className="h-4 w-4 mr-2" />
                Obnoviť
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                className="border-dark-border-default hover:bg-dark-bg-hover text-dark-text-secondary hover:text-dark-text-primary"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'list' ? (
        <ProjectListViewStyled 
          tasks={filteredTasks} 
          loading={loading}
          onTaskClick={handleTaskClick}
        />
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {Object.entries(groupedTasks).map(([recurrence, tasks]) => {
            const totalSubtasks = tasks.reduce((sum, task) => sum + (task.subtasks?.length || 0), 0);
            const completedSubtasks = tasks.reduce((sum, task) => 
              sum + (task.subtasks?.filter(s => s.status === 'COMPLETED').length || 0), 0
            );
            const progressPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
            
            return (
              <div key={recurrence} className="space-y-4">
                <Card className="bg-dark-bg-elevated border-dark-border-default">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-dark-text-primary">
                        {RECURRENCE_LABELS[recurrence as keyof typeof RECURRENCE_LABELS] || recurrence}
                      </CardTitle>
                      <Badge className={`${RECURRENCE_COLORS[recurrence as keyof typeof RECURRENCE_COLORS] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'} text-xs`}>
                        {tasks.length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-dark-text-secondary">
                        {tasks.length} úloh • {totalSubtasks} podúloh
                      </p>
                      {totalSubtasks > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-dark-text-tertiary">
                            <span>Pokrok</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-dark-bg-secondary rounded-full h-1">
                            <div 
                              className="bg-gradient-to-r from-brand-primary to-brand-accent h-1 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
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

