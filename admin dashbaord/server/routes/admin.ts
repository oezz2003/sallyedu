import { RequestHandler } from 'express';
import initializeAdmin from '../firebaseAdmin';

async function verifyAdmin(req: any) {
  const admin = initializeAdmin();
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) throw Object.assign(new Error('Missing ID token'), { status: 401 });
  const decoded = await admin.auth().verifyIdToken(token);
  // Check custom claims first
  if (decoded?.role === 'admin' || decoded?.role === 'editor' || decoded?.admin === true) {
    return decoded;
  }
  // Fallback: check Firestore user role
  const db = admin.firestore();
  const snap = await db.collection('users').doc(decoded.uid).get();
  const data = snap.exists ? snap.data() : null;
  if (data && (data.role === 'admin' || data.role === 'editor')) {
    return decoded;
  }
  throw Object.assign(new Error('Forbidden'), { status: 403 });
}

// User Management Endpoints
export const createUser: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { email, password, displayName, role = 'user', accountType = 'student' } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const userRecord = await admin.auth().createUser({ email, password, displayName, disabled: false });

    if (role === 'admin' || role === 'editor') {
      await admin.auth().setCustomUserClaims(userRecord.uid, { role });
    }

    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      email,
      firstName: '',
      lastName: '',
      phone: '',
      age: 18,
      country: '',
      address: '',
      guardianFirstName: '',
      guardianLastName: '',
      bio: '',
      avatar: '',
      enrollments: [],
      payments: [],
      emailNotifications: true,
      courseNotifications: true,
      marketingEmails: false,
      accountType,
      role,
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ uid: userRecord.uid });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { userId, updates } = req.body || {};
    if (!userId || !updates) return res.status(400).json({ error: 'userId and updates required' });
    
    // Update Firestore document
    await admin.firestore().collection('users').doc(userId).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const updateUserRole: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { userId, role } = req.body || {};
    if (!userId || !role) return res.status(400).json({ error: 'userId and role required' });
    await admin.auth().setCustomUserClaims(userId, { role });
    await admin.firestore().collection('users').doc(userId).update({ role, updatedAt: new Date().toISOString() });
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const deleteUser: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });
    await admin.auth().deleteUser(userId);
    await admin.firestore().collection('users').doc(userId).delete();
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

