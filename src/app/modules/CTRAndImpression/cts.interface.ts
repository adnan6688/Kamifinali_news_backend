import { Types } from "mongoose";


export enum ctrType {
    "NEWS" = "NEWS",
    "BANNAR" = "BANNAR"
}

export type TAction = 'clicks' | 'impressions'

export interface ICTRANDIMPRESSION {
    user: Types.ObjectId;
    newsId?: number;
    bannarsId?: Types.ObjectId;
    type : ctrType;
    impressions: number;
    clicks: number;
}