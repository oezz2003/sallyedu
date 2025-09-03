import { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/useAuth';
import { useUserProfile, CourseEnrollment, PaymentRecord } from './useUserProfile';
import { useToast } from './use-toast';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviews: number;
  students: number;
  duration: string;
  lessons: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  tags: string[];
  features: string[];
  isPopular: boolean;
  isBestseller: boolean;
  isNew: boolean;
  lastUpdated: string;
  language: string;
  certificate: boolean;
}

export interface PaymentData {
  courseId: string;
  amount: number;
  paymentMethod: 'credit_card' | 'paypal' | 'stripe';
  cardDetails?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolder: string;
  };
}

export function useEnrollments() {
  const { user } = useAuth();
  const { userProfile, refetch } = useUserProfile();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Get enrolled courses
  const getEnrolledCourses = () => {
    return userProfile?.enrollments || [];
  };

  // Check if user is enrolled in a course
  const isEnrolledInCourse = (courseId: string) => {
    return userProfile?.enrollments?.some(enrollment => 
      enrollment.courseId === courseId && enrollment.status === 'active'
    ) || false;
  };

  // Get enrollment details for a course
  const getEnrollmentDetails = (courseId: string) => {
    return userProfile?.enrollments?.find(enrollment => 
      enrollment.courseId === courseId
    );
  };

  // Simulate payment processing (in real app, this would integrate with Stripe/PayPal)
  const processPayment = async (paymentData: PaymentData): Promise<PaymentRecord> => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate payment success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    if (!isSuccess) {
      throw new Error('Payment failed. Please try again.');
    }

    // Generate payment record
    const paymentRecord: PaymentRecord = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      courseId: paymentData.courseId,
      amount: paymentData.amount,
      currency: 'USD',
      paymentMethod: paymentData.paymentMethod,
      status: 'completed',
      transactionId: `txn_${Date.now()}`,
      paymentDate: new Date().toISOString(),
      invoiceUrl: `https://invoice.example.com/${Date.now()}`,
    };

    return paymentRecord;
  };

  // Enroll user in a course with payment
  const enrollInCourse = async (course: Course, paymentData: PaymentData) => {
    if (!user?.uid || !userProfile) {
      throw new Error('User not authenticated');
    }

    if (isEnrolledInCourse(course.id)) {
      throw new Error('Already enrolled in this course');
    }

    setIsProcessing(true);

    try {
      // Process payment first
      const payment = await processPayment(paymentData);

      // Create enrollment record
      const enrollment: CourseEnrollment = {
        courseId: course.id,
        enrollmentDate: new Date().toISOString(),
        status: 'active',
        progress: 0,
        completedLessons: 0,
        totalLessons: course.lessons,
        lastAccessedAt: new Date().toISOString(),
        paymentId: payment.id,
      };

      // Update user profile with new enrollment and payment
      const updatedEnrollments = [...(userProfile.enrollments || []), enrollment];
      const updatedPayments = [...(userProfile.payments || []), payment];

      await updateDoc(doc(db, 'users', user.uid), {
        enrollments: updatedEnrollments,
        payments: updatedPayments,
        updatedAt: new Date().toISOString(),
      });

      // Refresh user profile data
      await refetch();

      return { enrollment, payment };
    } catch (error) {
      console.error('Enrollment failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Update course progress
  const updateCourseProgress = async (courseId: string, progress: number, completedLessons: number) => {
    if (!user?.uid || !userProfile) {
      throw new Error('User not authenticated');
    }

    const enrollmentIndex = userProfile.enrollments?.findIndex(e => e.courseId === courseId);
    if (enrollmentIndex === -1) {
      throw new Error('Not enrolled in this course');
    }

    try {
      const updatedEnrollments = [...userProfile.enrollments];
      updatedEnrollments[enrollmentIndex] = {
        ...updatedEnrollments[enrollmentIndex],
        progress,
        completedLessons,
        lastAccessedAt: new Date().toISOString(),
        ...(progress === 100 && { 
          status: 'completed' as const,
          completionDate: new Date().toISOString(),
          certificateIssued: true 
        }),
      };

      await updateDoc(doc(db, 'users', user.uid), {
        enrollments: updatedEnrollments,
        updatedAt: new Date().toISOString(),
      });

      await refetch();
    } catch (error) {
      console.error('Failed to update progress:', error);
      throw error;
    }
  };

  // Get payment history
  const getPaymentHistory = () => {
    return userProfile?.payments || [];
  };

  // Get total spent on courses
  const getTotalSpent = () => {
    return userProfile?.payments?.reduce((total, payment) => 
      payment.status === 'completed' ? total + payment.amount : total, 0
    ) || 0;
  };

  // Cancel enrollment (if within refund period)
  const cancelEnrollment = async (courseId: string, reason?: string) => {
    if (!user?.uid || !userProfile) {
      throw new Error('User not authenticated');
    }

    const enrollment = getEnrollmentDetails(courseId);
    if (!enrollment) {
      throw new Error('Not enrolled in this course');
    }

    // Check if within refund period (30 days)
    const enrollmentDate = new Date(enrollment.enrollmentDate);
    const now = new Date();
    const daysDifference = (now.getTime() - enrollmentDate.getTime()) / (1000 * 3600 * 24);
    
    if (daysDifference > 30) {
      throw new Error('Refund period has expired (30 days)');
    }

    try {
      // Update enrollment status
      const updatedEnrollments = userProfile.enrollments.map(e =>
        e.courseId === courseId ? { ...e, status: 'cancelled' as const } : e
      );

      // Process refund (simulate)
      const payment = userProfile.payments.find(p => p.id === enrollment.paymentId);
      if (payment) {
        const updatedPayments = userProfile.payments.map(p =>
          p.id === enrollment.paymentId ? {
            ...p,
            status: 'refunded' as const,
            refundDate: new Date().toISOString(),
            refundAmount: p.amount,
          } : p
        );

        await updateDoc(doc(db, 'users', user.uid), {
          enrollments: updatedEnrollments,
          payments: updatedPayments,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await updateDoc(doc(db, 'users', user.uid), {
          enrollments: updatedEnrollments,
          updatedAt: new Date().toISOString(),
        });
      }

      await refetch();
    } catch (error) {
      console.error('Failed to cancel enrollment:', error);
      throw error;
    }
  };

  return {
    enrollments: getEnrolledCourses(),
    payments: getPaymentHistory(),
    isProcessing,
    isEnrolledInCourse,
    getEnrollmentDetails,
    enrollInCourse,
    updateCourseProgress,
    getTotalSpent,
    cancelEnrollment,
  };
}