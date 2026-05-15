/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import { redisClient } from "../../config/redis";
import { cleanText } from "../../utils/cleanText";
import { BreakingNews } from "./recent.interface";
import { News } from "./news.model";
import cron from "node-cron";
import { sendToAllUsers } from "../../utils/Notification/notification";


const getAllRecentNewsService = async (per_page?: number, page?: number, search?: string, categorySlug?: string) => {
    // include category in cache key
    const cacheKey = `news_${categorySlug || "all"}_${per_page}_${page}_${search || "all"}`;

    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const params: any = {
        per_page: per_page || 10,
        page: page || 1,
        _embed: 1,
    };

    if (search) {
        params.search = search;
    }

    // handle category slug
    if (categorySlug) {

        const catCacheKey = `cat_${categorySlug}`;
        let categoryId;

        const cachedCat = await redisClient.get(catCacheKey);

        if (cachedCat) {
            categoryId = JSON.parse(cachedCat);
        } else {
            const catRes = await axios.get(
                "https://www.kemifilani.ng/wp-json/wp/v2/categories",
                {
                    params: { slug: categorySlug },
                }
            );

            const category = catRes.data?.[0];

            if (!category) {
                return {
                    total: 0,
                    totalPages: 0,
                    data: [],
                };
            }

            categoryId = category.id;

            // cache category id (1 hour)
            await redisClient.setEx(catCacheKey, 3600, JSON.stringify(categoryId));
        }

        // add category filter
        params.categories = categoryId;
    }

    // fetch posts
    const response = await axios.get(
        "https://www.kemifilani.ng/wp-json/wp/v2/posts",
        { params }
    );

    const total = response.headers["x-wp-total"];
    const totalPages = response.headers["x-wp-totalpages"];
    const data = response.data || [];

    const result = await Promise.all(
        data.map(async (post: any) => {

            const obj = {
                id: post.id,
                createdAt: post.date,
                title: cleanText(post.title?.rendered),
                description: cleanText(post.content?.rendered),
                image: post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,
                category:
                    post._embedded?.["wp:term"]?.[0]?.map((cat: any) => cat.name) || [],
                categorySlugs:
                    post._embedded?.["wp:term"]?.[0]?.map((cat: any) => cat.slug) || [],
                author: {
                    name: post._embedded?.author?.[0]?.name || "Unknown",
                    image: post._embedded?.author?.[0]?.avatar_urls?.["96"] || null,
                },
                link: post.link,
            };


            const ckNews = await News.findOne({ id: obj.id });

            if (!ckNews) {
                await News.create(obj);
            }

            return obj;
        })
    );

    const finalData = {
        total: Number(total),
        totalPages: Number(totalPages),
        data: result,
        currentPage: page || 1
    };


    await redisClient.setEx(cacheKey, 480, JSON.stringify(finalData));

    return finalData;
};


const getNewsDetailsService = async (postId: number) => {
    const cacheKey = `news_details_${postId}`;


    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const response = await axios.get(
        `https://www.kemifilani.ng/wp-json/wp/v2/posts/${postId}`,
        {
            params: {
                _embed: 1,
            },
        }
    );

    const post = response.data;

    const result = {
        id: post.id,
        date: post.date,

        title: cleanText(post.title?.rendered),


        description: cleanText(post.content?.rendered),

        image:
            post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null,

        author: {
            name: post._embedded?.author?.[0]?.name || "Unknown",
            image:
                post._embedded?.author?.[0]?.avatar_urls?.["96"] || null,
        },

        link: post.link,
    };

    const finalData = {
        success: true,
        message: "News Details",
        data: result,
    };


    await redisClient.setEx(cacheKey, 600, JSON.stringify(finalData));

    return finalData;
};


type MediaResponse = {
    source_url: string;
};

const getImage = async (mediaId: number) => {
    try {
        const res = await fetch(
            `https://www.kemifilani.ng/wp-json/wp/v2/media/${mediaId}`
        );

        const data = (await res.json()) as MediaResponse;
        return data.source_url;
    } catch (err: any) {
        return null;
    }
};

type NewsItem = {
    id: string;
    date: string; // API gives string, NOT Date
    link: string;
    title: {
        rendered: string;
    };
    featured_media: number;
};


type BreakingNewsDTO = {
    newsId: number;
    title: string;
    link: string;
    image: string;
    date: Date;
};

const checkBreakingNewsIntoDB = async () => {
    const res = await fetch(
        "https://www.kemifilani.ng/wp-json/wp/v2/posts?_fields=id,title,link,date,featured_media&per_page=5"
    );

    const data = (await res.json()) as NewsItem[];

    const enrichedData = await Promise.all(
        data.map(async (item) => {
            const image = await getImage(item.featured_media);

            return {
                ...item,
                image,
            };
        })
    );

    const newlyAddedNews: BreakingNewsDTO[] = [];

    for (const item of enrichedData) {
        const exists = await BreakingNews.findOne({
            newsId: Number(item.id),
        });

        if (!exists) {
            const savedNews = await BreakingNews.create({
                newsId: Number(item.id),
                title: cleanText(item.title.rendered),
                link: item.link,
                image: item.image,
                date: item.date,
            });

            newlyAddedNews.push(savedNews.toObject() as BreakingNewsDTO);
        }
    }

    const allNews = await BreakingNews.find()
        .sort({ createdAt: -1 })
        .limit(20);

    return {
        newlyAddedNews,
        allNews,
    };
};







cron.schedule("*/1 * * * *", async () => {
    console.log("Checking breaking news...");

    try {
        const result = await checkBreakingNewsIntoDB();

        const { newlyAddedNews } = result;

        if (newlyAddedNews.length > 0) {
            console.log("New breaking news found:", newlyAddedNews.length);

            // send notification for each news
            for (const news of newlyAddedNews) {

                const title = news.title as string
                const newsId = news.newsId as number
                await sendToAllUsers(title, newsId)

            }
        } else {
            console.log("No new news");
        }
    } catch (error) {
        console.error("Cron error:", error);
    }
});

export const RecentNewsService = {
    getAllRecentNewsService,
    getNewsDetailsService,
    checkBreakingNewsIntoDB
};