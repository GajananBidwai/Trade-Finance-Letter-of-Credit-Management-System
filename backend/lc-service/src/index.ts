import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import lcRoutes from './routes/lc.route';
import dashboardRoutes from './routes/dashboard.route';
import notificationRoutes from './routes/notification.route';
import reportRoutes from './routes/report.route';
import aiRoutes from './routes/ai.route';

const app = express();
const port = process.env.PORT || 5001;
const mongoUri = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/trade_finance_lc?authSource=admin';

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'lc-service' }));

app.use('/api/v1/lc', lcRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ai', aiRoutes);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`LC Service listening on port ${port}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
