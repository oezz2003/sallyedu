import React, { useState, useEffect } from 'react';
import { enrollmentService, userService, courseService, adminOperations, CourseEnrollment, UserProfile, Course, testFirebaseConnection } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import {
  Search,
  Users,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Award,
  BarChart3,
  PlusCircle,
  GraduationCap,
  Activity
} from 'lucide-react';

// Enhanced Enrollment with user and course details
interface EnrollmentWithDetails extends CourseEnrollment {
  user?: UserProfile;
  course?: Course;
}

// Analytics data structure
interface EnrollmentAnalytics {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  averageProgress: number;
  completionRate: number;
  statusDistribution: Array<{ status: string; count: number; color: string }>;
  progressDistribution: Array<{ range: string; count: number }>;
  monthlyEnrollments: Array<{ month: string; enrollments: number; completions: number }>;
  coursePopularity: Array<{ courseTitle: string; enrollments: number; completionRate: number }>;
}

const ENROLLMENT_STATUS_COLORS = {
  active: '#10b981',
  completed: '#3b82f6',
  paused: '#f59e0b',
  cancelled: '#ef4444'
};

// Form interface for creating new enrollments
interface CreateEnrollmentForm {
  userId: string;
  courseId: string;
  paymentId: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
}

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [progressFilter, setProgressFilter] = useState("all");
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: 'active' as CourseEnrollment['status'],
    progress: 0,
    completedLessons: 0
  });

  // Create form state
  const [createForm, setCreateForm] = useState<CreateEnrollmentForm>({
    userId: '',
    courseId: '',
    paymentId: '',
    status: 'active'
  });

  // Analytics data
  const [analytics, setAnalytics] = useState<EnrollmentAnalytics>({
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    cancelledEnrollments: 0,
    averageProgress: 0,
    completionRate: 0,
    statusDistribution: [],
    progressDistribution: [],
    monthlyEnrollments: [],
    coursePopularity: []
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading enrollments data...');
      
      // Test Firebase connection first
      const isConnected = await testFirebaseConnection();
      if (!isConnected) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the database. Please check your internet connection.",
          variant: "destructive",
        });
        return;
      }
      
      // Load enrollments, users, and courses in parallel
      const [enrollmentsResult, usersResult, coursesResult] = await Promise.all([
        enrollmentService.getAll([], 'enrollmentDate', 'desc'),
        userService.getAll(),
        courseService.getAll()
      ]);
      
      console.log('Data loaded:', {
        enrollments: enrollmentsResult.data.length,
        users: usersResult.data.length,
        courses: coursesResult.data.length
      });
      
      // Create lookup maps
      const usersMap = new Map(usersResult.data.map(user => [user.id!, user]));
      const coursesMap = new Map(coursesResult.data.map(course => [course.id!, course]));
      
      // Enhance enrollments with user and course details
      const enhancedEnrollments: EnrollmentWithDetails[] = enrollmentsResult.data.map(enrollment => ({
        ...enrollment,
        user: usersMap.get(enrollment.userId),
        course: coursesMap.get(enrollment.courseId)
      }));
      
      setEnrollments(enhancedEnrollments);
      setUsers(usersResult.data);
      setCourses(coursesResult.data);
      calculateAnalytics(enhancedEnrollments);
      
      console.log('Enrollments data loaded successfully');
    } catch (error) {
      console.error('Error loading enrollments data:', error);
      
      let errorMessage = "Failed to load enrollments data. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = "Permission denied. Please check your access rights.";
        } else if (error.message.includes('unavailable')) {
          errorMessage = "Service temporarily unavailable. Please check your internet connection.";
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (enrollmentsData: EnrollmentWithDetails[]) => {
    const totalEnrollments = enrollmentsData.length;
    const activeEnrollments = enrollmentsData.filter(e => e.status === 'active').length;
    const completedEnrollments = enrollmentsData.filter(e => e.status === 'completed').length;
    const cancelledEnrollments = enrollmentsData.filter(e => e.status === 'cancelled').length;
    
    // Average progress
    const averageProgress = enrollmentsData.length > 0 
      ? enrollmentsData.reduce((sum, e) => sum + e.progress, 0) / enrollmentsData.length 
      : 0;
    
    // Completion rate
    const completionRate = totalEnrollments > 0 
      ? (completedEnrollments / totalEnrollments) * 100 
      : 0;
    
    // Status distribution
    const statusMap = new Map();
    enrollmentsData.forEach(enrollment => {
      const status = enrollment.status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    
    const statusDistribution = Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        count,
        color: ENROLLMENT_STATUS_COLORS[status as keyof typeof ENROLLMENT_STATUS_COLORS] || '#6b7280'
      }));
    
    // Progress distribution
    const progressRanges = [
      { range: '0-25%', min: 0, max: 25 },
      { range: '26-50%', min: 26, max: 50 },
      { range: '51-75%', min: 51, max: 75 },
      { range: '76-99%', min: 76, max: 99 },
      { range: '100%', min: 100, max: 100 }
    ];
    
    const progressDistribution = progressRanges.map(range => ({
      range: range.range,
      count: enrollmentsData.filter(e => e.progress >= range.min && e.progress <= range.max).length
    }));
    
    // Monthly enrollments (last 12 months)
    const now = new Date();
    const monthlyEnrollments = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnrollments = enrollmentsData.filter(e => {
        const enrollmentDate = new Date(e.enrollmentDate);
        return enrollmentDate.getMonth() === date.getMonth() && 
               enrollmentDate.getFullYear() === date.getFullYear();
      });
      
      monthlyEnrollments.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        enrollments: monthEnrollments.length,
        completions: monthEnrollments.filter(e => e.status === 'completed').length
      });
    }
    
    // Course popularity
    const courseMap = new Map();
    enrollmentsData.forEach(enrollment => {
      const courseId = enrollment.courseId;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, {
          course: enrollment.course,
          enrollments: 0,
          completions: 0
        });
      }
      const courseData = courseMap.get(courseId);
      courseData.enrollments += 1;
      if (enrollment.status === 'completed') {
        courseData.completions += 1;
      }
    });
    
    const coursePopularity = Array.from(courseMap.entries())
      .map(([courseId, data]) => ({
        courseTitle: data.course?.title || 'Unknown Course',
        enrollments: data.enrollments,
        completionRate: data.enrollments > 0 ? (data.completions / data.enrollments) * 100 : 0
      }))
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 10);
    
    setAnalytics({
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      cancelledEnrollments,
      averageProgress,
      completionRate,
      statusDistribution,
      progressDistribution,
      monthlyEnrollments,
      coursePopularity
    });
  };

  // Filter enrollments based on search and filters
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      (enrollment.user?.firstName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (enrollment.user?.lastName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (enrollment.user?.email || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (enrollment.course?.title || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    
    const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter;
    const matchesCourse = courseFilter === "all" || enrollment.courseId === courseFilter;
    
    let matchesProgress = true;
    if (progressFilter !== "all") {
      switch (progressFilter) {
        case "0-25":
          matchesProgress = enrollment.progress >= 0 && enrollment.progress <= 25;
          break;
        case "26-50":
          matchesProgress = enrollment.progress >= 26 && enrollment.progress <= 50;
          break;
        case "51-75":
          matchesProgress = enrollment.progress >= 51 && enrollment.progress <= 75;
          break;
        case "76-99":
          matchesProgress = enrollment.progress >= 76 && enrollment.progress <= 99;
          break;
        case "100":
          matchesProgress = enrollment.progress === 100;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesCourse && matchesProgress;
  });

  // Helper to get ID token for admin API calls
  const getIdToken = async (): Promise<string> => {
    const current = auth.currentUser;
    if (!current) throw new Error('Not authenticated');
    return await current.getIdToken();
  };

  // CRUD Operations (secured via Admin SDK)
  const handleCreateEnrollment = async () => {
    try {
      if (!createForm.userId || !createForm.courseId) {
        toast({
          title: "Error",
          description: "Please select both user and course.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      
      const idToken = await getIdToken();
      const resp = await fetch('/api/admin/create-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          userId: createForm.userId,
          courseId: createForm.courseId,
          paymentId: createForm.paymentId || '',
          status: createForm.status
        }),
      });
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Failed to create enrollment');
      }
      
      toast({
        title: "Success",
        description: "Enrollment created successfully.",
      });
      
      setIsCreateDialogOpen(false);
      setCreateForm({ userId: '', courseId: '', paymentId: '', status: 'active' });
      await loadData();
    } catch (error: any) {
      console.error('Error creating enrollment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create enrollment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEnrollment = async () => {
    if (!selectedEnrollment?.id) return;

    try {
      setLoading(true);
      
      const idToken = await getIdToken();
      const resp = await fetch('/api/admin/update-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          enrollmentId: selectedEnrollment.id,
          updates: editForm
        }),
      });
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Failed to update enrollment');
      }
      
      toast({
        title: "Success",
        description: "Enrollment updated successfully.",
      });
      
      setIsEditDialogOpen(false);
      setSelectedEnrollment(null);
      await loadData();
    } catch (error: any) {
      console.error('Error updating enrollment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update enrollment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (enrollmentId: string, newProgress: number) => {
    try {
      // Calculate completed lessons based on progress and total lessons
      const enrollment = enrollments.find(e => e.id === enrollmentId);
      if (!enrollment) return;
      
      const completedLessons = Math.floor((newProgress / 100) * enrollment.totalLessons);
      
      const idToken = await getIdToken();
      const resp = await fetch('/api/admin/update-enrollment-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          enrollmentId,
          progress: newProgress,
          completedLessons
        }),
      });
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Failed to update progress');
      }
      
      toast({
        title: "Success",
        description: "Progress updated successfully.",
      });
      
      await loadData();
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update progress.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEnrollment = async (enrollmentId: string) => {
    try {
      const idToken = await getIdToken();
      const resp = await fetch('/api/admin/cancel-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ enrollmentId }),
      });
      
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({} as any));
        throw new Error(err?.error || 'Failed to cancel enrollment');
      }
      
      toast({
        title: "Success",
        description: "Enrollment cancelled successfully.",
      });
      
      await loadData();
    } catch (error: any) {
      console.error('Error cancelling enrollment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel enrollment.",
        variant: "destructive",
      });
    }
  };

  const handleIssueCertificate = async () => {
    if (!selectedEnrollment?.id) return;
    
    try {
      setLoading(true);
      await enrollmentService.issueCertificate(selectedEnrollment.id);
      
      toast({
        title: "Success",
        description: "Certificate issued successfully.",
      });
      
      setIsCertificateDialogOpen(false);
      setSelectedEnrollment(null);
      await loadData();
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast({
        title: "Error",
        description: "Failed to issue certificate.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const openViewDialog = (enrollment: EnrollmentWithDetails) => {
    setSelectedEnrollment(enrollment);
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (enrollment: EnrollmentWithDetails) => {
    setSelectedEnrollment(enrollment);
    setEditForm({
      status: enrollment.status,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons
    });
    setIsEditDialogOpen(true);
  };

  const openCertificateDialog = (enrollment: EnrollmentWithDetails) => {
    setSelectedEnrollment(enrollment);
    setIsCertificateDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enrollment Management</h1>
          <p className="text-muted-foreground">Comprehensive student enrollment analytics and management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            {analytics.totalEnrollments} Total Enrollments
          </Badge>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Create Enrollment
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">All course enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeEnrollments}</div>
            <p className="text-xs text-muted-foreground">Currently active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Courses completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageProgress.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Trends</CardTitle>
            <CardDescription>Monthly enrollments and completions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.monthlyEnrollments}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                  <YAxis className="text-muted-foreground" fontSize={12} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" strokeWidth={2} name="Enrollments" />
                  <Line type="monotone" dataKey="completions" stroke="hsl(var(--secondary))" strokeWidth={2} name="Completions" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Enrollment statuses breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, count }) => `${status}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}