"use client";

import { TaskList } from '@/components/dashboard/task-list';

export default function TasksPage() {
  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-3xl font-bold">Správa úloh</h1>
      
      <TaskList 
        title="Všetky úlohy" 
        showFilters={true}
        limit={50}
      />
    </div>
  );
}

