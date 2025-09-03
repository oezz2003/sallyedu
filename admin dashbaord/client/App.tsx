import "./global.css";
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Import dashboard components
import DashboardLayout from '@/components/DashboardLayout';
import ErrorBoundary from '@/components/ErrorBoundary';

// Import pages
import Dashboard from '@/pages/Dashboard';
import Students from '@/pages/Students';
import Courses from '@/pages/Courses';
import Payments from '@/pages/Payments';
import Enrollments from '@/pages/Enrollments';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import AddUser from '@/pages/AddUser';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import TestCourses from '@/pages/TestCourses';

// Import hooks
import { useAdminData } from '@/hooks/useAdminData';

console.log('🚀 Loading Complete Admin Dashboard...');

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAuthorized, loading, error } = useAdminData();

  console.log('🔐 Protected Route Check:', { isAuthenticated, isAuthorized, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    console.log('🚫 User not authorized for admin access');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            {error || 'You do not have permission to access the admin dashboard.'}
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Main App Component
const App: React.FC = () => {
  console.log('✅ App component rendering - Complete Admin Dashboard');
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary>
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/students" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Students />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/courses" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Courses />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/payments" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Payments />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/enrollments" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Enrollments />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/add-user" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AddUser />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/test-courses" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TestCourses />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster />
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Initialize the application
const initializeApp = () => {
  console.log('🚀 Initializing Complete Admin Dashboard...');
  
  try {
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      console.error('❌ Root element not found!');
      document.body.innerHTML = `
        <div style="padding: 20px; color: red; font-family: Arial;">
          <h2>❌ Critical Error: Root element not found</h2>
          <p>The application cannot start because the root element is missing.</p>
        </div>
      `;
      return false;
    }
    
    console.log('✅ Creating complete React admin dashboard...');
    const root = createRoot(rootElement);
    root.render(<App />);
    
    console.log('🎉 Complete Admin Dashboard successfully rendered!');
    console.log('✅ Features activated:');
    console.log('  - 🔐 Firebase Authentication');
    console.log('  - 🛡️ Protected Routes');
    console.log('  - 📊 Dashboard Analytics');
    console.log('  - 👥 User Management');
    console.log('  - 💳 Payment Management');
    console.log('  - 📝 Enrollment Management');
    console.log('  - ⚙️ Settings');
    console.log('  - 🚨 Error Boundaries');
    console.log('  - 🎨 UI Components');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error initializing admin dashboard:', error);
    document.body.innerHTML = `
      <div style="padding: 20px; color: red; font-family: Arial; max-width: 600px; margin: 50px auto;">
        <h2>❌ Admin Dashboard Initialization Error</h2>
        <p>There was an error starting the admin dashboard:</p>
        <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; margin: 10px 0;">${error instanceof Error ? error.message : String(error)}</pre>
        <p>Please check the browser console for more details and contact support if the issue persists.</p>
        <button onclick="location.reload()" style="background: #3B82F6; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">Reload Page</button>
      </div>
    `;
    return false;
  }
};

console.log('🔥 Starting Complete Admin Dashboard Application...');
initializeApp();