// Payment Management Endpoints
export const updatePaymentStatus: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { paymentId, status } = req.body || {};
    if (!paymentId || !status) return res.status(400).json({ error: 'paymentId and status required' });
    
    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be one of: pending, completed, failed, refunded' });
    }
    
    await admin.firestore().collection('payments').doc(paymentId).update({
      status,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const processRefund: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { paymentId, refundAmount, refundReason, processedBy } = req.body || {};
    
    if (!paymentId || !refundAmount || !processedBy) {
      return res.status(400).json({ error: 'paymentId, refundAmount, and processedBy required' });
    }
    
    // Validate refund amount
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid refund amount' });
    }
    
    // Get current payment to validate refund amount
    const paymentDoc = await admin.firestore().collection('payments').doc(paymentId).get();
    if (!paymentDoc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const paymentData = paymentDoc.data();
    const maxRefund = typeof paymentData?.amount === 'number' ? paymentData.amount : 0;
    
    if (amount > maxRefund) {
      return res.status(400).json({ error: `Refund amount cannot exceed payment amount (${maxRefund})` });
    }
    
    // Update payment with refund information
    await admin.firestore().collection('payments').doc(paymentId).update({
      status: 'refunded',
      refundDate: new Date().toISOString(),
      refundAmount: amount,
      refundReason: refundReason || '',
      processedBy,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const createPayment: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { userId, courseId, amount, currency, paymentMethod, status, transactionId } = req.body || {};
    
    if (!userId || !courseId || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'userId, courseId, amount, and paymentMethod required' });
    }
    
    // Validate amount
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'completed', 'failed'];
    const paymentStatus = status || 'pending';
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Create payment document
    const paymentData = {
      userId,
      courseId,
      amount: paymentAmount,
      currency: currency || 'USD',
      paymentMethod,
      status: paymentStatus,
      transactionId,
      paymentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await admin.firestore().collection('payments').add(paymentData);
    
    res.status(201).json({ 
      id: docRef.id,
      message: 'Payment created successfully'
    });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

// Enrollment Management Endpoints
export const createEnrollment: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { userId, courseId, paymentId, status = 'active' } = req.body || {};
    
    if (!userId || !courseId) {
      return res.status(400).json({ error: 'userId and courseId required' });
    }
    
    // Validate status
    const validStatuses = ['active', 'completed', 'paused', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Get course details to determine total lessons
    const courseDoc = await admin.firestore().collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const courseData = courseDoc.data();
    const totalLessons = courseData?.videos?.length || 0;
    
    // Create enrollment document
    const enrollmentData = {
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      status,
      progress: 0,
      completedLessons: 0,
      totalLessons,
      paymentId: paymentId || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await admin.firestore().collection('enrollments').add(enrollmentData);
    
    // Increment course student count
    await admin.firestore().collection('courses').doc(courseId).update({
      studentCount: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date().toISOString()
    });
    
    res.status(201).json({ 
      id: docRef.id,
      message: 'Enrollment created successfully'
    });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const updateEnrollment: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { enrollmentId, updates } = req.body || {};
    
    if (!enrollmentId || !updates) {
      return res.status(400).json({ error: 'enrollmentId and updates required' });
    }
    
    // Validate status if it's being updated
    if (updates.status) {
      const validStatuses = ['active', 'completed', 'paused', 'cancelled'];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
    }
    
    // Validate progress if it's being updated
    if (updates.progress !== undefined) {
      const progress = parseFloat(updates.progress);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        return res.status(400).json({ error: 'Progress must be between 0 and 100' });
      }
    }
    
    // Update enrollment document
    await admin.firestore().collection('enrollments').doc(enrollmentId).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const updateEnrollmentProgress: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { enrollmentId, progress, completedLessons } = req.body || {};
    
    if (!enrollmentId || progress === undefined) {
      return res.status(400).json({ error: 'enrollmentId and progress required' });
    }
    
    // Validate progress
    const progressValue = parseFloat(progress);
    if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }
    
    // Get enrollment to calculate completed lessons if not provided
    const enrollmentDoc = await admin.firestore().collection('enrollments').doc(enrollmentId).get();
    if (!enrollmentDoc.exists) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    const enrollmentData = enrollmentDoc.data();
    const calculatedCompletedLessons = completedLessons !== undefined ? 
      parseInt(completedLessons) : 
      Math.floor((progressValue / 100) * (enrollmentData?.totalLessons || 0));
    
    // Update enrollment with progress
    await admin.firestore().collection('enrollments').doc(enrollmentId).update({
      progress: progressValue,
      completedLessons: calculatedCompletedLessons,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const cancelEnrollment: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { enrollmentId } = req.body || {};
    
    if (!enrollmentId) {
      return res.status(400).json({ error: 'enrollmentId required' });
    }
    
    // Get enrollment details
    const enrollmentDoc = await admin.firestore().collection('enrollments').doc(enrollmentId).get();
    if (!enrollmentDoc.exists) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    const enrollmentData = enrollmentDoc.data();
    
    // Update enrollment status to cancelled
    await admin.firestore().collection('enrollments').doc(enrollmentId).update({
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    });
    
    // Decrement course student count
    await admin.firestore().collection('courses').doc(enrollmentData.courseId).update({
      studentCount: admin.firestore.FieldValue.increment(-1),
      updatedAt: new Date().toISOString()
    });
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

// Course Management Endpoints
export const createCourse: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { 
      title, 
      description, 
      instructors, 
      category, 
      price, 
      duration, 
      thumbnail, 
      status = 'draft',
      videos = []
    } = req.body || {};
    
    if (!title || !description || !instructors || !category || price === undefined) {
      return res.status(400).json({ error: 'title, description, instructors, category, and price required' });
    }
    
    // Validate price
    const coursePrice = parseFloat(price);
    if (isNaN(coursePrice) || coursePrice < 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }
    
    // Validate status
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Validate videos array
    if (!Array.isArray(videos)) {
      return res.status(400).json({ error: 'Videos must be an array' });
    }
    
    // Create course document
    const courseData = {
      title,
      description,
      instructors: Array.isArray(instructors) ? instructors : [instructors],
      category,
      price: coursePrice,
      duration: duration || '0h 0m',
      thumbnail: thumbnail || '',
      status,
      students: 0,
      rating: 0,
      progress: 0,
      videos: videos.map((video: any, index: number) => ({
        id: video.id || index + 1,
        title: video.title || `Lesson ${index + 1}`,
        description: video.description || '',
        url: video.url || '',
        duration: video.duration || '0m',
        order: video.order || index + 1
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await admin.firestore().collection('courses').add(courseData);
    
    res.status(201).json({ 
      id: docRef.id,
      message: 'Course created successfully'
    });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const updateCourse: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { courseId, updates } = req.body || {};
    
    if (!courseId || !updates) {
      return res.status(400).json({ error: 'courseId and updates required' });
    }
    
    // Validate status if it's being updated
    if (updates.status) {
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(updates.status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
    }
    
    // Validate price if it's being updated
    if (updates.price !== undefined) {
      const price = parseFloat(updates.price);
      if (isNaN(price) || price < 0) {
        return res.status(400).json({ error: 'Invalid price' });
      }
    }
    
    // Validate videos if they're being updated
    if (updates.videos && !Array.isArray(updates.videos)) {
      return res.status(400).json({ error: 'Videos must be an array' });
    }
    
    // Update course document
    await admin.firestore().collection('courses').doc(courseId).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const updateCourseStatus: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { courseId, status } = req.body || {};
    
    if (!courseId || !status) {
      return res.status(400).json({ error: 'courseId and status required' });
    }
    
    // Validate status
    const validStatuses = ['draft', 'published', 'archived'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // Update course status
    await admin.firestore().collection('courses').doc(courseId).update({
      status,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const deleteCourse: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { courseId } = req.body || {};
    
    if (!courseId) {
      return res.status(400).json({ error: 'courseId required' });
    }
    
    // Check if course has active enrollments
    const enrollmentsSnapshot = await admin.firestore()
      .collection('enrollments')
      .where('courseId', '==', courseId)
      .where('status', 'in', ['active', 'paused'])
      .get();
    
    if (!enrollmentsSnapshot.empty) {
      return res.status(400).json({ 
        error: 'Cannot delete course with active enrollments. Please cancel all enrollments first.' 
      });
    }
    
    // Delete course
    await admin.firestore().collection('courses').doc(courseId).delete();
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const addVideoToCourse: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { courseId, video } = req.body || {};
    
    if (!courseId || !video) {
      return res.status(400).json({ error: 'courseId and video required' });
    }
    
    if (!video.title || !video.url) {
      return res.status(400).json({ error: 'Video title and URL required' });
    }
    
    // Get current course to determine video order
    const courseDoc = await admin.firestore().collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const courseData = courseDoc.data();
    const currentVideos = courseData?.videos || [];
    const newVideoOrder = currentVideos.length + 1;
    
    const newVideo = {
      id: newVideoOrder,
      title: video.title,
      description: video.description || '',
      url: video.url,
      duration: video.duration || '0m',
      order: newVideoOrder
    };
    
    // Add video to course
    await admin.firestore().collection('courses').doc(courseId).update({
      videos: admin.firestore.FieldValue.arrayUnion(newVideo),
      updatedAt: new Date().toISOString()
    });
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};

export const removeVideoFromCourse: RequestHandler = async (req, res) => {
  try {
    await verifyAdmin(req);
    const admin = initializeAdmin();
    const { courseId, videoId } = req.body || {};
    
    if (!courseId || videoId === undefined) {
      return res.status(400).json({ error: 'courseId and videoId required' });
    }
    
    // Get current course
    const courseDoc = await admin.firestore().collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const courseData = courseDoc.data();
    const currentVideos = courseData?.videos || [];
    
    // Find video to remove
    const videoToRemove = currentVideos.find((v: any) => v.id === videoId);
    if (!videoToRemove) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Remove video from course
    await admin.firestore().collection('courses').doc(courseId).update({
      videos: admin.firestore.FieldValue.arrayRemove(videoToRemove),
      updatedAt: new Date().toISOString()
    });
    
    res.json({ ok: true });
  } catch (err: any) {
    const status = err?.status || 500;
    res.status(status).json({ error: err?.message || 'Internal error' });
  }
};
