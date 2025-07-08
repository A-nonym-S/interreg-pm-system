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
  DollarSign,
  Megaphone
} from 'lucide-react';

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Projektové úlohy',
    href: '/project-kanban',
    icon: CheckSquare,
  },
  {
    title: 'Rozpočet',
    href: '/budget',
    icon: DollarSign,
  },
  {
    title: 'Výdavky',
    href: '/expenses',
    icon: FileText,
  },
  {
    title: 'Publicity',
    href: '/publicity',
    icon: Megaphone,
  },
  {
    title: 'Tím',
    href: '/team',
    icon: Users,
  },
  {
    title: 'Reporty',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'Nastavenia',
    href: '/settings',
    icon: Settings,
  },
];

export default function ModernSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IR</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">INTERREG</h1>
            <p className="text-xs text-gray-500">HUSKROUA</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
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
        </div>
      </div>
    </div>
  );
}

