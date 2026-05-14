import { Router } from "express";
import { validateRequest } from "../../Middleware/ValidateRequest";
import { userController } from "./user.controller";
import { userZodSchema } from "./user.validation";
import { checkAuth } from "../../config/checkAuth";




const route = Router()

route.post('/register', validateRequest(userZodSchema), userController.userCreate)

route.post('/login', userController.loginController)

route.get('/getMe', checkAuth, userController.getMe)

route.patch('/updateinformation', checkAuth, userController.updateUserInformation)
// get me
// update

export const UserRoutes = route