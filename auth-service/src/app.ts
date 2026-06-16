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
app.use('/api/v1/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
