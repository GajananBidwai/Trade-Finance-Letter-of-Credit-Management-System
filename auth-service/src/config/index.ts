import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/trade_finance_auth?authSource=admin',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  kafkaBrokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  security: {
    maxFailedLoginAttempts: 5,
    lockoutDurationMs: 10 * 60 * 1000, // 10 minutes
  }
};
