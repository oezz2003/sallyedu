import { Router } from "express";
import * as paymentController from './payment.controller.js';
import auth from '../../middleware/auth.js';
import express from 'express'
const router=Router()

router
  .post('/stripe', auth(), paymentController.createStripePayment)
  // Stripe webhook (no auth, must use express.raw() middleware in app.js)
  .post('/webhook', express.raw({type: 'application/json'}), paymentController.stripeWebhook)
  // User-facing endpoints
  .get('/my-payments', auth(), paymentController.getMyPayments)
  .get('/my-enrollments', auth(), paymentController.getMyEnrollments)
  // Secure enrollment creation (only if payment completed)
  .post('/secure-enroll', auth(), paymentController.secureCreateEnrollment)
  // Admin endpoints
  .get('/getPayments', auth(), paymentController.getPayments)
  .get('/getPayment/:id', auth(), paymentController.getPaymentById)
  .put('/updatePayment/:id', auth(), paymentController.updatePaymentStatus)
  .delete('/deletePayment/:id', auth(), paymentController.deletePayment)

export default router