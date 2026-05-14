import { Router } from "express";
import { passwordController } from "./password.controller";




const route = Router()

route.post('/changePassword', passwordController.changePasswordWhenUserLogin)

export const passwordRoute = route