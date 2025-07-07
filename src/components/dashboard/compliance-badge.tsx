"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Shield,
  Eye,
  FileText,
  CreditCard,
  Users
} from "lucide-react";
import type { ComplianceStatus, ComplianceCategory } from "@/types";

interface ComplianceBadgeProps {
  status: ComplianceStatus;
  category: ComplianceCategory;
  nextCheck?: Date;
  lastCheck?: Date;
  details?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

const statusConfig = {
  COMPLIANT: {
    icon: CheckCircle,
    color: "text-semantic-success bg-semantic-success/10 border-semantic-success/20",
    label: "Vyhovuje",
    bgColor: "bg-semantic-success/5"
  },
  NON_COMPLIANT: {
    icon: XCircle,
    color: "text-semantic-error bg-semantic-error/10 border-semantic-error/20",
    label: "Nevyhovuje",
    bgColor: "bg-semantic-error/5"
  },
  PENDING_REVIEW: {
    icon: Clock,
    color: "text-semantic-warning bg-semantic-warning/10 border-semantic-warning/20",
    label: "Čaká na kontrolu",
    bgColor: "bg-semantic-warning/5"
  },
  NEEDS_ACTION: {
    icon: AlertCircle,
    color: "text-semantic-error bg-semantic-error/10 border-semantic-error/20",
    label: "Vyžaduje akciu",
    bgColor: "bg-semantic-error/5"
  }
};

const categoryConfig = {
  VISUAL_IDENTITY: {
    icon: Eye,
    label: "Vizuálna identita",
    description: "EU a INTERREG logá, farby, fonty"
  },
  SANCTIONS_CHECK: {
    icon: Shield,
    label: "Sankčné zoznamy",
    description: "Kontrola partnerov voči sankčným zoznamom"
  },
  GDPR: {
    icon: Users,
    label: "GDPR",
    description: "Ochrana osobných údajov"
  },
  REPORTING: {
    icon: FileText,
    label: "Reportovanie",
    description: "PPR a INTERREG+ reporty"
  },
  FINANCIAL: {
    icon: CreditCard,
    label: "Finančné",
    description: "Finančné pravidlá a kontroly"
  }
};

const sizeConfig = {
  sm: {
    container: "px-2 py-1 text-xs",
    icon: "w-3 h-3",
    spacing: "gap-1"
  },
  md: {
    container: "px-3 py-1.5 text-sm",
    icon: "w-4 h-4",
    spacing: "gap-2"
  },
  lg: {
    container: "px-4 py-2 text-base",
    icon: "w-5 h-5",
    spacing: "gap-3"
  }
};

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({
  status,
  category,
  nextCheck,
  lastCheck,
  details,
  className,
  size = "md",
  showDetails = false
}) => {
  const statusInfo = statusConfig[status];
  const categoryInfo = categoryConfig[category];
  const sizeInfo = sizeConfig[size];
  
  const StatusIcon = statusInfo.icon;
  const CategoryIcon = categoryInfo.icon;

  if (showDetails) {
    return (
      <div className={cn(
        "rounded-lg border border-dark-border-default p-4 space-y-3",
        statusInfo.bgColor,
        className
      )}>
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              statusInfo.color
            )}>
              <CategoryIcon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-medium text-dark-text-primary">
                {categoryInfo.label}
              </h4>
              <p className="text-xs text-dark-text-muted">
                {categoryInfo.description}
              </p>
            </div>
          </div>
          
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
            statusInfo.color
          )}>
            <StatusIcon className="w-3 h-3" />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Details */}
        {details && (
          <p className="text-sm text-dark-text-secondary">
            {details}
          </p>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-dark-text-muted">
          {lastCheck && (
            <span>
              Posledná kontrola: {formatDate(lastCheck, 'short')}
            </span>
          )}
          {nextCheck && (
            <span>
              Ďalšia kontrola: {formatDate(nextCheck, 'short')}
            </span>
          )}
        </div>

        {/* EU Badge */}
        <div className="flex items-center justify-between pt-2 border-t border-dark-border-subtle">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-brand-eu rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">EU</span>
            </div>
            <span className="text-xs font-medium text-dark-text-primary">
              INTERREG Compliance
            </span>
          </div>
          
          {status === 'COMPLIANT' && (
            <div className="flex items-center gap-1 text-semantic-success">
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs font-medium">Certifikované</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center rounded-lg border",
      sizeInfo.container,
      sizeInfo.spacing,
      statusInfo.color,
      className
    )}>
      <div className={cn(
        "p-1 rounded-md",
        statusInfo.color
      )}>
        <CategoryIcon className={sizeInfo.icon} />
      </div>
      
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate">
          {categoryInfo.label}
        </span>
        <span className="text-xs opacity-75 truncate">
          {statusInfo.label}
        </span>
      </div>
      
      {nextCheck && size !== 'sm' && (
        <div className="ml-2 pl-2 border-l border-current/20">
          <span className="text-xs opacity-75 whitespace-nowrap">
            {formatDate(nextCheck, 'short')}
          </span>
        </div>
      )}
    </div>
  );
};

// EU Identity Footer Component
export const EUIdentityFooter: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <footer className={cn(
      "py-6 px-8 bg-dark-bg-secondary border-t border-dark-border-subtle",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* EU Logos */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-6 bg-brand-eu rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">EU</span>
            </div>
            <div className="h-8 w-px bg-dark-border-default" />
            <span className="text-sm font-medium text-dark-text-primary">INTERREG</span>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-dark-text-tertiary">
            <p>Financované Európskou úniou</p>
            <p>HUSKROUA/2301/4.1/0045</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-dark-text-muted">
            #InterregNEXT #HUSKROUA
          </span>
        </div>
      </div>
    </footer>
  );
};

