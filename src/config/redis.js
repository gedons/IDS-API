const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD,
    socket: {
        connectTimeout: 50000  
    }
});

client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('error', (err) => {
    console.error('Redis error: ', err);
});

client.connect().catch(console.error);  

module.exports = client;

 