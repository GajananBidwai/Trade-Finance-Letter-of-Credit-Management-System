import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();
const dashboardController = new DashboardController();

router.get('/summary', dashboardController.getSummary.bind(dashboardController));

export default router;
