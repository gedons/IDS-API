const redis = require('redis');

const client = redis.createClient({
    host: 'localhost', // Adjust if Redis is hosted elsewhere
    port: 6379
});

client.on('connect', () => {
    console.log('Redis client connected');
});

client.on('error', (err) => {
    console.error('Redis error: ', err);
});

module.exports = client;
