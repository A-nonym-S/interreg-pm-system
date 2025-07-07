"use client";

import { ComplianceDashboard } from '@/components/dashboard/compliance-dashboard';

export default function CompliancePage() {
  return (
    <div className="space-y-8 pb-10">
      <h1 className="text-3xl font-bold">INTERREG Compliance Monitoring</h1>
      
      <p className="text-muted-foreground max-w-3xl">
        Monitoring súladu s pravidlami INTERREG programu. Systém automaticky kontroluje
        vizuálnu identitu, sankčné zoznamy, GDPR, reporting a finančné aspekty projektu.
      </p>
      
      <ComplianceDashboard />
    </div>
  );
}

