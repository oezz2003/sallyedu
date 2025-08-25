import { Router } from "express";
import *as courseController from './course.controller.js'
import auth from '../../middleware/auth.js'
import { uploadFile ,fileValidation} from "../../utils/cluadnairyMulter.js";
const router=Router()
router


router
	// Create course
	.post(
		"/addCourse",
		auth(),
		uploadFile({ customValidation: fileValidation.image }).single("media"),
		courseController.addCourse
	)
	// Get all courses
	.get("/getAll", courseController.getCourses)
	// Get course by ID
	.get("/course/:id", courseController.getCourseById)
	// Update course
	.put(
		"/updateCourse/:id",
		auth(),
		uploadFile({ customValidation: fileValidation.image }).single("media"),
		courseController.updateCourse
	)
	// Delete course
	.delete("/deleteCourse/:id", auth(), courseController.deleteCourse)
	// Add video to course
	.post(
		"/addVideo/:courseId",
		auth(),
		uploadFile({ customValidation: fileValidation.video }).single("video"),
		courseController.addVideo
	);

export default router
