import express, { RequestHandler } from 'express';
import cors from 'cors';
import { 
  createUser, 
  updateUser, 
  updateUserRole, 
  deleteUser,
  updatePaymentStatus,
  processRefund,
  createPayment,
  createEnrollment,
  updateEnrollment,
  updateEnrollmentProgress,
  cancelEnrollment,
  createCourse,
  updateCourse,
  updateCourseStatus,
  deleteCourse,
  addVideoToCourse,
  removeVideoFromCourse
} from './routes/admin';

export const createServer = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', ((_req, res) => res.json({ ok: true })) as RequestHandler);

  // Admin routes (require ID token with admin/editor claims)
  app.post('/api/admin/create-user', createUser);
  app.post('/api/admin/update-user', updateUser);
  app.post('/api/admin/update-role', updateUserRole);
  app.post('/api/admin/delete-user', deleteUser);
  
  // Payment management endpoints
  app.post('/api/admin/update-payment-status', updatePaymentStatus);
  app.post('/api/admin/process-refund', processRefund);
  app.post('/api/admin/create-payment', createPayment);
  
  // Enrollment management endpoints
  app.post('/api/admin/create-enrollment', createEnrollment);
  app.post('/api/admin/update-enrollment', updateEnrollment);
  app.post('/api/admin/update-enrollment-progress', updateEnrollmentProgress);
  app.post('/api/admin/cancel-enrollment', cancelEnrollment);
  
  // Course management endpoints
  app.post('/api/admin/create-course', createCourse);
  app.post('/api/admin/update-course', updateCourse);
  app.post('/api/admin/update-course-status', updateCourseStatus);
  app.post('/api/admin/delete-course', deleteCourse);
  app.post('/api/admin/add-video-to-course', addVideoToCourse);
  app.post('/api/admin/remove-video-from-course', removeVideoFromCourse);

  return app;
};
