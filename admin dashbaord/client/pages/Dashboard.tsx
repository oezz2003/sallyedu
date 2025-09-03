import React, { useState } from 'react';
import { CourseWithVideos, VideoContent, coursesWithContent } from '@/lib/coursesData';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAdminData } from '@/hooks/useAdminData';
import AddCourseDialog from '../components/AddCourseDialog';
import {
  BookOpen,
  Users,
  UserCheck,
  TrendingUp,
  Star,
  Calendar,
  Clock,
  Award,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Video,
  Trash2,
  Save,
  DollarSign,
  CreditCard,
  BarChart3,
  Target,
  ClipboardCheck
} from 'lucide-react';
import Footer from '@/components/ui/footer';

export default function Dashboard() {
  const { analytics, revenueData, students, loading, error, isAuthenticated, isAuthorized, userRole, getTopCourses } = useAdminData();
  const [courses, setCourses] = useState<CourseWithVideos[]>(coursesWithContent);
  const [editingCourse, setEditingCourse] = useState<CourseWithVideos | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const categories = ["Programming", "Data Science", "AI/ML", "Design", "Business", "Marketing"];

  // Real-time analytics stats
  const stats = analytics ? [
    {
      title: "Total Students",
      value: analytics.totalStudents.toString(),
      change: `+${((analytics.activeStudents / analytics.totalStudents) * 100).toFixed(1)}%`,
      changeType: "increase" as const,
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Active Students",
      value: analytics.activeStudents.toString(),
      change: "+8%",
      changeType: "increase" as const,
      icon: UserCheck,
      color: "bg-green-500"
    },
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      change: "+15%",
      changeType: "increase" as const,
      icon: DollarSign,
      color: "bg-green-600"
    },
    {
      title: "Monthly Revenue",
      value: `$${analytics.monthlyRevenue.toLocaleString()}`,
      change: `${((analytics.monthlyRevenue / analytics.totalRevenue) * 100).toFixed(1)}%`,
      changeType: "increase" as const,
      icon: TrendingUp,
      color: "bg-purple-500"
    },
    {
      title: "Courses Sold",
      value: analytics.totalCoursesSold.toString(),
      change: "+12%",
      changeType: "increase" as const,
      icon: BookOpen,
      color: "bg-orange-500"
    },
    {
      title: "Avg Order Value",
      value: `$${analytics.averageOrderValue.toFixed(2)}`,
      change: `${analytics.completionRate.toFixed(1)}%`,
      changeType: "increase" as const,
      icon: CreditCard,
      color: "bg-indigo-500"
    }
  ] : [];



  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-blue-600 text-xl">🔐</span>
              </div>
              <div>
                <h3 className="text-lg font-medium">Authentication Required</h3>
                <p className="text-muted-foreground">Please sign in to access the admin dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-red-600 text-xl">🚫</span>
              </div>
              <div>
                <h3 className="text-lg font-medium">Access Denied</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                {(userRole === 'student' || userRole === 'user') && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                    <p className="text-yellow-800 font-medium mb-2">Student Account Detected</p>
                    <p className="text-yellow-700">
                      This dashboard is restricted to administrators and staff members only. 
                      Students should use the <strong>Student Dashboard</strong> to access courses and manage their learning.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-medium">Error Loading Dashboard</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              {userRole && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white shadow-sm">
                  {userRole === 'admin' ? '👑 Administrator' : 
                   userRole === 'editor' ? '✏️ Editor' : 
                   userRole === 'user' ? '👤 Student' : 
                   '👤 ' + userRole}
                </span>
              )}
            </div>
            <p className="text-gray-600 text-lg">Welcome back! Here's what's happening with your platform today.</p>
          </div>
          
          {/* Quick Actions Panel */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                onClick={() => window.location.href = '/students'}
              >
                <Users className="w-4 h-4 mr-2" />
                View Students
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                onClick={() => window.location.href = '/payments'}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payments
              </Button>
            </div>
            <AddCourseDialog
              open={isAddCourseDialogOpen}
              setOpen={setIsAddCourseDialogOpen}
              categories={categories}
              onAddCourse={(newCourse) => {
                setCourses([
                  ...courses,
                  {
                    ...newCourse,
                    id: Date.now().toString(),
                    instructors: newCourse.instructors.filter((i) => i.trim() !== ""),
                    videos: newCourse.videos.map((v, idx) => ({ ...v, order: idx + 1, id: v.id || Date.now() + idx })),
                    students: 0,
                    rating: 0,
                    status: newCourse.status,
                    progress: 0,
                    thumbnail: newCourse.thumbnail,
                  },
                ]);
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500" onClick={() => window.location.href = '/students'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Manage Students</h3>
                <p className="text-sm text-gray-500 mt-1">View and manage student accounts</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-green-500" onClick={() => window.location.href = '/payments'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Payment Center</h3>
                <p className="text-sm text-gray-500 mt-1">Monitor transactions and revenue</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-purple-500" onClick={() => window.location.href = '/enrollments'}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">Enrollments</h3>
                <p className="text-sm text-gray-500 mt-1">Track course enrollments</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <ClipboardCheck className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 border-l-orange-500" onClick={() => setIsAddCourseDialogOpen(true)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Add Course</h3>
                <p className="text-sm text-gray-500 mt-1">Create new course content</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Plus className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-xl ${stat.color} group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">{stat.value}</div>
                <div className="flex items-center text-sm">
                  {stat.changeType === "increase" ? (
                    <ArrowUpRight className="w-4 h-4 mr-1 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 mr-1 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    stat.changeType === "increase" ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {stat.change}
                  </span>
                  <span className="ml-1 text-gray-500">from last month</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">Track revenue performance over time</CardDescription>
              </div>
              <div className="p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis
                    dataKey="period"
                    className="text-gray-600"
                    fontSize={12}
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis
                    className="text-gray-600"
                    fontSize={12}
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: '#1F2937', fontWeight: 'bold' }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5, stroke: 'white' }}
                    activeDot={{ r: 7, stroke: '#3B82F6', strokeWidth: 3, fill: 'white' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Top Performing Courses
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1">Most popular courses by enrollment</CardDescription>
              </div>
              <div className="p-2 bg-purple-600 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                </div>
              ) : (
                getTopCourses(5).map((course, index) => (
                  <div key={course.courseId} className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-purple-50 hover:to-purple-100 transition-all duration-200 border border-gray-200 hover:border-purple-200">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        'bg-gradient-to-r from-purple-400 to-purple-600'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Course {course.courseId}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {course.enrollments} enrollments
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">${course.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 justify-end">
                        <Award className="w-3 h-3" />
                        {course.completions} completed
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>


<Footer/>
</div>
  );
}
