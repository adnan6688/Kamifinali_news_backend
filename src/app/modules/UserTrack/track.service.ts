import { Types } from "mongoose";
import { UserTrack } from "./track.model";
import { ActionType } from "./track.interface";

import { News } from "../RecentNews/news.model";
import { QueryBuilder } from "../../utils/QuiryBuilder";





const clickAndViews = async (userId: Types.ObjectId, categorySlug: string, action: ActionType) => {

    const update: any = {
        $inc: {}
    };

    if (action === ActionType.CLICK) {
        update.$inc.Clicks = 1;
        update.$inc.Score = 3;
    }
    
    const result = await UserTrack.findOneAndUpdate(
        { userId, categorySlug },
        update,
        {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true,
        }
    );

    return result;
};



const getForYouNews = async (userId: Types.ObjectId, query: Record<string, string>) => {

    const topTrack = await UserTrack.find({ userId }).sort({ Score: -1 });

    console.log(topTrack)

    const weightMap: Record<string, number> = {};

    topTrack.forEach((t) => {
        weightMap[t.categorySlug] = t.Score;
    });


    const slugs = Object.keys(weightMap);


    const baseQuery = News.find({
        categorySlugs: { $in: slugs }
    });
    console.log('slugs',slugs)



    const newsQuery = new QueryBuilder(baseQuery, query)
        .search(['title', 'description'])
        .fields()
        .sort()
        .paginate()
        .populate([{ path: 'author', select: 'name image' }]);

    const [data, meta] = await Promise.all([
        newsQuery.build(),
        newsQuery.getMeta()
    ]);


    return {
        data,
        meta,
    };
};




export const UserTrackSerive = {
    clickAndViews,
    getForYouNews
}