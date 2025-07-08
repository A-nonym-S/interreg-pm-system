'use client';

import React from 'react';
import { Search, Bell, Settings, User, Menu } from 'lucide-react';

interface ModernHeaderProps {
  onToggleSidebar?: () => void;
  title?: string;
  subtitle?: string;
}

export default function ModernHeader({ 
  onToggleSidebar, 
  title = "Project Dashboard",
  subtitle = "Manage and track your projects"
}: ModernHeaderProps) {
  return (
    <header className="modern-header flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>
        
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Task, Meeting, Projects..."
            className="modern-input pl-10 w-full"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3">
        {/* Time Period Tabs */}
        <div className="hidden lg:flex bg-slate-100 rounded-lg p-1">
          <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Today
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            This Week
          </button>
          <button className="px-3 py-1.5 text-sm font-medium bg-slate-900 text-white rounded-md transition-colors">
            This Month
          </button>
          <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
            Reports
          </button>
        </div>

        {/* Notification Icons */}
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell className="h-5 w-5 text-slate-600" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </button>

        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Settings className="h-5 w-5 text-slate-600" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-slate-900">John Smith</p>
            <p className="text-xs text-slate-500">Project Manager</p>
          </div>
          <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JS</span>
          </div>
        </div>
      </div>
    </header>
  );
}

