import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/SendResponse";
import { RecentNewsService } from "./recent_news.service";
import { catchAsync } from "../../utils/catchAsync";
import statusCode from 'http-status-codes'



// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAllRecentNews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {




  const page = Number(req?.query?.page as string)
  const per_page = Number(req?.query?.per_page as string)
  const search = req?.query?.search as string

  const categorySlug = req?.query?.categorySlug as string;

  const data = await RecentNewsService.getAllRecentNewsService(per_page, page, search, categorySlug);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    data: data,
    message: "All News",

  })
})



// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getNewsDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const postId = Number(req?.params?.postId)
  const data = await RecentNewsService.getNewsDetailsService(postId)

  sendResponse(res, {
    data: data,
    message: 'Details of news',
    success: true,
    statusCode: statusCode.OK
  })

})



// eslint-disable-next-line @typescript-eslint/no-unused-vars
const checkBreakingNewsIntoDB = catchAsync(async (req: Request, res: Response,next : NextFunction) => {

  const data = await RecentNewsService.checkBreakingNewsIntoDB()

  sendResponse(res, {
    success: true,
    data: data,
    message: 'Get All Breaking News',
    statusCode: statusCode.OK
  })
})




export const RecentNewsController = {
  getAllRecentNews,
  getNewsDetails,
  checkBreakingNewsIntoDB
}