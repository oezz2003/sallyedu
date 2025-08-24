import { Router } from "express";
  import*as enrollController from'./enrollment.controller.js'
import auth from '../../middleware/auth.js';

const router=Router()

router
.post('/createEnrollment', auth(), enrollController.createEnrollment)
.get('/getEnrollments',auth(), enrollController.getEnrollments)
.get('/getEnrollment/:id',auth(), enrollController.getEnrollmentById)
.put('/updateEnrollment/:id',auth(), enrollController.updateEnrollmentStatus)
.delete('/deleteEnrollment/:id',auth(), enrollController.deleteEnrollment)



export default router