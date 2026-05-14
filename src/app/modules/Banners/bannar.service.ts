
import { IBanner } from "./banner.interface";
import { Bannar } from "./banner.model";
import AppError from "../../ErrorHelper/AppError";
import statusCode from 'http-status-codes'
import { cloudinaryUpload } from "../../config/Cloudinary.config";
import { Types } from "mongoose";




const bannarService = async (payLoad: Partial<IBanner>) => {
    const data = await Bannar.create(payLoad)
    return data
}



const getBannars = async () => {
    const data = await Bannar.find()
    return data || []
}


const deleteBannar = async (bannarId: Types.ObjectId) => {


    const ckBannar = await Bannar.findById(bannarId)
    if (!ckBannar) {
        throw new AppError(statusCode.NOT_FOUND, 'Bannar Not found!')
    }


    if (ckBannar.publicId) {
       const ans =  await cloudinaryUpload.uploader.destroy(ckBannar.publicId);
       console.log('result delete cloudinary',ans)
    }

   
    await Bannar.findByIdAndDelete(bannarId);

}



export const BannarService = {
    bannarService,
    getBannars,
    deleteBannar
}