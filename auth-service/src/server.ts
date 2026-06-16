import app from './app';
import { config } from './config';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { connectKafka } from './config/kafka';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // Initialize External Connections
    await connectDB();
    await connectRedis();
    await connectKafka();

    // Start Express Server
    app.listen(config.port, () => {
      logger.info(`Auth Service running on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
