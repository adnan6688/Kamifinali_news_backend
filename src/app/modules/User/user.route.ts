import { Router } from "express";
import { validateRequest } from "../../Middleware/ValidateRequest";
import { userController } from "./user.controller";
import { userZodSchema } from "./user.validation";
import { checkAuth } from "../../config/checkAuth";
import { isAdmin } from "../../utils/isAdminMiddleWare";




const route = Router()

route.post('/register', validateRequest(userZodSchema), userController.userCreate)

route.post('/login', userController.loginController)

route.get('/getMe', checkAuth, userController.getMe)

route.patch('/updateinformation', checkAuth, userController.updateUserInformation)



route.get('/getUserInfo/admin', checkAuth, isAdmin, userController.adminInformationForDashboard)
route.get('/userAnylitcs', checkAuth,isAdmin, userController.userAnalytics)

route.get('/recentFiveusers/admin' , checkAuth, isAdmin , userController.recentUsers)

export const UserRoutes = route