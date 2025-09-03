import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  writeBatch,
  increment,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  WhereFilterOp
} from 'firebase/firestore';
import { db } from './firebase';

// Type definitions for our data models
export interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  dateOfBirth?: string;
  country: string;
  address: string;
  guardianFirstName: string;
  guardianLastName: string;
  guardianEmail?: string;
  guardianPhone?: string;
  bio: string;
  avatar?: string;
  enrollments: CourseEnrollment[];
  payments: PaymentRecord[];
  emailNotifications: boolean;
  courseNotifications: boolean;
  marketingEmails: boolean;
  accountType: 'student' | 'adult';
  role: 'user' | 'admin' | 'editor';
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Course {
  id?: string;
  title: string;
  description: string;
  instructors: string[];
  category: string;
  price: number;
  duration: string;
  thumbnail: string;
  status: 'draft' | 'published' | 'archived';
  students: number;
  rating: number;
  progress: number;
  videos: VideoContent[];
  prerequisites: string[];
  learningObjectives: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // Admin user ID who created the course
}

export interface VideoContent {
  id: number;
  title: string;
  description: string;
  url: string;
  duration: string;
  order: number;
}

export interface CourseEnrollment {
  id?: string;
  userId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessedAt?: string;
  completionDate?: string;
  certificateIssued?: boolean;
  paymentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id?: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string | { currency: string; amount: number };
  paymentMethod: 'credit_card' | 'paypal' | 'stripe' | 'bank_transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDate: string;
  invoiceUrl?: string;
  refundDate?: string;
  refundAmount?: number;
  createdAt: string;
  updatedAt: string;
  processedBy?: string; // Admin user ID who processed refund/update
}

