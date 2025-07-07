"use client";

import { StatsWidget } from '@/components/dashboard/stats-widget';
import { TaskList } from '@/components/dashboard/task-list';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ComplianceBadge } from '@/components/dashboard/compliance-badge';

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Stats overview */}
      <section>
        <StatsWidget />
      </section>
      
      {/* Compliance status */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">INTERREG Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComplianceBadge 
            category="VISUAL_IDENTITY"
            status="COMPLIANT"
            title="Vizuálna identita"
            description="Všetky materiály spĺňajú požiadavky INTERREG vizuálnej identity"
          />
          <ComplianceBadge 
            category="SANCTIONS_CHECK"
            status="COMPLIANT"
            title="Sankčné zoznamy"
            description="Všetci partneri boli skontrolovaní voči sankčným zoznamom EU"
          />
          <ComplianceBadge 
            category="GDPR"
            status="PENDING_REVIEW"
            title="GDPR"
            description="Čaká sa na kontrolu GDPR dokumentácie"
          />
        </div>
      </section>
      
      {/* Tasks and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks section - takes 2/3 of the width on large screens */}
        <div className="lg:col-span-2 space-y-8">
          <TaskList title="Posledné úlohy" />
        </div>
        
        {/* Activity feed - takes 1/3 of the width on large screens */}
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}

