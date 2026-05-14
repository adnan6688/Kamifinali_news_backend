
import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // max 100 requests per IP
    message: "Too many requests. Please try again after 15 minutes.",
    standardHeaders: true, 
    legacyHeaders: false,  
});