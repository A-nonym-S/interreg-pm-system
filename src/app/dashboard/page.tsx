'use client';

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  Plus,
  MoreHorizontal,
  Calendar,
  Users,
  FileText,
  ArrowUpRight
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* My Tasks Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Plus className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Today</span>
              <span>Tomorrow</span>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">12</div>
              <div className="text-sm text-gray-500">On Going Tasks</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-700">37</div>
              <div className="text-xs text-gray-400">Total Tasks</div>
            </div>
          </div>
        </div>

        {/* Projects Overview Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Projects Overview</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowUpRight className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="32, 100"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeDasharray="14, 100"
                  strokeDashoffset="-32"
                />
              </svg>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-600">In Progress: 14</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-gray-600">Completed: 32</span>
              </div>
            </div>
            <div className="text-center text-gray-500 text-xs mt-3">
              Not Started: 54
            </div>
          </div>
        </div>

        {/* Income VS Expense Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Income VS Expense</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-2 text-sm mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">• Income: 24,600$</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">• Expense: 13,290$</span>
            </div>
          </div>
          
          <div className="h-24 bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl flex items-end justify-center p-3">
            <svg className="w-full h-full" viewBox="0 0 200 60">
              <polyline
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                points="10,50 30,30 50,40 70,20 90,35 110,15 130,25 150,10 170,20 190,5"
              />
              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth="3"
                points="10,55 30,45 50,50 70,40 90,45 110,35 130,40 150,30 170,35 190,25"
              />
            </svg>
          </div>
        </div>

        {/* My Meetings Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Meetings</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Calendar className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div>
                <div className="font-medium text-gray-900 text-sm">App Project</div>
                <div className="text-xs text-gray-500">6:45 PM</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                  Meet
                </span>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
              <div>
                <div className="font-medium text-gray-900 text-sm">User Research</div>
                <div className="text-xs text-gray-500">6:45 PM</div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  Zoom
                </span>
                <ArrowUpRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 py-2 font-medium">
              See All Meetings →
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Tasks</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  title: "BrightBridge - Website Design",
                  description: "Design a frame website with modern templates",
                  status: "completed",
                  priority: "high",
                  progress: 100,
                  avatar: "❤️"
                },
                {
                  title: "Github - Upload Dev Files & Images",
                  description: "Collaborate with the developers to handle the SaaS Project.",
                  status: "completed",
                  priority: "medium",
                  progress: 100,
                  avatar: "🐙"
                },
                {
                  title: "9TDesign - Mobile App Prototype",
                  description: "Ready prototype for testing user in this week.",
                  status: "in-progress",
                  priority: "high",
                  progress: 75,
                  avatar: "📱"
                },
                {
                  title: "Horizon - Dashboard Design",
                  description: "Design a dashboard",
                  status: "in-progress",
                  priority: "low",
                  progress: 45,
                  avatar: "🎨"
                }
              ].map((task, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">
                      {task.avatar}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs mb-3">
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {task.priority.toUpperCase()}
                      </span>
                      
                      <span className="text-gray-500">Progress: {task.progress}%</span>
                      
                      {task.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Open Tickets */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Open Tickets</h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Jacob Martinez", avatar: "JM", message: "I need 3 more new features on the mobile app design." },
                { name: "Luke Bell", avatar: "LB", message: "I need 3 more new features on the mobile app design." },
                { name: "Connor Mitchell", avatar: "CM", message: "I need 3 more new features on the mobile app design." }
              ].map((ticket, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {ticket.avatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{ticket.name}</h4>
                    <p className="text-xs text-gray-600 mt-1 mb-2">{ticket.message}</p>
                    
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                      Check →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Overview */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Invoice Overview</h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { label: "Overdue", value: "5 | USD 183,00$", color: "bg-purple-500", width: "80%" },
                { label: "Not Paid", value: "5 | USD 183,00$", color: "bg-red-500", width: "60%" },
                { label: "Partially Paid", value: "5 | USD 183,00$", color: "bg-blue-500", width: "40%" },
                { label: "Fully Paid", value: "5 | USD 183,00$", color: "bg-green-500", width: "90%" },
                { label: "Draft", value: "5 | USD 183,00$", color: "bg-gray-400", width: "20%" }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                      style={{ width: item.width }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

