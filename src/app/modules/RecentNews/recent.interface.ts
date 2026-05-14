
// breaking news

import { Schema, model } from "mongoose";

const breakingNewsSchema = new Schema({
    newsId: {
        type: Number,
        unique: true,
    },
    image: { type: String },
    link: { type: String },
    title: { type: String },
    date: { type: Date }
}, {
    timestamps: true,
    versionKey: false
});




export const BreakingNews = model("BreakingNews", breakingNewsSchema);












