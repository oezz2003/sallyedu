import React, { useState, useEffect } from 'react';
import { paymentService, userService, courseService, PaymentRecord, UserProfile, Course, testFirebaseConnection } from '@/lib/firebaseService';
import { auth } from '@/lib/firebase';
import { safeRenderCurrency, safeRenderAmount, sanitizePaymentForReact } from '@/lib/paymentUtils';
import SafeRenderBoundary from '@/components/SafeRenderBoundary';
import Footer from "@/components/ui/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';

// Create Payment Form Component
const CreatePaymentForm = ({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (data: any) => void; 
  onCancel: () => void; 
}) => {
  const [formData, setFormData] = useState({
    userId: '',
    courseId: '',
    amount: '',
    currency: 'USD',
    paymentMethod: 'credit_card',
    status: 'pending',
    transactionId: ''
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersResult, coursesResult] = await Promise.all([
          userService.getAll(),
          courseService.getAll()
        ]);
        setUsers(usersResult.data);
        setCourses(coursesResult.data);
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };
    loadData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.courseId || !formData.amount) {
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    onSubmit({
      ...formData,
      amount
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userId">User</Label>
        <Select value={formData.userId} onValueChange={(value) => setFormData({...formData, userId: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select a user" />
          </SelectTrigger>
          <SelectContent>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id!}>
                {user.firstName} {user.lastName} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="courseId">Course</Label>
        <Select value={formData.courseId} onValueChange={(value) => setFormData({...formData, courseId: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id!}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="EUR">EUR</SelectItem>
            <SelectItem value="GBP">GBP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="debit_card">Debit Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="paypal">PayPal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
        <Input
          id="transactionId"
          value={formData.transactionId}
          onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
          placeholder="Enter transaction ID"
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Payment'}
        </Button>
      </div>
    </form>
  );
};
import {
  Search,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  Calendar,
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  ShoppingCart
} from 'lucide-react';

/**
 * Ultra-safe object-to-string converter that prevents React child rendering errors
 */
const safeToString = (value: any): string => {
  try {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return isNaN(value) ? '0' : value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'object') {
      console.warn('Object detected in rendering context:', value);
      return String(value) || 'Object';
    }
    return String(value) || '';
  } catch (error) {
    console.error('Error in safeToString:', error, value);
    return '';
  }
};

/**
 * Ultra-safe currency display that handles all possible currency formats
 */
const ultraSafeCurrencyDisplay = (currency: any): string => {
  try {
    if (!currency) return 'USD';
    if (typeof currency === 'string') return currency.toUpperCase();
    if (typeof currency === 'object' && currency !== null) {
      if (currency.currency && typeof currency.currency === 'string') {
        return currency.currency.toUpperCase();
      }
      console.warn('Unexpected currency object structure:', currency);
      return 'USD';
    }
    return 'USD';
  } catch (error) {
    console.error('Error in ultraSafeCurrencyDisplay:', error, currency);
    return 'USD';
  }
};

/**
 * Ultra-safe amount display that handles all possible amount formats
 */
const ultraSafeAmountDisplay = (amount: any): string => {
  try {
    if (amount === null || amount === undefined) return '0';
    if (typeof amount === 'number') return isNaN(amount) ? '0' : amount.toLocaleString();
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount);
      return isNaN(parsed) ? '0' : parsed.toLocaleString();
    }
    if (typeof amount === 'object' && amount !== null) {
      if (amount.amount && typeof amount.amount === 'number') {
        return isNaN(amount.amount) ? '0' : amount.amount.toLocaleString();
      }
      console.warn('Unexpected amount object structure:', amount);
      return '0';
    }
    return '0';
  } catch (error) {
    console.error('Error in ultraSafeAmountDisplay:', error, amount);
    return '0';
  }
};

// Enhanced Payment Record with user and course details
interface PaymentWithDetails extends PaymentRecord {
  user?: UserProfile;
  course?: Course;
}

// Analytics data structure
interface PaymentAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  refundedAmount: number;
  paymentMethodDistribution: Array<{ method: string; count: number; amount: number }>;
  statusDistribution: Array<{ status: string; count: number; color: string }>;
  monthlyTrends: Array<{ month: string; revenue: number; count: number }>;
}

const PAYMENT_STATUS_COLORS = {
  completed: '#10b981',
  pending: '#f59e0b',
  failed: '#ef4444',
  refunded: '#6b7280'
};

export default function Payments() {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [isCreatePaymentDialogOpen, setIsCreatePaymentDialogOpen] = useState(false);
  const { toast } = useToast();

  // Analytics data
  const [analytics, setAnalytics] = useState<PaymentAnalytics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    refundedAmount: 0,
    paymentMethodDistribution: [],
    statusDistribution: [],
    monthlyTrends: []
  });

  // Load payments data with ultra-enhanced error handling and API safety
  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      console.log('=== Starting loadPayments function ===');
      console.log('Loading payments data with direct Firestore queries...');
      
      // Test Firebase connection first
      const isConnected = await testFirebaseConnection();
      if (!isConnected) {
        throw new Error('Firebase connection failed');
      }
      
      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No authenticated user, setting empty payments');
        setPayments([]);
        calculateAnalytics([]);
        return;
      }
      
      console.log('User authenticated:', currentUser.email);
      
      // Get all payments using direct Firestore queries
      let paymentsSnapshot;
      try {
        const paymentsRef = collection(db, 'payments');
        const paymentsQuery = query(paymentsRef, orderBy('paymentDate', 'desc'));
        paymentsSnapshot = await getDocs(paymentsQuery);
        console.log('Firestore query successful');
      } catch (firestoreError) {
        console.error('Firestore query failed:', firestoreError);
        if (firestoreError instanceof Error && firestoreError.message.includes('permission-denied')) {
          throw new Error('Permission denied. Please check your Firestore security rules.');
        } else if (firestoreError instanceof Error && firestoreError.message.includes('not-found')) {
          throw new Error('Payments collection not found. This is normal for a new database.');
        } else {
          throw new Error(`Firestore query failed: ${firestoreError instanceof Error ? firestoreError.message : 'Unknown error'}`);
        }
      }
      
      console.log('Payments snapshot size:', paymentsSnapshot.size);
      
      const fetchedPayments: PaymentRecord[] = [];
      paymentsSnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedPayments.push({
          id: doc.id,
          userId: data.userId || '',
          courseId: data.courseId || '',
          amount: data.amount || 0,
          currency: data.currency || 'USD',
          paymentMethod: data.paymentMethod || 'credit_card',
          status: data.status || 'pending',
          paymentDate: data.paymentDate || new Date().toISOString(),
          transactionId: data.transactionId || '',
          refundAmount: data.refundAmount || 0,
          refundDate: data.refundDate || '',
          processedBy: data.processedBy || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        });
      });
      
      console.log('Fetched payments:', fetchedPayments.length);
      
      if (fetchedPayments.length === 0) {
        console.log('No payments found - this is normal for a new database');
        setPayments([]);
        calculateAnalytics([]);
        return;
      }
      
      // Additional layer of sanitization for React safety
      const tripleSecurePayments = fetchedPayments.map(payment => {
        try {
          // Use the new sanitizePaymentForReact utility
          const reactSafePayment = sanitizePaymentForReact(payment);
          console.log('Triple-secured payment:', { 
            original: payment, 
            reactSafe: reactSafePayment,
            currencyType: typeof reactSafePayment.currency,
            amountType: typeof reactSafePayment.amount
          });
          return reactSafePayment;
        } catch (error) {
          console.error('Error triple-securing payment:', error, payment);
          // Return absolute safe fallback
          return {
            id: String(payment?.id || ''),
            userId: String(payment?.userId || ''),
            courseId: String(payment?.courseId || ''),
            amount: 0,
            currency: 'USD',
            paymentMethod: 'unknown',
            status: 'pending',
            paymentDate: new Date().toISOString()
          };
        }
      });
      
      // Get users and courses for payment details
      const [usersResult, coursesResult] = await Promise.all([
        userService.getAll(),
        courseService.getAll()
      ]);
      
      console.log('Data loaded:', {
        payments: tripleSecurePayments.length,
        users: usersResult.data.length,
        courses: coursesResult.data.length
      });
      
      // Create lookup maps with safe access
      const usersMap = new Map();
      const coursesMap = new Map();
      
      try {
        usersResult.data.forEach(user => {
          if (user?.id) {
            usersMap.set(String(user.id), user);
          }
        });
        
        coursesResult.data.forEach(course => {
          if (course?.id) {
            coursesMap.set(String(course.id), course);
          }
        });
      } catch (error) {
        console.error('Error creating lookup maps:', error);
      }
      
      // Enhance payments with user and course details using ultra-safe approach
      const enhancedPayments: PaymentWithDetails[] = tripleSecurePayments.map(payment => {
        try {
          const user = payment?.userId ? usersMap.get(String(payment.userId)) : undefined;
          const course = payment?.courseId ? coursesMap.get(String(payment.courseId)) : undefined;
          
          return {
            ...payment,
            user: user || undefined,
            course: course || undefined
          };
        } catch (error) {
          console.error('Error enhancing payment:', error, payment);
          return payment;
        }
      });
      
      setPayments(enhancedPayments);
      calculateAnalytics(enhancedPayments);
      
      console.log('Payments data loaded successfully with direct Firestore queries');
      console.log('=== loadPayments function completed successfully ===');
    } catch (error) {
      console.error('Error loading payments:', error);
      
      let errorMessage = "Failed to load payments data. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage = "Permission denied. Please check your access rights.";
        } else if (error.message.includes('unavailable')) {
          errorMessage = "Service temporarily unavailable. Please check your internet connection.";
        } else if (error.message.includes('not-found')) {
          errorMessage = "Payments collection not found. This is normal for a new database.";
        }
      }
      
      // Set empty payments instead of showing error for new databases
      console.log('Setting empty payments due to error:', error);
      setPayments([]);
      calculateAnalytics([]);
      
      // Only show error toast for actual errors, not for empty collections
      if (error instanceof Error && !error.message.includes('not-found')) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };
  const calculateAnalytics = (paymentsData: PaymentWithDetails[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    try {
      console.log('Calculating analytics with ultra-safe handling...');
      
      // Calculate total revenue with ultra type safety
      const totalRevenue = paymentsData
        .filter(p => {
          try {
            return String(p?.status || '') === 'completed';
          } catch (error) {
            console.error('Error filtering completed payments:', error, p);
            return false;
          }
        })
        .reduce((sum, payment) => {
          try {
            const amount = typeof payment?.amount === 'number' ? payment.amount : 0;
            return sum + amount;
          } catch (error) {
            console.error('Error processing payment amount in total revenue:', error, payment);
            return sum;
          }
        }, 0);
      
      // Calculate monthly revenue
      const monthlyRevenue = paymentsData
        .filter(p => {
          try {
            const paymentDate = new Date(String(p?.paymentDate || ''));
            return String(p?.status || '') === 'completed' && 
                   paymentDate.getMonth() === currentMonth && 
                   paymentDate.getFullYear() === currentYear;
          } catch (error) {
            console.error('Error filtering monthly payments:', error, p);
            return false;
          }
        })
        .reduce((sum, payment) => {
          try {
            const amount = typeof payment?.amount === 'number' ? payment.amount : 0;
            return sum + amount;
          } catch (error) {
            console.error('Error processing payment amount in monthly revenue:', error, payment);
            return sum;
          }
        }, 0);
      
      // Calculate pending payments count
      const pendingPayments = paymentsData.filter(p => {
        try {
          return String(p?.status || '') === 'pending';
        } catch (error) {
          console.error('Error filtering pending payments:', error, p);
          return false;
        }
      }).length;
      
      // Calculate refunded amount
      const refundedAmount = paymentsData
        .filter(p => {
          try {
            return String(p?.status || '') === 'refunded';
          } catch (error) {
            console.error('Error filtering refunded payments:', error, p);
            return false;
          }
        })
        .reduce((sum, payment) => {
          try {
            const refund = typeof payment?.refundAmount === 'number' ? payment.refundAmount : payment?.amount;
            const amount = typeof refund === 'number' ? refund : 0;
            return sum + amount;
          } catch (error) {
            console.error('Error processing refund amount:', error, payment);
            return sum;
          }
        }, 0);
      
      // Payment method distribution with ultra-safe processing
      const methodMap = new Map();
      paymentsData.forEach(payment => {
        try {
          const method = String(payment?.paymentMethod || 'unknown');
          if (!methodMap.has(method)) {
            methodMap.set(method, { count: 0, amount: 0 });
          }
          const current = methodMap.get(method);
          const paymentAmount = typeof payment?.amount === 'number' ? payment.amount : 0;
          const isCompleted = String(payment?.status || '') === 'completed';
          
          methodMap.set(method, {
            count: current.count + 1,
            amount: current.amount + (isCompleted ? paymentAmount : 0)
          });
        } catch (error) {
          console.error('Error processing payment method distribution:', error, payment);
        }
      });
      
      const paymentMethodDistribution = Array.from(methodMap.entries())
        .map(([method, data]) => ({ 
          method: String(method), 
          count: typeof data?.count === 'number' ? data.count : 0,
          amount: typeof data?.amount === 'number' ? data.amount : 0
        }));
      
      // Status distribution with ultra-safe processing
      const statusMap = new Map();
      paymentsData.forEach(payment => {
        try {
          const status = String(payment?.status || 'unknown');
          statusMap.set(status, (statusMap.get(status) || 0) + 1);
        } catch (error) {
          console.error('Error processing status distribution:', error, payment);
        }
      });
      
      const statusDistribution = Array.from(statusMap.entries())
        .map(([status, count]) => ({
          status: String(status),
          count: typeof count === 'number' ? count : 0,
          color: PAYMENT_STATUS_COLORS[status as keyof typeof PAYMENT_STATUS_COLORS] || '#6b7280'
        }));
      
      // Monthly trends (last 12 months) with ultra-safe processing
      const monthlyTrends = [];
      for (let i = 11; i >= 0; i--) {
        try {
          const date = new Date(currentYear, currentMonth - i, 1);
          const monthPayments = paymentsData.filter(p => {
            try {
              const paymentDate = new Date(String(p?.paymentDate || ''));
              return paymentDate.getMonth() === date.getMonth() && 
                     paymentDate.getFullYear() === date.getFullYear();
            } catch (error) {
              console.error('Error filtering month payments:', error, p);
              return false;
            }
          });
          
          monthlyTrends.push({
            month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            revenue: monthPayments
              .filter(p => {
                try {
                  return String(p?.status || '') === 'completed';
                } catch (error) {
                  console.error('Error filtering completed trend payments:', error, p);
                  return false;
                }
              })
              .reduce((sum, p) => {
                try {
                  const amount = typeof p?.amount === 'number' ? p.amount : 0;
                  return sum + amount;
                } catch (error) {
                  console.error('Error processing trend amount:', error, p);
                  return sum;
                }
              }, 0),
            count: monthPayments.length
          });
        } catch (error) {
          console.error('Error processing monthly trend:', error);
          monthlyTrends.push({
            month: 'Error',
            revenue: 0,
            count: 0
          });
        }
      }
      
      setAnalytics({
        totalRevenue,
        monthlyRevenue,
        pendingPayments,
        refundedAmount,
        paymentMethodDistribution,
        statusDistribution,
        monthlyTrends
      });
      
      console.log('Analytics calculated safely:', {
        totalRevenue,
        monthlyRevenue,
        pendingPayments,
        refundedAmount
      });
    } catch (error) {
      console.error('Error calculating analytics:', error);
      // Set default analytics on error
      setAnalytics({
        totalRevenue: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        refundedAmount: 0,
        paymentMethodDistribution: [],
        statusDistribution: [],
        monthlyTrends: []
      });
    }
  };

  // Filter payments based on search and filters with ultra type safety
  const filteredPayments = payments.filter(payment => {
    try {
      const matchesSearch = 
        String(payment?.user?.firstName || '').toLowerCase().includes(String(searchTerm || '').toLowerCase()) ||
        String(payment?.user?.lastName || '').toLowerCase().includes(String(searchTerm || '').toLowerCase()) ||
        String(payment?.user?.email || '').toLowerCase().includes(String(searchTerm || '').toLowerCase()) ||
        String(payment?.course?.title || '').toLowerCase().includes(String(searchTerm || '').toLowerCase()) ||
        String(payment?.transactionId || '').toLowerCase().includes(String(searchTerm || '').toLowerCase());
      
      const matchesStatus = statusFilter === "all" || String(payment?.status || '') === statusFilter;
      const matchesMethod = methodFilter === "all" || String(payment?.paymentMethod || '') === methodFilter;
      
      let matchesDate = true;
      if (dateRange !== "all") {
        try {
          const paymentDate = new Date(String(payment?.paymentDate || ''));
          const now = new Date();
          
          switch (dateRange) {
            case "today":
              matchesDate = paymentDate.toDateString() === now.toDateString();
              break;
            case "week":
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              matchesDate = paymentDate >= weekAgo;
              break;
            case "month":
              matchesDate = paymentDate.getMonth() === now.getMonth() && 
                           paymentDate.getFullYear() === now.getFullYear();
              break;
            case "year":
              matchesDate = paymentDate.getFullYear() === now.getFullYear();
              break;
          }
        } catch (error) {
          console.error('Error processing date filter:', error, payment);
          matchesDate = true; // Include if date processing fails
        }
      }
      
      return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    } catch (error) {
      console.error('Error filtering payment:', error, payment);
      return false;
    }
  });



  // CRUD Operations with Firebase Client SDK
  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: 'pending' | 'completed' | 'failed' | 'refunded') => {
    try {
      setLoading(true);
      
      // Update payment status directly in Firestore
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Success",
        description: "Payment status updated successfully.",
      });
      
      await loadPayments();
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedPayment?.id) return;
    
    try {
      setLoading(true);
      const refundAmountNumber = parseFloat(refundAmount);
      const maxRefund = typeof selectedPayment.amount === 'number' ? selectedPayment.amount : 0;
      
      if (isNaN(refundAmountNumber) || refundAmountNumber <= 0 || refundAmountNumber > maxRefund) {
        toast({
          title: "Error",
          description: "Please enter a valid refund amount.",
          variant: "destructive",
        });
        return;
      }
      
      // Update payment with refund information directly in Firestore
      const paymentRef = doc(db, 'payments', selectedPayment.id);
      await updateDoc(paymentRef, {
        status: 'refunded',
        refundAmount: refundAmountNumber,
        refundDate: new Date().toISOString(),
        processedBy: 'admin',
        updatedAt: new Date().toISOString()
      });
      
      toast({
        title: "Success",
        description: "Refund processed successfully.",
      });
      
      setIsRefundDialogOpen(false);
      setRefundAmount("");
      setRefundReason("");
      setSelectedPayment(null);
      await loadPayments();
    } catch (error: any) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process refund. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (paymentData: {
    userId: string;
    courseId: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    transactionId?: string;
  }) => {
    try {
      setLoading(true);
      
      // Create payment data
      const newPayment = {
        ...paymentData,
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        refundAmount: 0,
        refundDate: '',
        processedBy: ''
      };
      
      // Add payment directly to Firestore
      const paymentsRef = collection(db, 'payments');
      await addDoc(paymentsRef, newPayment);
      
      toast({
        title: "Success",
        description: "Payment created successfully.",
      });
      
      setIsCreatePaymentDialogOpen(false);
      await loadPayments();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openViewDialog = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
    setIsViewDialogOpen(true);
  };

  const openRefundDialog = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment);
    const amount = typeof payment.amount === 'number' ? payment.amount : 0;
    setRefundAmount(amount.toString());
    setIsRefundDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <SafeRenderBoundary componentName="PaymentsPage">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
            <p className="text-muted-foreground">Comprehensive payment analytics and transaction management</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-sm">
              ${ultraSafeAmountDisplay(analytics.totalRevenue)} Total Revenue
            </Badge>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
                         <Button variant="outline" onClick={loadPayments} className="flex items-center gap-2">
               <RefreshCw className="w-4 h-4" />
               Refresh
             </Button>
             <Button onClick={() => setIsCreatePaymentDialogOpen(true)} className="flex items-center gap-2">
               <ShoppingCart className="w-4 h-4" />
               Create Payment
             </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <SafeRenderBoundary componentName="AnalyticsCards">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${ultraSafeAmountDisplay(analytics.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">All completed payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${ultraSafeAmountDisplay(analytics.monthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground">Current month earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.pendingPayments}</div>
                <p className="text-xs text-muted-foreground">Awaiting processing</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Refunded Amount</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${ultraSafeAmountDisplay(analytics.refundedAmount)}</div>
                <p className="text-xs text-muted-foreground">Total refunds issued</p>
              </CardContent>
            </Card>
          </div>
        </SafeRenderBoundary>

        {/* Analytics Charts */}
        <SafeRenderBoundary componentName="AnalyticsCharts">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends</CardTitle>
                <CardDescription>Monthly revenue over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-muted-foreground" fontSize={12} />
                      <YAxis className="text-muted-foreground" fontSize={12} />
                      <Tooltip
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                        formatter={(value: any, name: string) => [
                          name === 'revenue' ? `$${ultraSafeAmountDisplay(value)}` : safeToString(value),
                          name === 'revenue' ? 'Revenue' : 'Payments'
                        ]}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Payment Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Status Distribution</CardTitle>
                <CardDescription>Breakdown of payment statuses</CardDescription>
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
        </SafeRenderBoundary>

        {/* Payment Method Distribution */}
        <SafeRenderBoundary componentName="PaymentMethodChart">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Revenue and transaction count by payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.paymentMethodDistribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="method" className="text-muted-foreground" fontSize={12} />
                    <YAxis className="text-muted-foreground" fontSize={12} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                      formatter={(value: any, name: string) => [
                        name === 'amount' ? `$${ultraSafeAmountDisplay(value)}` : safeToString(value),
                        name === 'amount' ? 'Revenue' : 'Count'
                      ]}
                    />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" />
                    <Bar dataKey="count" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </SafeRenderBoundary>

        {/* Filters */}
        <SafeRenderBoundary componentName="FiltersSection">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search & Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by user, course, or transaction ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </SafeRenderBoundary>

        {/* Payments Table */}
        <SafeRenderBoundary componentName="PaymentsTable">
          <Card>
            <CardHeader>
              <CardTitle>Payment Transactions</CardTitle>
              <CardDescription>
                Showing {filteredPayments.length} of {payments.length} payments
              </CardDescription>
            </CardHeader>
            <CardContent>
                             {loading ? (
                 <div className="flex items-center justify-center h-40">
                   <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                 </div>
               ) : payments.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-40 text-center">
                   <div className="w-16 h-16 text-muted-foreground mb-4">
                     <CreditCard className="w-full h-full" />
                   </div>
                   <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                   <p className="text-muted-foreground mb-4">
                     This is normal for a new database. Create your first payment to get started.
                   </p>
                   <Button onClick={() => setIsCreatePaymentDialogOpen(true)} className="flex items-center gap-2">
                     <ShoppingCart className="w-4 h-4" />
                     Create First Payment
                   </Button>
                 </div>
               ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.map((payment) => (
                        <SafeRenderBoundary key={payment.id} componentName={`PaymentRow-${payment.id}`}>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div>
                                <p className="font-mono text-sm">{payment.transactionId || payment.id?.slice(0, 8)}</p>
                                <p className="text-xs text-muted-foreground">ID: {payment.id?.slice(0, 8)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{payment.user?.firstName} {payment.user?.lastName}</p>
                                  <p className="text-sm text-muted-foreground">{payment.user?.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{payment.course?.title || 'Unknown Course'}</p>
                                  <p className="text-sm text-muted-foreground">{payment.course?.category}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                ${ultraSafeAmountDisplay(payment.amount)} {ultraSafeCurrencyDisplay(payment.currency)}
                                {payment.refundAmount && (
                                  <p className="text-sm text-red-600">Refunded: ${ultraSafeAmountDisplay(payment.refundAmount)}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3 text-muted-foreground" />
                                <span className="capitalize">{(payment.paymentMethod || 'unknown').replace('_', ' ')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(payment.status)}
                                <Select
                                  value={payment.status}
                                  onValueChange={(newStatus: 'pending' | 'completed' | 'failed' | 'refunded') => 
                                    handleUpdatePaymentStatus(payment.id!, newStatus)
                                  }
                                  disabled={payment.status === 'refunded'}
                                >
                                  <SelectTrigger className="w-32 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="refunded" disabled>Refunded</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <TooltipProvider>
                                  <UITooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openViewDialog(payment)}
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>View Details</p>
                                    </TooltipContent>
                                  </UITooltip>
                                </TooltipProvider>
                                
                                {payment.status === 'completed' && (
                                  <TooltipProvider>
                                    <UITooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => openRefundDialog(payment)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <RefreshCw className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Process Refund</p>
                                      </TooltipContent>
                                    </UITooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </SafeRenderBoundary>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </SafeRenderBoundary>

        {/* View Payment Dialog */}
        <SafeRenderBoundary componentName="ViewPaymentDialog">
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
                <DialogDescription>
                  Complete payment transaction information.
                </DialogDescription>
              </DialogHeader>
              {selectedPayment && (
                <div className="space-y-6">
                  {/* Transaction Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Transaction Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Transaction ID</Label>
                        <p className="text-sm font-mono">{selectedPayment.transactionId || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Payment ID</Label>
                        <p className="text-sm font-mono">{selectedPayment.id}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                        <p className="text-sm font-semibold">
                          ${ultraSafeAmountDisplay(selectedPayment.amount)} {ultraSafeCurrencyDisplay(selectedPayment.currency)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                        <p className="text-sm capitalize">{(selectedPayment.paymentMethod || 'unknown').replace('_', ' ')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(selectedPayment.status)}
                          <Badge variant={selectedPayment.status === 'completed' ? 'default' : 'secondary'}>
                            {selectedPayment.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Payment Date</Label>
                        <p className="text-sm">{new Date(selectedPayment.paymentDate).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* User Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <p className="text-sm">{selectedPayment.user?.firstName} {selectedPayment.user?.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-sm">{selectedPayment.user?.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <p className="text-sm">{selectedPayment.user?.phone || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                        <p className="text-sm">{selectedPayment.user?.country || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Course Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Course Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Course Title</Label>
                        <p className="text-sm font-medium">{selectedPayment.course?.title || 'Unknown Course'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                        <p className="text-sm">{selectedPayment.course?.category || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Instructor</Label>
                        <p className="text-sm">{selectedPayment.course?.instructors?.join(', ') || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Course Price</Label>
                        <p className="text-sm">${ultraSafeAmountDisplay(selectedPayment.course?.price) || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Refund Information (if applicable) */}
                  {selectedPayment.status === 'refunded' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Refund Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Refund Amount</Label>
                          <p className="text-sm text-red-600 font-semibold">${ultraSafeAmountDisplay(selectedPayment.refundAmount)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Refund Date</Label>
                          <p className="text-sm">{selectedPayment.refundDate ? new Date(selectedPayment.refundDate).toLocaleString() : 'N/A'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Processed By</Label>
                          <p className="text-sm">{selectedPayment.processedBy || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex justify-end mt-6">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </SafeRenderBoundary>

        {/* Refund Dialog */}
        <SafeRenderBoundary componentName="RefundDialog">
          <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Process Refund</DialogTitle>
                <DialogDescription>
                  Process a refund for this payment. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {selectedPayment && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Payment Details</Label>
                    <div className="mt-1 p-3 border rounded-lg bg-muted/50">
                      <p className="text-sm font-medium">{selectedPayment.user?.firstName} {selectedPayment.user?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{selectedPayment.course?.title}</p>
                      <p className="text-sm font-semibold">
                        ${ultraSafeAmountDisplay(selectedPayment.amount)} {ultraSafeCurrencyDisplay(selectedPayment.currency)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="refundAmount">Refund Amount</Label>
                    <Input
                      id="refundAmount"
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Enter refund amount"
                      max={typeof selectedPayment.amount === 'number' ? selectedPayment.amount : 0}
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum refund: ${ultraSafeAmountDisplay(selectedPayment.amount)} {ultraSafeCurrencyDisplay(selectedPayment.currency)}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="refundReason">Refund Reason (Optional)</Label>
                    <Textarea
                      id="refundReason"
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Enter reason for refund..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProcessRefund} disabled={loading} className="bg-red-600 hover:bg-red-700">
                  {loading ? 'Processing...' : 'Process Refund'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </SafeRenderBoundary>

        {/* Create Payment Dialog */}
        <SafeRenderBoundary componentName="CreatePaymentDialog">
          <Dialog open={isCreatePaymentDialogOpen} onOpenChange={setIsCreatePaymentDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Payment</DialogTitle>
                <DialogDescription>
                  Create a new payment record for a user and course.
                </DialogDescription>
              </DialogHeader>
              <CreatePaymentForm onSubmit={handleCreatePayment} onCancel={() => setIsCreatePaymentDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </SafeRenderBoundary>

        <Footer />
      </div>
    </SafeRenderBoundary>
  );
}