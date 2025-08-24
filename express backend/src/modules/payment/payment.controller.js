

import enrollmentModel from '../../../DB/models/enrollment.model.js';
import userModel from '../../../DB/models/User.model.js';

import paymentModel from '../../../DB/models/payment.model.js';
import { asyncHandler } from '../../utils/errorHandler.js';
import payment from '../../utils/payment.js';


// Stripe webhook endpoint
export const stripeWebhook = asyncHandler(async (req, res) => {
  // Stripe sends events as raw body, so you need to use express.raw() middleware for this route
  const event = req.body;
  // Example: handle checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Find payment by metadata (you may need to store session id in paymentModel)
    const payment = await paymentModel.findOne({
      'metadata.userEmail': session.customer_email,
      'metadata.courseId': session.metadata.courseId
    });
    if (payment) {
      payment.status = 'completed';
      await payment.save();
      // Create enrollment if not exists
      const existingEnrollment = await enrollmentModel.findOne({
        userId: payment.userId,
        courseId: payment.courseId
      });
      if (!existingEnrollment) {
        await enrollmentModel.create({
          userId: payment.userId,
          courseId: payment.courseId,
          paymentId: payment._id
        });
      }
    }
  }
  res.status(200).json({ received: true });
});

// User-facing: Get own payments
export const getMyPayments = asyncHandler(async (req, res) => {
  const payments = await paymentModel.find({ userId: req.user._id }).populate('courseId');
  res.status(200).json({ payments });
});

// User-facing: Get own enrollments
export const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await enrollmentModel.find({ userId: req.user._id }).populate('courseId paymentId');
  res.status(200).json({ enrollments });
});

// Security: Only allow enrollment if payment is completed
export const secureCreateEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  // Check for completed payment
  const payment = await paymentModel.findOne({
    userId: req.user._id,
    courseId,
    status: 'completed'
  });
  if (!payment) {
    return res.status(403).json({ message: 'No completed payment for this course.' });
  }
  // Check if already enrolled
  const existingEnrollment = await enrollmentModel.findOne({
    userId: req.user._id,
    courseId
  });
  if (existingEnrollment) {
    return res.status(409).json({ message: 'Already enrolled.' });
  }
  const enrollment = await enrollmentModel.create({
    userId: req.user._id,
    courseId,
    paymentId: payment._id
  });
  res.status(201).json({ message: 'Enrollment created', enrollment });
});

export const createStripePayment = asyncHandler(async (req, res) => {
  const { amount, currency, userEmail, courseId } = req.body;

  const session = await payment({
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: currency || 'usd',
          product_data: { name: `Course ${courseId}` },
          unit_amount: amount * 100, // Stripe expects amount in cents
        },
        quantity: 1,
      },
    ],
    metadata: { courseId, userEmail },
  });

  res.status(200).json({ url: session.url });
});
// Get all payments
export const getPayments = asyncHandler(async (req, res) => {
    if(req.user.role!=="Admin"){
    return next(new Error("Only admin can access this route", { cause: 401 }));
  }
  const payments = await paymentModel.find().populate('userId courseId');
  res.status(200).json({ payments });
});

// Get payment by ID
export const getPaymentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if(req.user.role!=="Admin"){
    return next(new Error("Only admin can access this route", { cause: 401 }));
  }
  const payment = await paymentModel.findById(id).populate('userId courseId');
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.status(200).json({ payment });
});

// Update payment status
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if(req.user.role!=="Admin"){
    return next(new Error("Only admin can access this route", { cause: 401 }));
  }
  const payment = await paymentModel.findByIdAndUpdate(id, { status }, { new: true });
  if (!payment) return res.status(404).json({ message: 'Payment not found' });

  // Automatically create enrollment if payment is completed
  if (status === 'completed') {
    // Check if enrollment already exists
    const existingEnrollment = await enrollmentModel.findOne({
      userId: payment.userId,
      courseId: payment.courseId
    });
    if (!existingEnrollment) {
      await enrollmentModel.create({
        userId: payment.userId,
        courseId: payment.courseId,
        paymentId: payment._id
      });
    }
  }

  res.status(200).json({ message: 'Status updated', payment });
});

// Delete payment
export const deletePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if(req.user.role!=="Admin"){
    return next(new Error("Only admin can access this route", { cause: 401 }));
  }
  const payment = await paymentModel.findByIdAndDelete(id);
  if (!payment) return res.status(404).json({ message: 'Payment not found' });
  res.status(200).json({ message: 'Payment deleted' });
});