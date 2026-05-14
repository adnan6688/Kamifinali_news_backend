import {   NextFunction, Request, Response } from 'express';
import { app } from './app';
import { redisClient } from './config/redis';
import { router } from './routes/route';
import { limiter } from './utils/rateLimiting';
import mongoose from 'mongoose';
import { envVars } from './config/env';
import { seedSuperAdmin } from './utils/seedSuperAdmin';
import { globalErrorHandler } from './Middleware/global.error.handler';
import { Server } from "http";
import './../app/utils/Notification/notification'

let server: Server | null = null;

const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

const startServer = async () => {
    try {

        // Redis connect
        await redisClient.connect();
        console.log("Redis connected");

        // MongoDB connect
        await mongoose.connect(envVars.MONGO_DB_URL as string);
        console.log("MongoDB Connected!");

        // IMPORTANT FIX: assign to global variable
        server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server failed to start:", error);
        process.exit(1);
    }
};

//  async call
(async () => {
    await startServer();
    await seedSuperAdmin();
})();



app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({ message: 'News server is running!' });
});

app.use(limiter);


app.use('/api/v1', router);




// global error handler (custom)
app.use(globalErrorHandler);

// fallback error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response,next : NextFunction) => {
    res.status(500).json({
        message: err.message,
        success: false
    });
});




const shutdown = (signal: string, err?: any) => {
    console.log(`${signal} detected. Shutting down...`);

    if (err) {
        console.error(err);
    }

    if (server) {
        server.close(() => {
            console.log("Server closed");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (err) => shutdown("Unhandled Rejection", err));
process.on("uncaughtException", (err) => shutdown("Uncaught Exception", err));