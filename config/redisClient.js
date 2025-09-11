const redis = require('redis');

// Prefer explicit REDIS_URL from environment (Render-provided or external)
const redisUrl = process.env.REDIS_URL || process.env.REDIS_URI || 'redis://127.0.0.1:6379';

const redisClient = redis.createClient({ url: redisUrl });

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('Redis connected successfully to', redisUrl);
        }
        return true;
    } catch (err) {
        // Log error but don't crash the process — allow the app to start without Redis
        console.error('Failed to connect to Redis at', redisUrl, '-', err.message || err);
        return false;
    }
};

module.exports = { redisClient, connectRedis };