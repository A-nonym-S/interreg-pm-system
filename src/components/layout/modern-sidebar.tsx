'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Kanban, 
  Users, 
  FileText, 
  Settings, 
  Bell,
  Euro,
  BarChart3,
  TrendingUp,
  Calendar,
  Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null
  },
  {
    title: 'Úlohy',
    href: '/tasks',
    icon: CheckSquare,
    badge: 3
  },
  {
    title: 'Projektové úlohy',
    href: '/project-kanban',
    icon: Kanban,
    badge: 5
  },
  {
    title: 'Rozpočet',
    href: '/budget',
    icon: Euro,
    badge: 2
  },
  {
    title: 'Výdavky',
    href: '/expenses',
    icon: TrendingUp,
    badge: 8
  },
  {
    title: 'Reporty',
    href: '/reports',
    icon: BarChart3,
    badge: null
  },
  {
    title: 'Tím',
    href: '/team',
    icon: Users,
    badge: 12
  },
  {
    title: 'Dokumenty',
    href: '/documents',
    icon: FileText,
    badge: 10
  },
  {
    title: 'Compliance',
    href: '/compliance',
    icon: Shield,
    badge: null
  },
  {
    title: 'Kalendár',
    href: '/calendar',
    icon: Calendar,
    badge: null
  },
  {
    title: 'Nastavenia',
    href: '/settings',
    icon: Settings,
    badge: null
  }
];

export default function ModernSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IR</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">INTERREG</h1>
            <p className="text-xs text-gray-500">HUSKROUA</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || 
                          (item.href !== '/dashboard' && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <Badge 
                  variant="secondary" 
                  className={`
                    text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">JS</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">John Smith</p>
            <p className="text-xs text-gray-500 truncate">Project Manager</p>
          </div>
          <Bell className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}

