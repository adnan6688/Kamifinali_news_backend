import { Router } from "express";
import { RecentNewsController } from "./recent_new.controller";
import { checkAuth } from "../../config/checkAuth";







const route = Router()


route.get('/all-recent-news', checkAuth, RecentNewsController.getAllRecentNews)


route.get('/details/:postId', checkAuth, RecentNewsController.getNewsDetails)
route.get('/breaking-news', checkAuth, RecentNewsController.checkBreakingNewsIntoDB)



// breaking news title


export const NewsRoute = route

