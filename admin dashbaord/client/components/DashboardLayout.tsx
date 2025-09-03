import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Navbar from './ui/navpar'; 
import { 
  Users, 
  LayoutDashboard, 
  Settings, 
  Menu, 
  X,
  GraduationCap,
  UserCheck,
  PlusCircle,
  Bell,
  CreditCard,
  ClipboardList
} from 'lucide-react';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Users, label: 'Students', href: '/students' },
  { icon: GraduationCap, label: 'Courses', href: '/courses' },
  { icon: CreditCard, label: 'Payments', href: '/payments' },
  { icon: ClipboardList, label: 'Enrollments', href: '/enrollments' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get current user from localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    user = null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* الـ Navbar في الأول خالص */}
      <Navbar />
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-xl",
        "top-16", // Space for navbar
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-[calc(100vh-4rem)]"> 
          {/* Enhanced Logo Section */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">EduAdmin</span>
                <p className="text-xs text-gray-600">Learning Management</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-white/80"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Main Menu</p>
            </div>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "group flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all duration-200 relative",
                    isActive 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-[1.02]" 
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:scale-[1.01] hover:shadow-md"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                    )} />
                    <span className={cn(
                      "font-medium transition-all duration-200",
                      isActive ? "text-white" : "text-gray-700 group-hover:text-gray-900"
                    )}>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
                  )}
                </Link>
              );
            })}
            
            {/* Enhanced Add User Section */}
            {user?.role === 'admin' && (
              <div className="mt-6">
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3">Admin Tools</p>
                </div>
                <Link
                  to="/add-user"
                  className={cn(
                    "group flex items-center justify-between px-4 py-3 text-sm rounded-xl transition-all duration-200 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 hover:scale-[1.01] hover:shadow-md"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <PlusCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Add New User</span>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </Link>
              </div>
            )}
          </nav>

          {/* Enhanced User Profile Section */}
          <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex flex-col gap-3">
              <Link 
                to="/profile" 
                className="group flex items-center space-x-3 p-4 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-gray-300 hover:shadow-md"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user?.name?.charAt(0) || user?.avatar || 'A'}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'admin@eduplatform.com'}
                  </p>
                </div>
                <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="lg:pl-72 pt-16 min-h-screen bg-gray-50"> 
        {/* Enhanced Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    Smart Learning Academy
                  </h1>
                  <p className="text-xs text-gray-500">Administration Panel</p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions in Header */}
            <div className="hidden sm:flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                onClick={() => window.location.reload()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2 hover:bg-yellow-50 hover:border-yellow-300 hover:text-yellow-700"
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                </Button>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with Enhanced Styling */}
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}