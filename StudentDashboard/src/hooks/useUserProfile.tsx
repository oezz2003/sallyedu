import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/useAuth';

export interface CourseEnrollment {
  courseId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt?: string;
  completionDate?: string;
  certificateIssued?: boolean;
  paymentId: string; // Reference to payment record
}

export interface PaymentRecord {
  id: string;
  courseId: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'paypal' | 'stripe' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: string;
  invoiceUrl?: string;
  refundDate?: string;
  refundAmount?: number;
}

export interface UserProfile {
  // Basic Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  dateOfBirth?: string;
  country: string;
  address: string;
  
  // Guardian Information (for under-16 users)
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail?: string;
  guardianPhone?: string;
  
  // Profile Information
  bio: string;
  avatar?: string;
  
  // Course Enrollments
  enrollments: CourseEnrollment[];
  
  // Payment History
  payments: PaymentRecord[];
  
  // Account Settings
  emailNotifications: boolean;
  courseNotifications: boolean;
  marketingEmails: boolean;
  
  // Account Status
  accountType: 'student' | 'adult';
  role: 'user' | 'admin' | 'editor'; // Default 'user' for students
  isActive: boolean;
  isEmailVerified: boolean;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching user profile for UID:', user.uid);
        
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const profileData = userDocSnap.data() as UserProfile;
          console.log('User profile fetched:', profileData);
          setUserProfile(profileData);
        } else {
          console.log('No user profile document found');
          setError('User profile not found');
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to fetch user profile');
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.uid]);

  const getFullName = () => {
    if (!userProfile) return '';
    return `${userProfile.firstName} ${userProfile.lastName}`.trim();
  };

  const getDisplayName = () => {
    if (!userProfile) return user?.displayName || user?.email || 'User';
    return getFullName() || user?.displayName || user?.email || 'User';
  };

  return {
    userProfile,
    loading,
    error,
    getFullName,
    getDisplayName,
    refetch: () => {
      if (user?.uid) {
        setLoading(true);
        // Re-trigger the useEffect by updating a dependency would be complex,
        // so we'll just call the fetch function directly
        const fetchUserProfile = async () => {
          try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const profileData = userDocSnap.data() as UserProfile;
              setUserProfile(profileData);
              setError(null);
            } else {
              setError('User profile not found');
              setUserProfile(null);
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to fetch user profile');
            setUserProfile(null);
          } finally {
            setLoading(false);
          }
        };
        fetchUserProfile();
      }
    }
  };
}