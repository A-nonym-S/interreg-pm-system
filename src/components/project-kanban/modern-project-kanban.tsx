'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  RefreshCw,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ProjectTask {
  id: string;
  cislo: number;
  nazov: string;
  popis: string;
  priorita: string;
  periodicita: string;
  zodpovednaOsoba: string;
  typ: string;
  casovyHarmonogram: string;
  subtasks?: any[];
  document?: any;
}

interface ModernProjectKanbanProps {
  initialTasks?: ProjectTask[];
}

export default function ModernProjectKanban({ initialTasks = [] }: ModernProjectKanbanProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [periodicityFilter, setPeriodicityFilter] = useState('all');

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/project-tasks');
        if (response.ok) {
          const data = await response.json();
          setTasks(data);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.nazov || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.popis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.zodpovednaOsoba || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || task.priorita === priorityFilter;
    const matchesPeriodicity = periodicityFilter === 'all' || task.periodicita === periodicityFilter;
    
    return matchesSearch && matchesPriority && matchesPeriodicity;
  });

  // Group tasks by periodicity
  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const key = task.periodicita || 'Ostatné';
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {} as Record<string, ProjectTask[]>);

  const handleTaskClick = (taskId: string) => {
    router.push(`/project-tasks/${taskId}`);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    setPeriodicityFilter('all');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'vysoká': return 'bg-red-100 text-red-800';
      case 'stredná': return 'bg-amber-100 text-amber-800';
      case 'nízka': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPeriodicityColor = (periodicity: string) => {
    switch (periodicity?.toLowerCase()) {
      case 'priebežne': return 'bg-blue-100 text-blue-800';
      case 'jednorazovo': return 'bg-purple-100 text-purple-800';
      case 'podľa potreby': return 'bg-orange-100 text-orange-800';
      case 'periodicky': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-slate-600">Načítavam úlohy...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projektové úlohy</h1>
          <p className="text-slate-500">
            {viewMode === 'kanban' ? 'Organizované podľa periodicity' : 'Tabuľkové zobrazenie'} • {filteredTasks.length} úloh
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 rounded-lg p-1 flex">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4 mr-2 inline" />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-4 w-4 mr-2 inline" />
              Zoznam
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="modern-card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Hľadať úlohy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-input pl-10"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <div className="lg:w-48">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="modern-input"
            >
              <option value="all">Všetky priority</option>
              <option value="Vysoká">Vysoká</option>
              <option value="Stredná">Stredná</option>
              <option value="Nízka">Nízka</option>
            </select>
          </div>

          {/* Periodicity Filter */}
          <div className="lg:w-48">
            <select
              value={periodicityFilter}
              onChange={(e) => setPeriodicityFilter(e.target.value)}
              className="modern-input"
            >
              <option value="all">Všetky periodicity</option>
              <option value="Priebežne">Priebežne</option>
              <option value="Jednorazovo">Jednorazovo</option>
              <option value="Podľa potreby">Podľa potreby</option>
              <option value="Periodicky">Periodicky</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="modern-btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Obnoviť
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {Object.entries(groupedTasks).map(([periodicity, tasks]) => (
            <div key={periodicity} className="modern-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">{periodicity}</h3>
                <span className="modern-badge bg-slate-100 text-slate-600">
                  {tasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task.id)}
                    className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-200 hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500">
                        #{task.cislo}
                      </span>
                      <span className={`modern-badge text-xs ${getPriorityColor(task.priorita)}`}>
                        {task.priorita}
                      </span>
                    </div>

                    <h4 className="font-medium text-slate-900 mb-2 line-clamp-2">
                      {task.nazov}
                    </h4>

                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {task.popis}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {task.zodpovednaOsoba}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.subtasks?.length || 0} úloh
                      </div>
                    </div>

                    {task.document && (
                      <div className="flex items-center mt-2 text-xs text-blue-600">
                        <FileText className="h-3 w-3 mr-1" />
                        Dokument
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="modern-table">
          <div className="modern-table-header">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-1 modern-table-header-cell">Číslo</div>
              <div className="col-span-4 modern-table-header-cell">Názov úlohy</div>
              <div className="col-span-2 modern-table-header-cell">Priorita</div>
              <div className="col-span-2 modern-table-header-cell">Periodicita</div>
              <div className="col-span-2 modern-table-header-cell">Zodpovedná osoba</div>
              <div className="col-span-1 modern-table-header-cell">Akcie</div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <div key={task.id} className="modern-table-row">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 modern-table-cell">
                    <span className="font-medium text-slate-900">#{task.cislo}</span>
                  </div>
                  
                  <div className="col-span-4 modern-table-cell">
                    <div>
                      <h4 className="font-medium text-slate-900 mb-1">{task.nazov}</h4>
                      <p className="text-sm text-slate-500 line-clamp-2">{task.popis}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-2 modern-table-cell">
                    <span className={`modern-badge ${getPriorityColor(task.priorita)}`}>
                      {task.priorita}
                    </span>
                  </div>
                  
                  <div className="col-span-2 modern-table-cell">
                    <span className={`modern-badge ${getPeriodicityColor(task.periodicita)}`}>
                      {task.periodicita}
                    </span>
                  </div>
                  
                  <div className="col-span-2 modern-table-cell">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                        {task.zodpovednaOsoba?.charAt(0)}
                      </div>
                      <span className="text-sm text-slate-700">{task.zodpovednaOsoba}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-1 modern-table-cell">
                    <button
                      onClick={() => handleTaskClick(task.id)}
                      className="modern-btn-primary text-xs px-3 py-1"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && (
        <div className="modern-card text-center py-12">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Žiadne úlohy</h3>
          <p className="text-slate-500">Neboli nájdené žiadne úlohy zodpovedajúce vašim filtrom.</p>
        </div>
      )}
    </div>
  );
}

