const redis = require('redis');

const redisClient = redis.createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));

const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log('Redis connected successfully.');
    }
};

module.exports = { redisClient, connectRedis };