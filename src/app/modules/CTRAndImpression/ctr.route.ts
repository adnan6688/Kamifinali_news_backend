import { Router } from "express";
import { ctrController } from "./ctr.controller";




const route = Router()

route.post('/ctrimpression/:type/:action' ,  ctrController.ctr )



export const CTRRoute = route