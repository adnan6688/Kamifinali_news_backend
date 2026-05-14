import { createClient } from "redis";
import { envVars } from "./env";

export const redisClient = createClient({
  url: envVars.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});