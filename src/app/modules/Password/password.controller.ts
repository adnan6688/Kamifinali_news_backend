import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { Types } from "mongoose";
import AppError from "../../ErrorHelper/AppError";
import httpStatus from 'http-status-codes'
import { pesswordService } from "./password.service";
import { sendResponse } from "../../utils/SendResponse";




// eslint-disable-next-line @typescript-eslint/no-unused-vars
const changePasswordWhenUserLogin = catchAsync(async (req: Request, res: Response,next : NextFunction) => {

    const userId = req.user.id as Types.ObjectId
    const { newPassword, confirmPassword } = req.body

    if (confirmPassword != newPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Password Does not match!')
    }

    await pesswordService.changePasswordWhenUserisLog(newPassword, userId)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `password update successfully!`
    })
})

export const passwordController = {
    changePasswordWhenUserLogin
}