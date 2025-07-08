"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { EUFooter } from '@/components/dashboard/eu-footer';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main content with sidebar */}
      <div className="flex-1">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className={`p-4 md:p-6 transition-all duration-300 ${
          sidebarOpen ? 'ml-80' : 'ml-0'
        }`}>
          {children}
        </main>
      </div>
      
      <footer className="container mx-auto">
        <EUFooter />
      </footer>
    </div>
  );
}

