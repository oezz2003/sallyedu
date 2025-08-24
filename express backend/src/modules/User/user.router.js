import { Router } from "express";
import*as userController from './user.controller.js'
import auth from "../../middleware/auth.js";

const router=Router()

router
.post('/signUp',userController.signUp)
.post('/logIn',userController.logIn)
.post('/addUser',auth(),userController.addUser)
.get('/search',userController.search)
.put('/update',auth(),userController.updateUser)
.delete('/delete',auth(),userController.deleteUser)
export default router