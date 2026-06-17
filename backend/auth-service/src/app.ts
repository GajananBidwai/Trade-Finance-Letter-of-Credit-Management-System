import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Body Parser
app.use(express.json());

// Routes will be mounted here
import authRoutes from './features/auth';
import userRoutes from './features/users/route/user.route';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
