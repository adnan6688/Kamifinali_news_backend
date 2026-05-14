import { Router } from "express";
import { bannerController } from "./banner.controller";
import { upload } from "../../config/multer.config";
import { checkAuth } from "../../config/checkAuth";
import { isAdmin } from "../../utils/isAdminMiddleWare";


const route = Router()

route.post('/bannar-create', checkAuth, upload.single("file"), bannerController.bannerCreate)


route.get('/bannar-get', checkAuth, bannerController.getBannars)
route.delete('/delete-bannar/bannarId', isAdmin, bannerController.deleteBannar)
export const BannarRoute = route