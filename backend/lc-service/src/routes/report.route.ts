import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';

const router = Router();
const reportController = new ReportController();

router.get('/audit', reportController.getAuditLogs.bind(reportController));
router.post('/export', reportController.exportReport.bind(reportController));

export default router;
