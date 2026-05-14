


import  { createClient } from 'redis'


export const redisClient = createClient({
    url: 'redis://127.0.0.1:6379'
})

redisClient.on("error", (err) => {
    // eslint-disable-next-line no-console
    console.log("Redis Error:", err);
});