import { producer } from '../../../config/kafka';
import { logger } from '../../../utils/logger';

export enum AuthEventType {
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_LOCKOUT = 'AUTH_LOCKOUT',
  AUTH_REFRESH = 'AUTH_REFRESH'
}

export const emitAuthEvent = async (
  eventType: AuthEventType,
  userId: string,
  ipAddress: string,
  outcome: 'SUCCESS' | 'FAILURE'
) => {
  try {
    await producer.send({
      topic: 'audit_logs',
      messages: [
        {
          value: JSON.stringify({
            eventType,
            userId,
            timestamp: new Date().toISOString(),
            ipAddress,
            outcome
          })
        }
      ]
    });
  } catch (error) {
    logger.error('Failed to emit auth event to Kafka', error);
  }
};