// Generic CRUD service class
export class FirestoreService<T extends { id?: string }> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Create a new document
  async create(data: Omit<T, 'id'>): Promise<string> {
    try {
      console.log(`Creating new document in ${this.collectionName}...`);
      
      const docData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log(`Document data for ${this.collectionName}:`, docData);
      
      const docRef = await addDoc(collection(db, this.collectionName), docData);
      
      console.log(`Document created successfully in ${this.collectionName} with ID: ${docRef.id}`);
      
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${this.collectionName} document:`, error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          console.error(`Permission denied creating document in ${this.collectionName}. Check Firestore security rules.`);
        } else if (error.message.includes('invalid-argument')) {
          console.error(`Invalid data provided for ${this.collectionName} document:`, data);
        }
      }
      
      throw error;
    }
  }

  // Get a single document by ID
  async getById(id: string): Promise<T | null> {
    try {
      console.log(`Fetching document ${id} from ${this.collectionName}...`);
      
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log(`Document ${id} found in ${this.collectionName}`);
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        console.warn(`Document ${id} not found in ${this.collectionName}`);
      }
      return null;
    } catch (error) {
      console.error(`Error getting ${this.collectionName} document:`, error);
      
      // Enhanced error logging
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          console.error(`Permission denied accessing document ${id} in ${this.collectionName}. Check Firestore security rules.`);
        } else if (error.message.includes('not-found')) {
          console.error(`Document ${id} not found in collection ${this.collectionName}.`);
        }
      }
      
      throw error;
    }
  }

  // Get all documents with optional filtering and pagination
  async getAll(
    filters?: Array<{ field: string; operator: WhereFilterOp; value: any }>,
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc',
    limitCount?: number,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<{ data: T[]; lastDoc?: QueryDocumentSnapshot<DocumentData> }> {
    try {
      console.log(`Fetching data from ${this.collectionName} collection...`);
      
      let q = collection(db, this.collectionName);
      let queryConstraints: any[] = [];

      // Apply filters
      if (filters && filters.length > 0) {
        console.log(`Applying ${filters.length} filters:`, filters);
        filters.forEach(filter => {
          queryConstraints.push(where(filter.field, filter.operator, filter.value));
        });
      }

      // Apply ordering
      if (orderByField) {
        console.log(`Ordering by ${orderByField} (${orderDirection})`);
        queryConstraints.push(orderBy(orderByField, orderDirection));
      }

      // Apply pagination
      if (limitCount) {
        console.log(`Limiting to ${limitCount} documents`);
        queryConstraints.push(limit(limitCount));
      }

      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      const queryRef = query(q, ...queryConstraints);
      console.log(`Executing query for ${this.collectionName}...`);
      
      const querySnapshot = await getDocs(queryRef);
      console.log(`Retrieved ${querySnapshot.docs.length} documents from ${this.collectionName}`);
      
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1];

      return { data, lastDoc: lastDocument };
    } catch (error) {
      console.error(`Error getting ${this.collectionName} documents:`, error);
      
      // Enhanced error logging for Firebase Authentication/Authorization issues
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          console.error(`Permission denied accessing ${this.collectionName}. Check Firestore security rules.`);
        } else if (error.message.includes('unavailable')) {
          console.error(`Firestore service unavailable. Check your internet connection.`);
        } else if (error.message.includes('not-found')) {
          console.error(`Collection ${this.collectionName} not found in Firestore.`);
        }
      }
      
      throw error;
    }
  }

  // Update a document
  async update(id: string, data: Partial<Omit<T, 'id'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating ${this.collectionName} document:`, error);
      throw error;
    }
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${this.collectionName} document:`, error);
      throw error;
    }
  }

  // Real-time listener for documents
  onSnapshot(
    callback: (data: T[]) => void,
    filters?: Array<{ field: string; operator: WhereFilterOp; value: any }>,
    orderByField?: string,
    orderDirection: 'asc' | 'desc' = 'desc'
  ): () => void {
    try {
      let q = collection(db, this.collectionName);
      let queryConstraints: any[] = [];

      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          queryConstraints.push(where(filter.field, filter.operator, filter.value));
        });
      }

      if (orderByField) {
        queryConstraints.push(orderBy(orderByField, orderDirection));
      }

      const queryRef = query(q, ...queryConstraints);
      
      return onSnapshot(queryRef, (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        callback(data);
      });
    } catch (error) {
      console.error(`Error setting up ${this.collectionName} listener:`, error);
      throw error;
    }
  }

  // Batch operations
  async batchUpdate(updates: Array<{ id: string; data: Partial<Omit<T, 'id'>> }>): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      updates.forEach(({ id, data }) => {
        const docRef = doc(db, this.collectionName, id);
        batch.update(docRef, {
          ...data,
          updatedAt: new Date().toISOString(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error(`Error batch updating ${this.collectionName} documents:`, error);
      throw error;
    }
  }
}

// Specialized service classes
export class UserService extends FirestoreService<UserProfile> {
  constructor() {
    super('users');
  }

  // Get users by role
  async getUsersByRole(role: 'user' | 'admin' | 'editor'): Promise<UserProfile[]> {
    const result = await this.getAll([{ field: 'role', operator: '==', value: role }]);
    return result.data;
  }

  // Get users by account type
  async getUsersByAccountType(accountType: 'student' | 'adult'): Promise<UserProfile[]> {
    const result = await this.getAll([{ field: 'accountType', operator: '==', value: accountType }]);
    return result.data;
  }

  // Update user role (admin only operation)
  async updateUserRole(userId: string, role: 'user' | 'admin' | 'editor'): Promise<void> {
    await this.update(userId, { role });
  }

  // Deactivate user account
  async deactivateUser(userId: string): Promise<void> {
    await this.update(userId, { isActive: false });
  }

  // Activate user account
  async activateUser(userId: string): Promise<void> {
    await this.update(userId, { isActive: true });
  }
}

export class CourseService extends FirestoreService<Course> {
  constructor() {
    super('courses');
  }

  // Get courses by category
  async getCoursesByCategory(category: string): Promise<Course[]> {
    const result = await this.getAll([{ field: 'category', operator: '==', value: category }]);
    return result.data;
  }

  // Get courses by status
  async getCoursesByStatus(status: 'draft' | 'published' | 'archived'): Promise<Course[]> {
    const result = await this.getAll([{ field: 'status', operator: '==', value: status }]);
    return result.data;
  }

  // Update course status
  async updateCourseStatus(courseId: string, status: 'draft' | 'published' | 'archived'): Promise<void> {
    await this.update(courseId, { status });
  }

  // Increment student count when someone enrolls
  async incrementStudentCount(courseId: string): Promise<void> {
    const docRef = doc(db, 'courses', courseId);
    await updateDoc(docRef, {
      students: increment(1),
      updatedAt: new Date().toISOString()
    });
  }

  // Decrement student count when someone unenrolls
  async decrementStudentCount(courseId: string): Promise<void> {
    const docRef = doc(db, 'courses', courseId);
    await updateDoc(docRef, {
      students: increment(-1),
      updatedAt: new Date().toISOString()
    });
  }
}

export class EnrollmentService extends FirestoreService<CourseEnrollment> {
  constructor() {
    super('enrollments');
  }

  // Get enrollments by user
  async getEnrollmentsByUser(userId: string): Promise<CourseEnrollment[]> {
    const result = await this.getAll([{ field: 'userId', operator: '==', value: userId }]);
    return result.data;
  }

  // Get enrollments by course
  async getEnrollmentsByCourse(courseId: string): Promise<CourseEnrollment[]> {
    const result = await this.getAll([{ field: 'courseId', operator: '==', value: courseId }]);
    return result.data;
  }

  // Get enrollments by status
  async getEnrollmentsByStatus(status: 'active' | 'completed' | 'paused' | 'cancelled'): Promise<CourseEnrollment[]> {
    const result = await this.getAll([{ field: 'status', operator: '==', value: status }]);
    return result.data;
  }

  // Update enrollment progress
  async updateProgress(enrollmentId: string, progress: number, completedLessons: number): Promise<void> {
    const updateData: Partial<CourseEnrollment> = {
      progress,
      completedLessons,
      lastAccessedAt: new Date().toISOString()
    };

    // If course is completed (100% progress), mark as completed
    if (progress >= 100) {
      updateData.status = 'completed';
      updateData.completionDate = new Date().toISOString();
    }

    await this.update(enrollmentId, updateData);
  }

  // Issue certificate
  async issueCertificate(enrollmentId: string): Promise<void> {
    await this.update(enrollmentId, { certificateIssued: true });
  }
}

export class PaymentService extends FirestoreService<PaymentRecord> {
  constructor() {
    super('payments');
  }

  /**
   * Ultra-safe payment data sanitizer that prevents React child rendering errors
   */
  private sanitizePaymentData(payment: any): PaymentRecord {
    try {
      // Ensure currency is always a string, never an object
      let safeCurrency = 'USD';
      if (payment?.currency) {
        if (typeof payment.currency === 'string') {
          safeCurrency = payment.currency;
        } else if (typeof payment.currency === 'object' && payment.currency.currency) {
          safeCurrency = String(payment.currency.currency);
        }
      }

      // Ensure amount is always a number
      let safeAmount = 0;
      if (payment?.amount !== undefined && payment?.amount !== null) {
        if (typeof payment.amount === 'number') {
          safeAmount = payment.amount;
        } else if (typeof payment.amount === 'string') {
          const parsed = parseFloat(payment.amount);
          safeAmount = isNaN(parsed) ? 0 : parsed;
        } else if (typeof payment.amount === 'object' && payment.amount.amount) {
          const parsed = parseFloat(payment.amount.amount);
          safeAmount = isNaN(parsed) ? 0 : parsed;
        }
      }

      // Sanitize all other fields to prevent object rendering
      return {
        id: String(payment?.id || ''),
        userId: String(payment?.userId || ''),
        courseId: String(payment?.courseId || ''),
        amount: safeAmount,
        currency: safeCurrency,
        paymentMethod: String(payment?.paymentMethod || 'credit_card') as 'credit_card' | 'paypal' | 'stripe' | 'bank_transfer',
        status: String(payment?.status || 'pending') as 'pending' | 'completed' | 'failed' | 'refunded',
        transactionId: payment?.transactionId ? String(payment.transactionId) : undefined,
        paymentDate: String(payment?.paymentDate || new Date().toISOString()),
        invoiceUrl: payment?.invoiceUrl ? String(payment.invoiceUrl) : undefined,
        refundDate: payment?.refundDate ? String(payment.refundDate) : undefined,
        refundAmount: typeof payment?.refundAmount === 'number' ? payment.refundAmount : undefined,
        createdAt: String(payment?.createdAt || new Date().toISOString()),
        updatedAt: String(payment?.updatedAt || new Date().toISOString()),
        processedBy: payment?.processedBy ? String(payment.processedBy) : undefined
      };
    } catch (error) {
      console.error('Error sanitizing payment data:', error, payment);
      // Return safe default payment record
      return {
        id: '',
        userId: '',
        courseId: '',
        amount: 0,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'pending',
        paymentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Override getAll to ensure all payment data is sanitized
   */
  async getAll(filters: Array<{ field: string; operator: WhereFilterOp; value: any }> = [], orderByField?: string, orderDirection: 'asc' | 'desc' = 'desc'): Promise<{ data: PaymentRecord[]; total: number }> {
    try {
      const result = await super.getAll(filters, orderByField, orderDirection);
      
      // Sanitize all payment records to prevent React child errors
      const sanitizedData = result.data.map(payment => this.sanitizePaymentData(payment));
      
      console.log('Sanitized payment data:', { originalCount: result.data.length, sanitizedCount: sanitizedData.length });
      
      return {
        data: sanitizedData,
        total: sanitizedData.length
      };
    } catch (error) {
      console.error('Error in PaymentService.getAll:', error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Override getById to ensure payment data is sanitized
   */
  async getById(id: string): Promise<PaymentRecord | null> {
    try {
      const payment = await super.getById(id);
      if (!payment) return null;
      
      return this.sanitizePaymentData(payment);
    } catch (error) {
      console.error('Error in PaymentService.getById:', error);
      return null;
    }
  }

  // Get payments by user with sanitization
  async getPaymentsByUser(userId: string): Promise<PaymentRecord[]> {
    try {
      const result = await this.getAll([{ field: 'userId', operator: '==', value: userId }]);
      return result.data; // Already sanitized by getAll override
    } catch (error) {
      console.error('Error in getPaymentsByUser:', error);
      return [];
    }
  }

  // Get payments by course with sanitization
  async getPaymentsByCourse(courseId: string): Promise<PaymentRecord[]> {
    try {
      const result = await this.getAll([{ field: 'courseId', operator: '==', value: courseId }]);
      return result.data; // Already sanitized by getAll override
    } catch (error) {
      console.error('Error in getPaymentsByCourse:', error);
      return [];
    }
  }

  // Get payments by status with sanitization
  async getPaymentsByStatus(status: 'pending' | 'completed' | 'failed' | 'refunded'): Promise<PaymentRecord[]> {
    try {
      const result = await this.getAll([{ field: 'status', operator: '==', value: status }]);
      return result.data; // Already sanitized by getAll override
    } catch (error) {
      console.error('Error in getPaymentsByStatus:', error);
      return [];
    }
  }

  // Process refund with enhanced safety
  async processRefund(paymentId: string, refundAmount: number, processedBy: string): Promise<void> {
    try {
      // Ensure refundAmount is a valid number
      const safeRefundAmount = typeof refundAmount === 'number' && !isNaN(refundAmount) ? refundAmount : 0;
      
      await this.update(paymentId, {
        status: 'refunded',
        refundDate: new Date().toISOString(),
        refundAmount: safeRefundAmount,
        processedBy: String(processedBy || 'unknown')
      });
    } catch (error) {
      console.error('Error in processRefund:', error);
      throw error;
    }
  }

  // Update payment status with enhanced safety
  async updatePaymentStatus(paymentId: string, status: 'pending' | 'completed' | 'failed' | 'refunded'): Promise<void> {
    try {
      await this.update(paymentId, { status });
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
      throw error;
    }
  }

  /**
   * Create payment with ultra-safe data handling
   */
  async createPayment(paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Sanitize payment data before creation
      const sanitizedData = this.sanitizePaymentData({
        ...paymentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return await this.create(sanitizedData);
    } catch (error) {
      console.error('Error in createPayment:', error);
      throw error;
    }
  }
}

// Service instances
export const userService = new UserService();
export const courseService = new CourseService();
export const enrollmentService = new EnrollmentService();
export const paymentService = new PaymentService();

// Connection test function
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Firebase connection...');
    
    // Try to read from a test collection (this will fail gracefully if no data exists)
    const testQuery = query(collection(db, 'test'), limit(1));
    await getDocs(testQuery);
    
    console.log('Firebase connection successful!');
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        console.error('Permission denied - Check Firestore security rules');
      } else if (error.message.includes('unavailable')) {
        console.error('Firestore service unavailable - Check internet connection');
      } else if (error.message.includes('unauthenticated')) {
        console.error('User not authenticated - Check authentication status');
      }
    }
    
    return false;
  }
};

// Utility functions for complex operations
export const adminOperations = {
  // Get dashboard analytics with ultra-safe payment handling
  async getDashboardStats() {
    try {
      const [users, courses, enrollments, payments] = await Promise.all([
        userService.getAll(),
        courseService.getAll(),
        enrollmentService.getAll(),
        paymentService.getAll([{ field: 'status', operator: '==', value: 'completed' }])
      ]);

      // Ultra-safe revenue calculation
      const totalRevenue = payments.data.reduce((sum, payment) => {
        try {
          const amount = typeof payment?.amount === 'number' ? payment.amount : 0;
          return sum + amount;
        } catch (error) {
          console.error('Error processing payment amount in dashboard stats:', error, payment);
          return sum;
        }
      }, 0);
      
      const activeEnrollments = enrollments.data.filter(e => {
        try {
          return String(e?.status) === 'active';
        } catch (error) {
          console.error('Error filtering active enrollments:', error, e);
          return false;
        }
      }).length;

      const pendingPayments = await paymentService.getPaymentsByStatus('pending');

      return {
        totalUsers: users.data.length,
        totalCourses: courses.data.length,
        activeEnrollments,
        totalRevenue,
        pendingPayments: pendingPayments.length, // Return count instead of array
        recentEnrollments: enrollments.data.slice(0, 10) // Last 10 enrollments
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      // Return safe defaults
      return {
        totalUsers: 0,
        totalCourses: 0,
        activeEnrollments: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        recentEnrollments: []
      };
    }
  },

  // Enroll user in course
  async enrollUserInCourse(userId: string, courseId: string, paymentId: string) {
    try {
      // Get course details to determine total lessons
      const course = await courseService.getById(courseId);
      if (!course) throw new Error('Course not found');

      // Create enrollment
      const enrollmentData: Omit<CourseEnrollment, 'id'> = {
        userId,
        courseId,
        enrollmentDate: new Date().toISOString(),
        status: 'active',
        progress: 0,
        completedLessons: 0,
        totalLessons: course.videos.length,
        paymentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const enrollmentId = await enrollmentService.create(enrollmentData);
      
      // Increment course student count
      await courseService.incrementStudentCount(courseId);

      return enrollmentId;
    } catch (error) {
      console.error('Error enrolling user in course:', error);
      throw error;
    }
  },

  // Unenroll user from course
  async unenrollUserFromCourse(enrollmentId: string) {
    try {
      const enrollment = await enrollmentService.getById(enrollmentId);
      if (!enrollment) throw new Error('Enrollment not found');

      // Update enrollment status
      await enrollmentService.update(enrollmentId, { status: 'cancelled' });
      
      // Decrement course student count
      await courseService.decrementStudentCount(enrollment.courseId);
    } catch (error) {
      console.error('Error unenrolling user from course:', error);
      throw error;
    }
  }
};