import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../services/redis';
import axios from 'axios';

// Fallback audit logger
const logAudit = async (userId: string | null, ipAddress: string, endpoint: string, method: string, eventType: string, responseCode: number) => {
  try {
    console.warn(`[AUDIT LOG] ${eventType} - User: ${userId || 'UNAUTH'}, IP: ${ipAddress}, Endpoint: ${method} ${endpoint}, Timestamp: ${new Date().toISOString()}`);
    // In real implementation:
    // await axios.post(`http://localhost:5004/api/v1/audit`, { userId, ipAddress, requestedPath: endpoint, responseCode, eventType, timestamp: new Date() });
  } catch (err) {
    console.error('Failed to log gateway audit event', err);
  }
};

export const rateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const user = (req as any).user;
  const userId = user ? user.userId : null;
  const path = req.path;

  const now = Math.floor(Date.now() / 1000);

  try {
    // 1. Hard Cap Check: 1000 req / minute per IP
    const hardCapKey = `ratelimit:ip:${ip}:hardcap`;
    const hardCapCount = await redisClient.incr(hardCapKey);
    if (hardCapCount === 1) await redisClient.expire(hardCapKey, 60);

    if (hardCapCount > 1000) {
      await logAudit(userId, ip, path, req.method, 'GATEWAY_RATE_LIMITED', 429);
      res.set('X-RateLimit-Limit', '1000');
      res.set('X-RateLimit-Remaining', '0');
      res.set('Retry-After', '60');
      res.status(429).json({ status: 'error', code: '429', message: 'Too Many Requests' });
      return;
    }

    // 2. Unauthenticated Login Limit: 10 req / 10 mins
    if (!userId && path.includes('/auth/login')) {
      const loginKey = `ratelimit:ip:${ip}:login`;
      const loginCount = await redisClient.incr(loginKey);
      if (loginCount === 1) await redisClient.expire(loginKey, 600);

      res.set('X-RateLimit-Limit', '10');
      res.set('X-RateLimit-Remaining', Math.max(0, 10 - loginCount).toString());
      res.set('X-RateLimit-Reset', (now + 600).toString());

      if (loginCount > 10) {
        await logAudit(null, ip, path, req.method, 'GATEWAY_RATE_LIMITED', 429);
        res.set('Retry-After', '600');
        res.status(429).json({ status: 'error', code: '429', message: 'Too Many Requests' });
        return;
      }
      return next();
    }

    // 3. Authenticated Export Limit: 10 req / hour
    if (userId && path.includes('/export')) {
      const exportKey = `ratelimit:${userId}:export`;
      const exportCount = await redisClient.incr(exportKey);
      if (exportCount === 1) await redisClient.expire(exportKey, 3600);

      res.set('X-RateLimit-Limit', '10');
      res.set('X-RateLimit-Remaining', Math.max(0, 10 - exportCount).toString());
      res.set('X-RateLimit-Reset', (now + 3600).toString());

      if (exportCount > 10) {
        await logAudit(userId, ip, path, req.method, 'GATEWAY_RATE_LIMITED', 429);
        res.set('Retry-After', '3600');
        res.status(429).json({ status: 'error', code: '429', message: 'Too Many Requests' });
        return;
      }
      return next();
    }

    // 4. Authenticated General Limit: 300 req / 15 mins
    if (userId) {
      const generalKey = `ratelimit:${userId}:general`;
      const generalCount = await redisClient.incr(generalKey);
      if (generalCount === 1) await redisClient.expire(generalKey, 900);

      res.set('X-RateLimit-Limit', '300');
      res.set('X-RateLimit-Remaining', Math.max(0, 300 - generalCount).toString());
      res.set('X-RateLimit-Reset', (now + 900).toString());

      if (generalCount > 300) {
        await logAudit(userId, ip, path, req.method, 'GATEWAY_RATE_LIMITED', 429);
        res.set('Retry-After', '900');
        res.status(429).json({ status: 'error', code: '429', message: 'Too Many Requests' });
        return;
      }
      return next();
    }

    // If unauthenticated and not hitting login, it'll pass through to RBAC/Auth which will 401 it anyway.
    next();
  } catch (err) {
    console.error('Rate Limiter Error:', err);
    // Fail open if Redis crashes so we don't bring down the gateway
    next();
  }
};
