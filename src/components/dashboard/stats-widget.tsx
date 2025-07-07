"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { TaskStatus } from '@/types';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface StatsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  complianceRate: number;
  completionTrend: number; // percentage change
}

interface StatsWidgetProps {
  initialData?: StatsData;
}

export function StatsWidget({ initialData }: StatsWidgetProps) {
  const [stats, setStats] = useState<StatsData>(initialData || {
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    complianceRate: 0,
    completionTrend: 0
  });
  const [loading, setLoading] = useState(!initialData);
  
  // Fetch stats if not provided
  useEffect(() => {
    if (!initialData) {
      fetchStats();
    }
  }, [initialData]);
  
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all tasks
      const allTasks = await api.tasks.getTasks();
      
      // Fetch completed tasks
      const completedTasks = await api.tasks.getTasks({ status: TaskStatus.COMPLETED });
      
      // Fetch pending tasks
      const pendingTasks = await api.tasks.getTasks({ status: TaskStatus.PENDING });
      
      // Fetch compliance checks
      const complianceChecks = await api.compliance.getComplianceChecks();
      
      // Calculate compliance rate
      const compliantChecks = complianceChecks.filter(check => 
        check.status === 'COMPLIANT'
      ).length;
      
      const complianceRate = complianceChecks.length > 0
        ? Math.round((compliantChecks / complianceChecks.length) * 100)
        : 100;
      
      // Mock completion trend (in a real app, this would be calculated from historical data)
      const completionTrend = 12; // +12% for demo
      
      setStats({
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        complianceRate,
        completionTrend
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // For demo purposes, if no data is available yet
  useEffect(() => {
    if (!initialData && loading) {
      // Simulate API response with mock data
      setTimeout(() => {
        setStats({
          totalTasks: 37,
          completedTasks: 24,
          pendingTasks: 13,
          complianceRate: 98,
          completionTrend: 12
        });
        setLoading(false);
      }, 1000);
    }
  }, [initialData, loading]);
  
  // Stat cards data
  const statCards = [
    {
      title: 'Celkový počet úloh',
      value: stats.totalTasks,
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      description: 'Všetky úlohy v systéme',
    },
    {
      title: 'Dokončené úlohy',
      value: stats.completedTasks,
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      trend: stats.completionTrend,
      trendLabel: 'za posledný mesiac',
    },
    {
      title: 'Čakajúce úlohy',
      value: stats.pendingTasks,
      icon: <Clock className="h-5 w-5 text-yellow-500" />,
      description: 'Úlohy čakajúce na spracovanie',
    },
    {
      title: 'INTERREG Compliance',
      value: `${stats.complianceRate}%`,
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      description: 'Miera súladu s INTERREG pravidlami',
    },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            
            {stat.trend !== undefined && (
              <div className="flex items-center mt-1">
                {stat.trend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <p className={`text-xs ${stat.trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend >= 0 ? '+' : ''}{stat.trend}% {stat.trendLabel}
                </p>
              </div>
            )}
            
            {stat.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

