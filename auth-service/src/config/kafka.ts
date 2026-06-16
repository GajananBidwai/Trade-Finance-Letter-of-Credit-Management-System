import { Kafka, Partitioners } from 'kafkajs';
import { config } from './index';
import { logger } from '../utils/logger';

export const kafka = new Kafka({
  clientId: 'auth-service',
  brokers: config.kafkaBrokers
});

export const producer = kafka.producer({ createPartitioner: Partitioners.LegacyPartitioner });

export const connectKafka = async () => {
  try {
    await producer.connect();
    logger.info('Kafka producer connected successfully');
  } catch (error) {
    logger.error('Kafka connection failed', error);
  }
};
