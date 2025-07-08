"use client";

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header with menu button */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <div className="absolute inset-0 flex items-center justify-center bg-white rounded">
              <div className="text-blue-700 font-bold text-center text-xs">
                EU
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-sm font-semibold">INTERREG HUSKROUA</h1>
          </div>
        </div>
      </header>
      
      {/* Main content with sidebar */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

