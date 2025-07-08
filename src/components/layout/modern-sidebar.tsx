'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Folder,
  Calendar,
  MessageSquare,
  Target,
  Shield
} from 'lucide-react';

interface ModernSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ModernSidebar({ isOpen = true, onClose }: ModernSidebarProps) {
  const pathname = usePathname();

  const navigationItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      href: '/dashboard',
      active: pathname === '/dashboard'
    },
    {
      icon: CheckSquare,
      label: 'My Tasks',
      href: '/tasks',
      active: pathname.startsWith('/tasks')
    },
    {
      icon: Folder,
      label: 'Projects',
      href: '/project-kanban',
      active: pathname.startsWith('/project')
    },
    {
      icon: Calendar,
      label: 'Calendar',
      href: '/calendar',
      active: pathname === '/calendar'
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      href: '/messages',
      active: pathname === '/messages'
    },
    {
      icon: Target,
      label: 'Goals',
      href: '/goals',
      active: pathname === '/goals'
    },
    {
      icon: Shield,
      label: 'Compliance',
      href: '/compliance',
      active: pathname === '/compliance'
    },
    {
      icon: Users,
      label: 'Team',
      href: '/team',
      active: pathname === '/team'
    },
    {
      icon: BarChart3,
      label: 'Reports',
      href: '/reports',
      active: pathname === '/reports'
    },
    {
      icon: FileText,
      label: 'Documents',
      href: '/documents',
      active: pathname === '/documents'
    },
    {
      icon: HelpCircle,
      label: 'Help',
      href: '/help',
      active: pathname === '/help'
    },
    {
      icon: Settings,
      label: 'Settings',
      href: '/settings',
      active: pathname === '/settings'
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 
        modern-sidebar transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">INTERREG</h2>
              <p className="text-xs text-slate-500">HUSKROUA</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 modern-scrollbar overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  modern-sidebar-item rounded-lg
                  ${item.active ? 'active bg-blue-50 text-blue-600' : ''}
                `}
                onClick={onClose}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <div className="text-xs text-slate-400 text-center">
            HUSKROUA/2401/LIP/0001
          </div>
        </div>
      </aside>
    </>
  );
}

