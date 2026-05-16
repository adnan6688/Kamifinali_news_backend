
import { QueryBuilder } from "../../utils/QuiryBuilder";
import { CTRIMPRESSION } from "./ctr.model";
import { ICTRANDIMPRESSION, TAction } from "./cts.interface";



export const ctr = async (payload: Partial<ICTRANDIMPRESSION>, action: TAction) => {



    const { user, newsId, bannarsId, type } = payload;




    // dynamic filter build
    const filter: any = { user };

    if (newsId) filter.newsId = newsId;
    filter.type = type
    if (bannarsId) filter.bannarsId = bannarsId;

    const existing = await CTRIMPRESSION.findOne(filter);


    if (existing) {
        const update: any = {};

        if (action === 'clicks') {
            update.$inc = { clicks: 1 };
        }

        if (action === "impressions") {
            update.$inc = { impressions: 1 };
        }

        await CTRIMPRESSION.updateOne(filter, update);
        return { message: "CTR updated" };
    }

    // create new record

    const created = await CTRIMPRESSION.create({
        user,
        newsId,
        bannarsId,
        type: type,
        clicks: action == 'clicks' ? 1 : 0,
        impressions: action == 'impressions' ? 1 : 0,
    });

    return created;
};


export const getCTRAnalytics = async (
    query: Record<string, string>
) => {

    const queryBuilder = new QueryBuilder(
        CTRIMPRESSION.find()
            .populate('newsId' , '-categorySlugs -category -description -updatedAt -id')
            .populate('bannarsId' , '-publicId -updatedAt -createdAt')
            .populate('user' , '-birthDayNotification -birth_date -breakingNewsNotification -createdAt -deviceId -fcmToken -updatedAt -password -isDelete'),
        query
    )
        .search([])
        .filter()
        .sort()
        .paginate()
        .fields();

    const data = await queryBuilder.modelQuery;

    const modifiedData = data.map((item: any) => {

        const clicks = item.clicks || 0;
        const impressions = item.impressions || 0;

        const ctr =
            impressions > 0
                ? ((clicks / impressions) * 100).toFixed(2)
                : "0.00";

        return {
            ...item.toObject(),
            ctr: `${ctr}%`,
        };
    });

    return modifiedData;
};

export const ctrService = {

    ctr,
    getCTRAnalytics
}