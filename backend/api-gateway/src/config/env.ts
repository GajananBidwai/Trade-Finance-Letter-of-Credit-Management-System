import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'tradefinance-super-secret-key-change-in-prod',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  reportingServiceUrl: process.env.REPORTING_SERVICE_URL || 'http://localhost:5000',
  lcServiceUrl: process.env.LC_SERVICE_URL || 'http://localhost:5001',
};
