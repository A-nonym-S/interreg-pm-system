"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
}

