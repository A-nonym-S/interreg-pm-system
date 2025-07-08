"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  FileText, 
  Settings,
  AlertTriangle,
  BarChart,
  X,
  ChevronRight,
  Columns
} from 'lucide-react';

interface SidebarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({ open = false, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(open);
  
  // Update internal state when prop changes
  useEffect(() => {
    setIsOpen(open);
  }, [open]);
  
  // Update parent state when internal state changes
  const handleOpenChange = (value: boolean) => {
    setIsOpen(value);
    onOpenChange?.(value);
  };
  
  // Navigation items
  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: 'Kanban Board',
      href: '/kanban',
      icon: <Columns className="h-5 w-5" />,
    },
    {
      title: 'Projektové úlohy',
      href: '/project-kanban',
      icon: <Columns className="h-5 w-5" />,
    },
    {
      title: 'Úlohy',
      href: '/tasks',
      icon: <CheckSquare className="h-5 w-5" />,
      children: [
        {
          title: 'Všetky úlohy',
          href: '/tasks',
        },
        {
          title: 'Vytvoriť úlohu',
          href: '/tasks/create',
        },
        {
          title: 'Moje úlohy',
          href: '/tasks/my',
        },
      ],
    },
    {
      title: 'Compliance',
      href: '/compliance',
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      title: 'Používatelia',
      href: '/users',
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: 'Reporty',
      href: '/reports',
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: 'Dokumenty',
      href: '/documents',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: 'Nastavenia',
      href: '/settings',
      icon: <Settings className="h-5 w-5" />,
    },
  ];
  
  // Track expanded nav sections
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  
  // Toggle a nav section
  const toggleExpanded = (title: string) => {
    setExpanded((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };
  
  // Check if a nav item is active
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => handleOpenChange(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-full max-w-xs border-r bg-card p-6 shadow-lg transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 md:hidden"
          onClick={() => handleOpenChange(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close sidebar</span>
        </Button>
        
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 flex items-center justify-center bg-white rounded">
              {/* Placeholder for EU logo - in a real app, use actual logo */}
              <div className="text-blue-700 font-bold text-center text-xs">
                EU
              </div>
            </div>
          </div>
          
          <div>
            <h1 className="text-lg font-semibold">INTERREG HUSKROUA</h1>
            <p className="text-xs text-muted-foreground">Project Management System</p>
          </div>
        </div>
        
        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${
                        isActive(item.href) ? 'bg-muted font-medium' : ''
                      }`}
                      onClick={() => toggleExpanded(item.title)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                      <ChevronRight
                        className={`ml-auto h-4 w-4 transition-transform ${
                          expanded[item.title] ? 'rotate-90' : ''
                        }`}
                      />
                    </Button>
                    
                    {expanded[item.title] && (
                      <div className="ml-6 space-y-1">
                        {item.children.map((child) => (
                          <Button
                            key={child.href}
                            variant="ghost"
                            asChild
                            className={`w-full justify-start ${
                              isActive(child.href) ? 'bg-muted font-medium' : ''
                            }`}
                          >
                            <Link href={child.href}>{child.title}</Link>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    asChild
                    className={`w-full justify-start ${
                      isActive(item.href) ? 'bg-muted font-medium' : ''
                    }`}
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span className="ml-2">{item.title}</span>
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
        
        {/* Project info */}
        <div className="mt-auto pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            HUSKROUA/2401/LIP/0001
          </p>
        </div>
      </aside>
    </>
  );
}

