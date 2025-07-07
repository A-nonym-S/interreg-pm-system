"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatsWidgetProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period?: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  loading?: boolean;
  className?: string;
}

const colorConfig = {
  primary: {
    iconBg: "bg-brand-primary/10",
    iconColor: "text-brand-primary",
    gradient: "from-brand-primary/5 to-transparent"
  },
  success: {
    iconBg: "bg-semantic-success/10",
    iconColor: "text-semantic-success",
    gradient: "from-semantic-success/5 to-transparent"
  },
  warning: {
    iconBg: "bg-semantic-warning/10",
    iconColor: "text-semantic-warning",
    gradient: "from-semantic-warning/5 to-transparent"
  },
  error: {
    iconBg: "bg-semantic-error/10",
    iconColor: "text-semantic-error",
    gradient: "from-semantic-error/5 to-transparent"
  },
  info: {
    iconBg: "bg-semantic-info/10",
    iconColor: "text-semantic-info",
    gradient: "from-semantic-info/5 to-transparent"
  }
};

export const StatsWidget: React.FC<StatsWidgetProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
  loading = false,
  className
}) => {
  const config = colorConfig[color];

  if (loading) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-dark-border-default rounded-lg" />
            {change && (
              <div className="w-16 h-4 bg-dark-border-default rounded" />
            )}
          </div>
          <div className="space-y-2">
            <div className="w-20 h-8 bg-dark-border-default rounded" />
            <div className="w-32 h-4 bg-dark-border-default rounded" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("p-6 relative overflow-hidden", className)} hover>
        {/* Background Gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-50",
          config.gradient
        )} />
        
        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              config.iconBg
            )}>
              <Icon className={cn("w-5 h-5", config.iconColor)} />
            </div>
            
            {change && (
              <div className={cn(
                "flex items-center gap-1 text-sm font-medium",
                change.type === 'increase' 
                  ? "text-semantic-success" 
                  : "text-semantic-error"
              )}>
                {change.type === 'increase' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{change.value > 0 ? '+' : ''}{change.value}%</span>
              </div>
            )}
          </div>

          {/* Value and Title */}
          <div className="space-y-1">
            <motion.p 
              className="text-3xl font-bold text-dark-text-primary"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </motion.p>
            <p className="text-sm text-dark-text-secondary font-medium">
              {title}
            </p>
          </div>

          {/* Change Period */}
          {change?.period && (
            <p className="text-xs text-dark-text-muted mt-2">
              {change.period}
            </p>
          )}
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 transform -skew-x-12" />
      </Card>
    </motion.div>
  );
};

// Specialized Stats Widgets
export const TaskStatsWidget: React.FC<Omit<StatsWidgetProps, 'icon'>> = (props) => (
  <StatsWidget 
    {...props} 
    icon={({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )}
  />
);

export const CompletedStatsWidget: React.FC<Omit<StatsWidgetProps, 'icon'>> = (props) => (
  <StatsWidget 
    {...props} 
    icon={({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )}
  />
);

export const PendingStatsWidget: React.FC<Omit<StatsWidgetProps, 'icon'>> = (props) => (
  <StatsWidget 
    {...props} 
    icon={({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
  />
);

export const ComplianceStatsWidget: React.FC<Omit<StatsWidgetProps, 'icon'>> = (props) => (
  <StatsWidget 
    {...props} 
    icon={({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
  />
);

