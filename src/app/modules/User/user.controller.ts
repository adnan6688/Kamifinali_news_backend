import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserSerivce } from "./user.service";
import { sendResponse } from "../../utils/SendResponse";
import httpStatus from 'http-status-codes'
import { createUserTokens } from "../../utils/createTokens";
import { Types } from "mongoose";




// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userCreate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {


    const user = await UserSerivce.userCreated(req?.body)


    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'Registration Successfully!',
        success: true,
        data: user
    })

});





// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loginController = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    const { email, password } = req.body


    const data = await UserSerivce.loginUser({ email, password })



    const payload = {
        email: data.email,
        id: data._id,
        role: data.role
    }

    const token = await createUserTokens(payload)

    sendResponse(res, {
        success: true,
        data: {
            accessToken: token.accessToken
        },
        message: 'Login Successfully!',
        statusCode: httpStatus.OK
    })

})


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getMe = catchAsync(async(req : Request , res : Response , next : NextFunction)=>{


    const userId = req.user.id 
    const result = await UserSerivce.getMe(userId as Types.ObjectId)

    sendResponse(res , {
        statusCode  : httpStatus.OK,
        message : "Personal Information!!",
        success : true,
        data : result
    })

})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateUserInformation = catchAsync(async(req : Request , res : Response , next : NextFunction)=>{

    const userId = req.user.id 
    await UserSerivce.updateUserInformation(userId as Types.ObjectId , req.body)

    sendResponse(res, {
        success : true,
        message : 'information update successfully!',
        statusCode : httpStatus.OK
    })
})



export const userController = {
    userCreate,
    loginController,
    getMe,
    updateUserInformation
}