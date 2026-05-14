import AppError from "../../ErrorHelper/AppError";
import { IUser, UserType } from "./user.interface";
import { User } from "./user.model";
import httpStatus from 'http-status-codes'
import bcrypt from "bcryptjs";
import { envVars } from "../../config/env";
import { Types } from "mongoose";



// user registration service
const userCreated = async (payload: Partial<IUser>) => {


    const { email, password } = payload


    const ckUser = await User.findOne({ email })

    // ck user from db
    if (ckUser) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This user already exits!')
    }

    // hash password
    const hassPass = await bcrypt.hash(password as string, Number(envVars.PASSWORD_HASH_SALT))
    payload.password = hassPass
    payload.isAnonymous = false
    payload.deviceId = null

    const user = await User.create(payload)

    return user
}




const loginUser = async (payload: Partial<IUser>) => {


    const { email, password } = payload

    if (!email || !password) {
        throw new AppError(httpStatus.BAD_REQUEST, `Email and password are required`)
    }

    const ckUser = await User.findOne({ email })

    if (!ckUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User Not found!')
    }
    const compare = bcrypt.compare((password) as string, ckUser.password as string)
    if (!compare) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Password does not match!')
    }


    return ckUser
}


const getMe = async (userId: Types.ObjectId) => {

    const ckUser = await User.findById(userId)
    if (!ckUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!')
    }
    if (ckUser.role == UserType.GUEST) {
        ckUser.name = 'Anonymous User'
    }
    return ckUser
}


const updateUserInformation = async (userId: Types.ObjectId, info: Partial<IUser>) => {
    const ckUser = await User.findById(userId);

    if (!ckUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
    }

    // Only admin can change role
    if (info.role && ckUser.role !== UserType.ADMIN) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Only admin can change role!');
    }

    // Nobody can change these
    if (info.email || info.password || info.isDelete === true) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'You cannot change email, password, or delete status!'
        );
    }

    const result = await User.findByIdAndUpdate(userId, info, {
        returnDocument: 'after',
        runValidators: true,
    });

    return result;
};


export const UserSerivce = {
    userCreated,
    loginUser,
    getMe,
    updateUserInformation
}