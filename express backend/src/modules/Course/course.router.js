import { Router } from "express";
import *as courseController from './course.controller.js'
import auth from '../../middleware/auth.js'
import { uploadFile ,fileValidation} from "../../utils/cluadnairyMulter.js";
const router=Router()
router
.post(
  "/addCourse",
  auth(),
  uploadFile({
    customValidation: [...fileValidation.image, ...fileValidation.file],
  }).single("media"),
  courseController.addCourse
);


export default router