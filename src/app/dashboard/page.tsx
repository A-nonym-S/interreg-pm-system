"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { 
  TaskStatsWidget, 
  CompletedStatsWidget, 
  PendingStatsWidget, 
  ComplianceStatsWidget 
} from "@/components/dashboard/stats-widget";
import { TaskCard } from "@/components/dashboard/task-card";
import { ComplianceBadge } from "@/components/dashboard/compliance-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import type { Task, TaskStatus, Priority, TaskCategory } from "@/types";

// Mock data for demonstration
const mockTasks: Array<Partial<Task> & {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  category: TaskCategory;
}> = [
  {
    id: "1",
    externalId: "TASK-2025-01-0001",
    title: "Mesačný report pre INTERREG+",
    description: "Príprava a odoslanie mesačného reportu pokroku projektu do systému INTERREG+",
    status: "COMPLETED",
    priority: "HIGH",
    category: "REPORTING",
    assigneeId: "user1",
    deadline: new Date("2025-01-15")
  },
  {
    id: "2",
    externalId: "TASK-2025-01-0002",
    title: "Kontrola sankčných zoznamov",
    description: "Kvartálna kontrola všetkých partnerov voči sankčným zoznamom EU",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    category: "COMPLIANCE",
    assigneeId: "user2",
    deadline: new Date("2025-01-20")
  },
  {
    id: "3",
    externalId: "TASK-2025-01-0003",
    title: "Aktualizácia webovej stránky",
    description: "Pridanie nových článkov a aktualizácia vizuálnej identity podľa INTERREG štandardov",
    status: "PENDING",
    priority: "MEDIUM",
    category: "PUBLICITA",
    deadline: new Date("2025-01-25")
  },
  {
    id: "4",
    externalId: "TASK-2025-01-0004",
    title: "Finančný audit Q4",
    description: "Príprava dokumentácie pre finančný audit štvrtého kvartálu",
    status: "BLOCKED",
    priority: "HIGH",
    category: "FINANCIE",
    assigneeId: "user3",
    deadline: new Date("2025-01-30")
  }
];

const recentActivities = [
  {
    id: "1",
    type: "TASK_COMPLETED",
    user: "Mária Novák",
    description: "dokončila úlohu",
    task: "Mesačný report pre INTERREG+",
    time: "Pred 2 hodinami",
    icon: "success"
  },
  {
    id: "2",
    type: "TASK_CREATED",
    user: "AI Agent",
    description: "vytvoril novú úlohu",
    task: "Kontrola sankčných zoznamov",
    time: "Pred 4 hodinami",
    icon: "info"
  },
  {
    id: "3",
    type: "COMPLIANCE_ALERT",
    user: "Compliance System",
    description: "našiel problém s",
    task: "vizuálnou identitou",
    time: "Pred 6 hodinami",
    icon: "warning"
  }
];

export default function DashboardPage() {
  const [selectedTask, setSelectedTask] = React.useState<string | null>(null);

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold text-dark-text-primary">
          Dashboard
        </h1>
        <p className="text-dark-text-secondary">
          Prehľad projektu INTERREG HUSKROUA - Project Management System
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <TaskStatsWidget
          title="Celkový počet úloh"
          value={37}
          color="primary"
        />
        
        <CompletedStatsWidget
          title="Dokončené úlohy"
          value={24}
          change={{ value: 12, type: 'increase', period: 'za posledný mesiac' }}
          color="success"
        />
        
        <PendingStatsWidget
          title="Čakajúce úlohy"
          value={13}
          color="warning"
        />
        
        <ComplianceStatsWidget
          title="INTERREG Compliance"
          value="98%"
          change={{ value: 2, type: 'increase', period: 'za posledný kvartál' }}
          color="info"
        />
      </motion.div>

      {/* Compliance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>INTERREG Compliance Status</span>
              <Badge variant="success" size="sm">Aktívne</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ComplianceBadge
                status="COMPLIANT"
                category="VISUAL_IDENTITY"
                nextCheck={new Date("2025-02-01")}
                showDetails
              />
              <ComplianceBadge
                status="COMPLIANT"
                category="SANCTIONS_CHECK"
                nextCheck={new Date("2025-04-01")}
                showDetails
              />
              <ComplianceBadge
                status="PENDING_REVIEW"
                category="GDPR"
                nextCheck={new Date("2025-01-15")}
                showDetails
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tasks and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-dark-text-primary">
              Posledné úlohy
            </h2>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nová úloha
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4">
            {mockTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                selected={selectedTask === task.id}
                onSelect={(task) => setSelectedTask(task.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Posledná aktivita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    {/* Timeline Line */}
                    <div className="relative flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.icon === 'success' 
                          ? 'bg-semantic-success/10 text-semantic-success' 
                          : activity.icon === 'warning'
                          ? 'bg-semantic-warning/10 text-semantic-warning'
                          : 'bg-brand-primary/10 text-brand-primary'
                      }`}>
                        {activity.icon === 'success' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {activity.icon === 'warning' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        )}
                        {activity.icon === 'info' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                      </div>
                      {index < recentActivities.length - 1 && (
                        <div className="w-0.5 h-full bg-dark-border-default mt-2" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                      <p className="text-sm text-dark-text-primary">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.description}{" "}
                        <span className="font-medium">"{activity.task}"</span>
                      </p>
                      <p className="text-xs text-dark-text-muted mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

