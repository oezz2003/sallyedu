import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Navbar from './ui/navpar'; 
import { 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  Settings, 
  Menu, 
  X,
  GraduationCap,
  UserCheck,
  PlusCircle,
  Bell
} from 'lucide-react';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: BookOpen, label: 'Courses', href: '/courses' },
  { icon: Users, label: 'Students', href: '/students' },
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

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 shadow-lg",
        "top-16", // مساحة للـ navbar اللي فوق
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-[calc(100vh-4rem)]"> {/* تقليل الارتفاع عشان الـ navbar */}
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">EduAdmin</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700 font-medium border border-blue-200" 
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs bg-blue-600 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
            
            {/* Add User link for admin only */}
            {user?.role === 'admin' && (
              <Link
                to="/add-user"
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors bg-green-50 text-green-700 hover:bg-green-100 mt-2 border border-green-200"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="flex items-center space-x-3">
                  <PlusCircle className="w-4 h-4" />
                  <span>Add User</span>
                </div>
              </Link>
            )}
          </nav>

          {/* User info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <Link 
                to="/profile" 
                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0) || user?.avatar || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'admin@eduplatform.com'}
                  </p>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="mt-2 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 pt-16"> {/* مساحة للـ navbar اللي فوق */}
        {/* Header للـ Dashboard فقط */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              
              <h1 className="text-lg font-semibold  text-gray-900">
                Educational Platform Admin
              </h1>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}