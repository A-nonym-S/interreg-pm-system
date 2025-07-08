'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderOpen, 
  Calendar, 
  MessageSquare, 
  Target, 
  Shield, 
  Users, 
  BarChart3, 
  FileText, 
  HelpCircle, 
  Settings,
  Search,
  Bell,
  RotateCcw,
  User
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, current: true },
    { name: 'My Tasks', href: '/tasks', icon: CheckSquare, current: false },
    { name: 'Projects', href: '/project-kanban', icon: FolderOpen, current: false },
    { name: 'Calendar', href: '/calendar', icon: Calendar, current: false },
    { name: 'Messages', href: '/messages', icon: MessageSquare, current: false },
    { name: 'Goals', href: '/goals', icon: Target, current: false },
    { name: 'Compliance', href: '/compliance', icon: Shield, current: false },
    { name: 'Team', href: '/team', icon: Users, current: false },
    { name: 'Reports', href: '/reports', icon: BarChart3, current: false },
    { name: 'Documents', href: '/documents', icon: FileText, current: false },
    { name: 'Help', href: '/help', icon: HelpCircle, current: false },
    { name: 'Settings', href: '/settings', icon: Settings, current: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo */}
        <div className="flex items-center px-6 py-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div className="ml-3">
              <div className="text-lg font-bold text-gray-900">INTERREG</div>
              <div className="text-xs text-gray-500">HUSKROUA</div>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="text-xs text-gray-500 mb-1">HUSKROUA/2401/LIP/0001</div>
          <div className="flex items-center">
            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                  {item.name === 'My Tasks' && (
                    <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">3</span>
                  )}
                  {item.name === 'Projects' && (
                    <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">5</span>
                  )}
                  {item.name === 'Messages' && (
                    <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">2</span>
                  )}
                  {item.name === 'Team' && (
                    <span className="ml-auto bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">8</span>
                  )}
                  {item.name === 'Reports' && (
                    <span className="ml-auto bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">12</span>
                  )}
                  {item.name === 'Documents' && (
                    <span className="ml-auto bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">10</span>
                  )}
                </a>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                    <div className="w-full h-0.5 bg-gray-600"></div>
                    <div className="w-full h-0.5 bg-gray-600"></div>
                    <div className="w-full h-0.5 bg-gray-600"></div>
                  </div>
                </button>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Project Dashboard</h1>
                  <p className="text-sm text-gray-600">Manage and track your projects</p>
                </div>
              </div>

              {/* Center - Search */}
              <div className="flex-1 max-w-lg mx-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Task, Meeting, Projects..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Time period tabs */}
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-white transition-colors">
                    Today
                  </button>
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-white transition-colors">
                    This Week
                  </button>
                  <button className="px-3 py-1 text-sm font-medium bg-white text-gray-900 rounded-md shadow-sm">
                    This Month
                  </button>
                  <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-md hover:bg-white transition-colors">
                    Reports
                  </button>
                </div>

                {/* Notification icons */}
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <RotateCcw className="h-5 w-5" />
                </button>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="h-5 w-5" />
                </button>

                {/* User profile */}
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">John Smith</div>
                    <div className="text-xs text-gray-500">Project Manager</div>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">JS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}

