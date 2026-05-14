import { Router } from "express";
import { videoController } from "./video.controller";
import { isAdmin } from "../../utils/isAdminMiddleWare";
import { checkAuth } from "../../config/checkAuth";




const route = Router()


route.post('/upload-video' , checkAuth, isAdmin,  videoController.videoUpload)
route.delete('/delete-video/:id' , isAdmin,  videoController.deleteVideo)
route.get('/getvideos' , checkAuth,  videoController.getAllVideos)

export const VideoRoute = route