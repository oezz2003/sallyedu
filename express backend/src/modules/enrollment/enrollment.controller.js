import enrollmentModel from '../../../DB/models/enrollment.model.js';
import { asyncHandler } from '../../utils/errorHandler.js';

// Create a new enrollment
export const createEnrollment = asyncHandler(async (req, res) => {
  const { userId, courseId, paymentId } = req.body;
  if(req.user.role!=="Admin"){
    return next(new Error("Only admin can access this route", { cause: 401 }));
  }
  const enrollment = await enrollmentModel.create({ userId, courseId, paymentId });
  res.status(201).json({ message: 'Enrollment created', enrollment });
});

// Get all enrollments
export const getEnrollments = asyncHandler(async (req, res) => {
  if(req.user.role!=="Admin"){
    return next(new Error("Only admin can access this route", { cause: 401 }));
  }
  const enrollments = await enrollmentModel.find().populate('userId courseId paymentId');
  res.status(200).json({ enrollments });
});

// Get enrollment by ID
export const getEnrollmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if(req.user.role!=="Admin"){
    return next(new Error("Only admin can access this route", { cause: 401 }));
  }
  const enrollment = await enrollmentModel.findById(id).populate('userId courseId paymentId');
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
  res.status(200).json({ enrollment });
});

// Update enrollment status
export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if(req.user.role!=="Admin"){
    return next(new Error("Only admin can access this route", { cause: 401 }));
  }
  const enrollment = await enrollmentModel.findByIdAndUpdate(id, { status }, { new: true });
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
  res.status(200).json({ message: 'Status updated', enrollment });
});

// Delete enrollment
export const deleteEnrollment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if(req.user.role!=="Admin"){
    return next(new Error("Only admin can access this route", { cause: 401 }));
  }
  const enrollment = await enrollmentModel.findByIdAndDelete(id);
  if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
  res.status(200).json({ message: 'Enrollment deleted' });
});