import AppError from "../../ErrorHelper/AppError";
import { IUser, UserType } from "./user.interface";
import { User } from "./user.model";
import httpStatus from 'http-status-codes'
import bcrypt from "bcryptjs";
import { envVars } from "../../config/env";
import { Types } from "mongoose";
import { News } from "../RecentNews/news.model";
import { BreakingNews } from "../RecentNews/recent.interface";



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
    const { email, password } = payload;

    if (!email || !password) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            "Email and password are required"
        );
    }

    const ckUser = await User.findOne({ email });

    if (!ckUser) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not found!");
    }

    const compare = await bcrypt.compare(
        password as string,
        ckUser.password as string
    );

    if (!compare) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password does not match!");
    }

    return ckUser;
};


const getMe = async (userId: Types.ObjectId) => {

    const ckUser = await User.findById(userId).select("-password");
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



const countOfUserRoleWise = async () => {


    const totalUser = (await User.find({ role: { $ne: UserType.ADMIN } })).length
    const GUESTUser = (await User.find({ role: UserType.GUEST })).length
    const authencticateUser = (await User.find({ role: UserType.USER })).length

    const totalNews = (await News.find()).length


    const today = new Date();
    today.setHours(0, 0, 0, 0);


    const todayBreakingNews = await BreakingNews.find({
        createdAt: { $gte: today }
    });

    const count = todayBreakingNews.length;


    return {
        totalNews,
        GUESTUser,
        authencticateUser,
        totalUser,
        todayBreakingNews: count
    }

}



const getMonthlyUserStats = async (year: number) => {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31T23:59:59.999Z`);

    const data = await User.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: start,
                    $lte: end,
                },
            },
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                totalUsers: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);

    return data;
};


const recentUsers = async () => {
    const users = await User.find()
        .sort({ createdAt: -1 }).select('-password -breakingNewsNotification -birthDayNotification -deviceId -updatedAt -fcmToken')
        .limit(6);

    return users;
};



export const UserSerivce = {
    userCreated,
    loginUser,
    getMe,
    updateUserInformation,
    countOfUserRoleWise,
    getMonthlyUserStats,
    recentUsers
}