import { createClient } from 'redis';
import { config } from './index';
import { logger } from '../utils/logger';

export const redisClient = createClient({
  url: config.redisUrl
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    logger.error('Redis connection failed', error);
  }
};
