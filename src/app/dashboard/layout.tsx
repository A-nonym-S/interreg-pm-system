"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { EUIdentityFooter } from "@/components/dashboard/compliance-badge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-dark-bg-primary flex">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onCollapse={setSidebarCollapsed} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-dark-border-subtle bg-dark-bg-secondary">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-dark-text-primary">
                INTERREG HUSKROUA
              </h1>
              <span className="text-sm text-dark-text-secondary">
                Project Management System
              </span>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-dark-text-primary">Admin User</p>
                <p className="text-xs text-dark-text-secondary">admin@interreg.eu</p>
              </div>
              <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* EU Footer */}
        <EUIdentityFooter />
      </div>
    </div>
  );
}

