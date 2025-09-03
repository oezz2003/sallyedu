import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface AdminStudentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  age: number;
  accountType: 'student' | 'adult';
  enrollments: EnrollmentData[];
  payments: PaymentData[];
  totalSpent: number;
  coursesCompleted: number;
  lastLoginAt?: string;
  createdAt: string;
}

export interface EnrollmentData {
  courseId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt?: string;
  completionDate?: string;
  paymentId: string;
}

export interface PaymentData {
  id: string;
  courseId: string;
  amount: number;
  currency: string | { currency: string; amount: number };
  paymentMethod: 'credit_card' | 'paypal' | 'stripe';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: string;
  refundDate?: string;
  refundAmount?: number;
}

export interface AdminAnalytics {
  totalStudents: number;
  activeStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCoursesSold: number;
  averageOrderValue: number;
  completionRate: number;
  refundRate: number;
}

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  enrollments: number;
  refunds: number;
}

export function useAdminData() {
  const [students, setStudents] = useState<AdminStudentData[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check Firebase authentication state and user role
  useEffect(() => {
    console.log('🔍 Setting up authentication listener...');
    console.log('🔧 Firebase project:', db.app.options.projectId);
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? 'Authenticated' : 'Not authenticated');
      
      if (!user) {
        console.log('❌ No user found, redirecting to login');
        setIsAuthenticated(false);
        setIsAuthorized(false);
        setError('Please sign in to access admin dashboard');
        setLoading(false);
        return;
      }

      console.log('✅ User authenticated:', { uid: user.uid, email: user.email });
      setIsAuthenticated(true);
      
      try {
        console.log('🔍 Checking user permissions in Firestore...');
        // Get user profile to check role/permissions
        const userDocRef = doc(db, 'users', user.uid);
        console.log('📋 Fetching user document:', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const accountType = userData.accountType;
          const role = userData.role;
          
          console.log('📊 User data:', { accountType, role, age: userData.age });
          setUserRole(role || accountType);
          
          // Check if user has admin access
          // Allow access for:
          // 1. Users with explicit 'admin' role
          // 2. Users with 'editor' role
          // 3. Adult accounts (for backward compatibility)
          // Deny access for:
          // 1. Users with accountType 'student'
          // 2. Users with role 'user' (student role)
          // 3. Users under 18 years old
          if (accountType === 'student' || role === 'user' || (userData.age && userData.age < 18)) {
            setIsAuthorized(false);
            setError('Access denied. Students are not allowed to access the admin dashboard.');
            setLoading(false);
            return;
          }
          
          if (role === 'admin' || role === 'editor' || accountType === 'adult') {
            console.log('✅ User authorized for admin access');
            setIsAuthorized(true);
            setError(null);
          } else {
            console.log('❌ User not authorized:', { role, accountType });
            setIsAuthorized(false);
            setError('Access denied. You do not have admin permissions.');
            setLoading(false);
            return;
          }
        } else {
          // If no user document exists, create a basic one and deny access
          setIsAuthorized(false);
          setError('User profile not found. Please contact administrator.');
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.error('❌ Error checking user permissions:', err);
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        
        if (err.code === 'permission-denied') {
          setError('Database access denied. Please check Firestore security rules for lmssally-a0957.');
        } else if (err.code === 'unavailable') {
          setError('Firebase service unavailable. Please try again later.');
        } else {
          setError(`Error verifying permissions: ${err.message}`);
        }
        
        setIsAuthorized(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch all students with their enrollment and payment data
  useEffect(() => {
    if (!isAuthenticated || !isAuthorized) {
      console.log('⏸️ Skipping data fetch - not authenticated or authorized');
      return;
    }

    console.log('📊 Setting up real-time data listener for users collection...');
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        console.log('📊 Received users data:', snapshot.size, 'documents');
        try {
          const studentsData: AdminStudentData[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Include all users, even those without enrollments/payments
            const totalSpent = data.payments 
              ? data.payments
                  .filter((p: PaymentData) => p.status === 'completed')
                  .reduce((sum: number, p: PaymentData) => sum + p.amount, 0)
              : 0;
            
            const coursesCompleted = data.enrollments
              ? data.enrollments.filter((e: EnrollmentData) => e.status === 'completed').length
              : 0;

            studentsData.push({
              id: doc.id,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || '',
              phone: data.phone || '',
              country: data.country || '',
              age: data.age || 0,
              accountType: data.accountType || 'adult',
              enrollments: data.enrollments || [],
              payments: data.payments || [],
              totalSpent,
              coursesCompleted,
              lastLoginAt: data.lastLoginAt,
              createdAt: data.createdAt || '',
            });
          });
          
          setStudents(studentsData);
          calculateAnalytics(studentsData);
          calculateRevenueData(studentsData);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error('Error processing student data:', err);
          setError('Error processing student data');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching students:', err);
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        
        // Provide more specific error messages
        if (err.code === 'permission-denied') {
          setError('Access denied. Please check Firestore security rules.');
        } else if (err.code === 'unavailable') {
          setError('Firebase service is currently unavailable. Please try again later.');
        } else {
          setError(`Failed to fetch student data: ${err.message}`);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthenticated, isAuthorized]);

  const calculateAnalytics = (studentsData: AdminStudentData[]) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Active students (logged in within last 30 days)
    const activeStudents = studentsData.filter(student => 
      student.lastLoginAt && new Date(student.lastLoginAt) > thirtyDaysAgo
    ).length;

    // Total revenue from completed payments
    const totalRevenue = studentsData.reduce((sum, student) => 
      sum + student.totalSpent, 0
    );

    // Monthly revenue (current month)
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlyRevenue = studentsData.reduce((sum, student) => {
      const monthlyPayments = student.payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return payment.status === 'completed' &&
               paymentDate.getMonth() === currentMonth &&
               paymentDate.getFullYear() === currentYear;
      });
      return sum + monthlyPayments.reduce((monthSum, payment) => monthSum + payment.amount, 0);
    }, 0);

    // Total courses sold
    const totalCoursesSold = studentsData.reduce((sum, student) => 
      sum + student.enrollments.length, 0
    );

    // Average order value
    const totalOrders = studentsData.reduce((sum, student) => 
      sum + student.payments.filter(p => p.status === 'completed').length, 0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Completion rate
    const totalEnrollments = studentsData.reduce((sum, student) => 
      sum + student.enrollments.length, 0
    );
    const completedEnrollments = studentsData.reduce((sum, student) => 
      sum + student.coursesCompleted, 0
    );
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

    // Refund rate
    const totalPayments = studentsData.reduce((sum, student) => 
      sum + student.payments.length, 0
    );
    const refundedPayments = studentsData.reduce((sum, student) => 
      sum + student.payments.filter(p => p.status === 'refunded').length, 0
    );
    const refundRate = totalPayments > 0 ? (refundedPayments / totalPayments) * 100 : 0;

    setAnalytics({
      totalStudents: studentsData.length,
      activeStudents,
      totalRevenue,
      monthlyRevenue,
      totalCoursesSold,
      averageOrderValue,
      completionRate,
      refundRate,
    });
  };

  const calculateRevenueData = (studentsData: AdminStudentData[]) => {
    const revenueByMonth = new Map<string, {revenue: number, enrollments: number, refunds: number}>();
    
    studentsData.forEach(student => {
      student.payments.forEach(payment => {
        const date = new Date(payment.paymentDate);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!revenueByMonth.has(monthKey)) {
          revenueByMonth.set(monthKey, { revenue: 0, enrollments: 0, refunds: 0 });
        }
        
        const monthData = revenueByMonth.get(monthKey)!;
        
        if (payment.status === 'completed') {
          monthData.revenue += payment.amount;
          monthData.enrollments += 1;
        } else if (payment.status === 'refunded') {
          monthData.refunds += payment.refundAmount || payment.amount;
        }
      });
    });

    const sortedData = Array.from(revenueByMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([period, data]) => ({
        period: new Date(period).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        revenue: data.revenue,
        enrollments: data.enrollments,
        refunds: data.refunds,
      }));

    setRevenueData(sortedData);
  };

  // Get students by course
  const getStudentsByCourse = (courseId: string) => {
    return students.filter(student => 
      student.enrollments.some(enrollment => enrollment.courseId === courseId)
    );
  };

  // Get revenue by time period
  const getRevenueByPeriod = (startDate: Date, endDate: Date) => {
    return students.reduce((sum, student) => {
      const periodPayments = student.payments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return payment.status === 'completed' &&
               paymentDate >= startDate &&
               paymentDate <= endDate;
      });
      return sum + periodPayments.reduce((periodSum, payment) => periodSum + payment.amount, 0);
    }, 0);
  };

  // Get top performing courses
  const getTopCourses = (limit: number = 10) => {
    const courseStats = new Map<string, {enrollments: number, revenue: number, completions: number}>();
    
    students.forEach(student => {
      student.enrollments.forEach(enrollment => {
        if (!courseStats.has(enrollment.courseId)) {
          courseStats.set(enrollment.courseId, { enrollments: 0, revenue: 0, completions: 0 });
        }
        
        const stats = courseStats.get(enrollment.courseId)!;
        stats.enrollments += 1;
        
        if (enrollment.status === 'completed') {
          stats.completions += 1;
        }
        
        // Find related payment
        const payment = student.payments.find(p => p.id === enrollment.paymentId);
        if (payment && payment.status === 'completed') {
          stats.revenue += payment.amount;
        }
      });
    });

    return Array.from(courseStats.entries())
      .map(([courseId, stats]) => ({ courseId, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  };

  return {
    students,
    analytics,
    revenueData,
    loading,
    error,
    isAuthenticated,
    isAuthorized,
    userRole,
    getStudentsByCourse,
    getRevenueByPeriod,
    getTopCourses,
  };
}