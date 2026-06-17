import { createClient } from 'redis';
import { config } from '../config/env';

export const redisClient = createClient({
  url: config.redisUrl,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis');
  }
};
