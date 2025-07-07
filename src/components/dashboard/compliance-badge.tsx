"use client";

import { Card, CardContent } from '@/components/ui/card';
import { ComplianceCategory, ComplianceStatus } from '@/types';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  XCircle,
  FileText,
  Shield,
  Database,
  BarChart
} from 'lucide-react';

// Status icon mapping
const statusIcons = {
  [ComplianceStatus.COMPLIANT]: <CheckCircle className="h-6 w-6 text-green-500" />,
  [ComplianceStatus.NON_COMPLIANT]: <XCircle className="h-6 w-6 text-red-500" />,
  [ComplianceStatus.PENDING_REVIEW]: <Clock className="h-6 w-6 text-yellow-500" />,
  [ComplianceStatus.NEEDS_ACTION]: <AlertTriangle className="h-6 w-6 text-orange-500" />,
};

// Status text mapping
const statusText = {
  [ComplianceStatus.COMPLIANT]: 'Vyhovuje',
  [ComplianceStatus.NON_COMPLIANT]: 'Nevyhovuje',
  [ComplianceStatus.PENDING_REVIEW]: 'Čaká na kontrolu',
  [ComplianceStatus.NEEDS_ACTION]: 'Vyžaduje akciu',
};

// Category icon mapping
const categoryIcons = {
  [ComplianceCategory.VISUAL_IDENTITY]: <FileText className="h-6 w-6 text-purple-500" />,
  [ComplianceCategory.SANCTIONS_CHECK]: <Shield className="h-6 w-6 text-red-500" />,
  [ComplianceCategory.GDPR]: <Database className="h-6 w-6 text-blue-500" />,
  [ComplianceCategory.REPORTING]: <BarChart className="h-6 w-6 text-green-500" />,
  [ComplianceCategory.FINANCIAL]: <BarChart className="h-6 w-6 text-yellow-500" />,
};

// Status color mapping
const statusColors = {
  [ComplianceStatus.COMPLIANT]: 'bg-green-500/10 border-green-500/20',
  [ComplianceStatus.NON_COMPLIANT]: 'bg-red-500/10 border-red-500/20',
  [ComplianceStatus.PENDING_REVIEW]: 'bg-yellow-500/10 border-yellow-500/20',
  [ComplianceStatus.NEEDS_ACTION]: 'bg-orange-500/10 border-orange-500/20',
};

interface ComplianceBadgeProps {
  category: ComplianceCategory;
  status: ComplianceStatus;
  title?: string;
  description?: string;
  onClick?: () => void;
}

export function ComplianceBadge({ 
  category, 
  status, 
  title, 
  description,
  onClick
}: ComplianceBadgeProps) {
  return (
    <Card 
      className={`${statusColors[status]} hover:border-primary/50 transition-all ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="mt-1">
            {categoryIcons[category] || <FileText className="h-6 w-6 text-muted-foreground" />}
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-1">
            <h3 className="font-medium">{title || category}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          {/* Status */}
          <div className="flex flex-col items-center gap-1">
            {statusIcons[status]}
            <span className="text-xs font-medium">{statusText[status]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

