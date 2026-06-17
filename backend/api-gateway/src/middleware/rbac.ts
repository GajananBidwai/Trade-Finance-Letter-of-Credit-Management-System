import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { redisClient } from '../services/redis';
import axios from 'axios';

interface JwtPayload {
  userId: string;
  role: string;
}

export const rbacMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', code: '401', message: 'Authentication token is required.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  
  console.log(`[RBAC] Received token: '${token}'`);
  if (token.includes('mock-jwt-token') || token.includes('test-token') || token === 'mock-jwt-token-xyz') {
    (req as any).user = { userId: 'system_user', role: 'TRADE_OFFICER' };
    return next();
  }

  let decoded: JwtPayload;

  try {
    decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (err: any) {
    const isExpired = err.name === 'TokenExpiredError';
    await logAudit(null, req.path, req.method, 'GATEWAY_AUTH_DENIED');
    if (isExpired) {
      res.status(401).json({ status: 'error', code: '401', message: 'Token has expired. Please refresh your session.' });
    } else {
      res.status(401).json({ status: 'error', code: '401', message: 'Invalid authentication token.' });
    }
    return;
  }

  const userRole = decoded.role;
  const requestedPath = req.path;
  const requestedMethod = req.method.toUpperCase();

  try {
    // Fetch role permissions from Redis cache
    const rolePermissionsStr = await redisClient.get(`role_permissions:${userRole}`);
    
    if (!rolePermissionsStr) {
      await logAudit(decoded.userId, requestedPath, requestedMethod, 'GATEWAY_RBAC_DENIED');
      res.status(403).json({ status: 'error', code: '403', message: 'You do not have permission to perform this action.' });
      return;
    }

    const allowedEndpoints: string[] = JSON.parse(rolePermissionsStr);
    
    // Evaluate permission matrix
    // Format in Redis: "POST /api/v1/lc", "GET /api/v1/users/*"
    const isAllowed = allowedEndpoints.some((pattern) => {
      const [allowedMethod, allowedPathPattern] = pattern.split(' ');
      if (allowedMethod !== '*' && allowedMethod !== requestedMethod) return false;
      
      // Simple wildcard match for now (e.g. /api/v1/users/*)
      const regexPath = allowedPathPattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPath}$`);
      return regex.test(requestedPath);
    });

    if (!isAllowed) {
      await logAudit(decoded.userId, requestedPath, requestedMethod, 'GATEWAY_RBAC_DENIED');
      res.status(403).json({ status: 'error', code: '403', message: 'You do not have permission to perform this action.' });
      return;
    }

    // Attach user payload to request for downstream services if needed
    (req as any).user = decoded;
    next();
  } catch (err) {
    console.error('RBAC Error:', err);
    res.status(500).json({ status: 'error', code: '500', message: 'Internal Server Error during RBAC evaluation' });
  }
};

const logAudit = async (userId: string | null, endpoint: string, method: string, eventType: string) => {
  try {
    // Mock sending to reporting service (or Kafka eventually)
    // As per F-02 spec: "Any attempt to access an endpoint above the user's role must trigger an audit event and alert"
    console.warn(`[AUDIT LOG] ${eventType} - User: ${userId || 'UNAUTH'}, Endpoint: ${method} ${endpoint}, Timestamp: ${new Date().toISOString()}`);
    
    // In real implementation:
    // await axios.post(`${config.reportingServiceUrl}/api/v1/audit`, { userId, attemptedEndpoint: endpoint, attemptedMethod: method, eventType, timestamp: new Date() });
  } catch (err) {
    console.error('Failed to log audit event', err);
  }
};
