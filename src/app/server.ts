import { NextFunction, Request, Response } from "express";
import { app } from "./app";
import { redisClient } from "./config/redis";
import { router } from "./routes/route";
import { limiter } from "./utils/rateLimiting";
import mongoose from "mongoose";
import { envVars } from "./config/env";
import { seedSuperAdmin } from "./utils/seedSuperAdmin";
import { globalErrorHandler } from "./Middleware/global.error.handler";
import "./../app/utils/Notification/notification";


let initialized = false;

const startServer = async () => {
    try {
        if (initialized) return;
        initialized = true;

        // Redis connect
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log("Redis connected")
        }

        // MongoDB connect
        await mongoose.connect(envVars.MONGO_DB_URL as string);
        console.log("MongoDB Connected!");

        // seed only once
        await seedSuperAdmin();

    } catch (error) {
        console.error("Server init failed:", error);
    }
};

// auto init (safe for serverless)
startServer();

app.set("trust proxy", 1);

// routes
app.get("/", async (req: Request, res: Response) => {
    res.status(200).json({ message: "News server is running!" });
});

app.use(limiter);
app.use("/api/v1", router);

// global error handler
app.use(globalErrorHandler);

// fallback error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
        message: err.message,
        success: false,
    });
});

// shutdown logic (kept but not useful in Vercel, harmless)
const shutdown = (signal: string, err?: any) => {
    console.log(`${signal} detected. Shutting down...`);

    if (err) console.error(err);

    process.exit(1);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => shutdown("Unhandled Rejection", err));
process.on("uncaughtException", (err) => shutdown("Uncaught Exception", err));