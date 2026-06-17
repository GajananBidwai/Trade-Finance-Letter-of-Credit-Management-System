import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import proxy from 'express-http-proxy';
import { config } from './config/env';
import { connectRedis } from './services/redis';
import { rbacMiddleware } from './middleware/rbac';
import { rateLimiter } from './middleware/rateLimiter';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(cors());

// Apply Rate Limiting to all requests
app.use(rateLimiter);

// Health check bypasses RBAC
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-gateway' });
});

// Proxy route for auth-service (RBAC enforced)
app.use('/api/v1/auth', proxy(config.authServiceUrl, {
  proxyReqPathResolver: (req) => {
    return '/api/v1/auth' + req.url;
  }
}));

// Proxy route for Users (auth-service) (RBAC enforced)
app.use('/api/v1/users', rbacMiddleware, proxy(config.authServiceUrl, {
  proxyReqPathResolver: (req) => {
    return '/api/v1/users' + req.url;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const user = (srcReq as any).user;
    if (user) {
      proxyReqOpts.headers = proxyReqOpts.headers || {};
      proxyReqOpts.headers['x-user-id'] = user.userId;
      proxyReqOpts.headers['x-user-role'] = user.role;
    }
    return proxyReqOpts;
  }
}));

// Proxy route for LC service (RBAC enforced)
app.use('/api/v1/lc', rbacMiddleware, proxy(config.lcServiceUrl, {
  proxyReqPathResolver: (req) => {
    return '/api/v1/lc' + req.url;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const user = (srcReq as any).user;
    if (user) {
      proxyReqOpts.headers = proxyReqOpts.headers || {};
      proxyReqOpts.headers['x-user-id'] = user.userId;
      proxyReqOpts.headers['x-user-role'] = user.role;
    }
    return proxyReqOpts;
  }
}));

// Proxy route for Dashboard (RBAC enforced)
app.use('/api/v1/dashboard', rbacMiddleware, proxy(config.lcServiceUrl, {
  proxyReqPathResolver: (req) => {
    return '/api/v1/dashboard' + req.url;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const user = (srcReq as any).user;
    if (user) {
      proxyReqOpts.headers = proxyReqOpts.headers || {};
      proxyReqOpts.headers['x-user-id'] = user.userId;
      proxyReqOpts.headers['x-user-role'] = user.role;
    }
    return proxyReqOpts;
  }
}));

// Proxy route for Notifications (RBAC enforced)
app.use('/api/v1/notifications', rbacMiddleware, proxy(config.lcServiceUrl, {
  proxyReqPathResolver: (req) => {
    return '/api/v1/notifications' + req.url;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const user = (srcReq as any).user;
    if (user) {
      proxyReqOpts.headers = proxyReqOpts.headers || {};
      proxyReqOpts.headers['x-user-id'] = user.userId;
      proxyReqOpts.headers['x-user-role'] = user.role;
    }
    return proxyReqOpts;
  }
}));

// Proxy route for Reports (RBAC enforced)
app.use('/api/v1/reports', rbacMiddleware, proxy(config.lcServiceUrl, {
  proxyReqPathResolver: (req) => {
    return '/api/v1/reports' + req.url;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const user = (srcReq as any).user;
    if (user) {
      proxyReqOpts.headers = proxyReqOpts.headers || {};
      proxyReqOpts.headers['x-user-id'] = user.userId;
      proxyReqOpts.headers['x-user-role'] = user.role;
    }
    return proxyReqOpts;
  }
}));

// Proxy route for AI Assistant (RBAC enforced)
app.use('/api/v1/ai', rbacMiddleware, proxy(config.lcServiceUrl, {
  proxyReqPathResolver: (req) => {
    return '/api/v1/ai' + req.url;
  },
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    const user = (srcReq as any).user;
    if (user) {
      proxyReqOpts.headers = proxyReqOpts.headers || {};
      proxyReqOpts.headers['x-user-id'] = user.userId;
      proxyReqOpts.headers['x-user-role'] = user.role;
    }
    return proxyReqOpts;
  }
}));

// Route everything else through RBAC to auth-service
app.use('/api/v1', rbacMiddleware, proxy(config.authServiceUrl, {
  proxyReqPathResolver: (req) => {
    return '/api/v1' + req.url;
  }
}));

const startServer = async () => {
  try {
    await connectRedis();
    app.listen(config.port, () => {
      console.log(`API Gateway listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
