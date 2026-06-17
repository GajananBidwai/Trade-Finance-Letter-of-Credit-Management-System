import { Request, Response } from 'express';
import { AuditLogModel } from '../models/AuditLog.model';
import { ExportJobModel } from '../models/ExportJob.model';
import { NotificationController } from './notification.controller';
import { v4 as uuidv4 } from 'uuid';

export class ReportController {

  // F-10: GET /api/v1/reports/audit
  async getAuditLogs(req: Request, res: Response) {
    try {
      const { lcId, fromDate, toDate, userId, eventType, page = '1', limit = '50' } = req.query;

      const query: any = {};
      
      if (lcId) query.lcId = lcId;
      if (userId) query.performedBy = userId;
      if (eventType) query.eventType = eventType;

      if (fromDate || toDate) {
        query.timestamp = {};
        if (fromDate) query.timestamp.$gte = new Date(fromDate as string);
        if (toDate) query.timestamp.$lte = new Date(toDate as string);
        
        // Validation: Date range must not exceed 365 days
        if (fromDate && toDate) {
          const diffTime = Math.abs(new Date(toDate as string).getTime() - new Date(fromDate as string).getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 365) {
            return res.status(400).json({ status: 'error', message: 'Date range must not exceed 365 days.' });
          }
        }
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const logs = await AuditLogModel.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await AuditLogModel.countDocuments(query);

      res.status(200).json({
        status: 'success',
        data: logs,
        pagination: { page: pageNum, total, limit: limitNum }
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // F-10: POST /api/v1/reports/export
  async exportReport(req: Request, res: Response) {
    try {
      const { reportType, format, filters } = req.body;
      const requestedBy = req.headers['x-user-id'] as string || 'system_user';

      if (!['AUDIT', 'SETTLEMENT', 'COMPLIANCE'].includes(reportType)) {
        return res.status(400).json({ status: 'error', message: 'Invalid reportType' });
      }
      if (!['PDF', 'CSV'].includes(format)) {
        return res.status(400).json({ status: 'error', message: 'Invalid format' });
      }

      const jobId = uuidv4();
      
      // We will simulate that an export takes more than 60 seconds if format is PDF just to demonstrate the async flow
      const isAsync = format === 'PDF';

      if (isAsync) {
        const job = new ExportJobModel({
          jobId,
          requestedBy,
          reportType,
          format,
          filters,
          status: 'PENDING'
        });
        await job.save();

        // Simulate async background processing
        setTimeout(async () => {
          job.status = 'COMPLETE';
          job.downloadUrl = `https://lumina-exports.s3.amazonaws.com/${jobId}.pdf`;
          job.completedAt = new Date();
          await job.save();

          // Notify user via IN_APP
          NotificationController.dispatchInternal(
            requestedBy,
            'EXPORT_READY',
            `Your ${reportType} report export is ready for download.`,
            'IN_APP'
          ).catch(console.error);
        }, 15000); // 15 seconds simulation for local dev

        return res.status(202).json({
          status: 'accepted',
          data: {
            jobId,
            message: 'Export in progress. You will be notified when ready.'
          }
        });
      } else {
        // Sync return
        const downloadUrl = `https://lumina-exports.s3.amazonaws.com/sync_${uuidv4()}.csv`;
        
        const job = new ExportJobModel({
          jobId,
          requestedBy,
          reportType,
          format,
          filters,
          status: 'COMPLETE',
          downloadUrl,
          completedAt: new Date()
        });
        await job.save();

        return res.status(200).json({
          status: 'success',
          data: { downloadUrl }
        });
      }
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // Internal fire-and-forget logger
  static logEvent(
    eventType: string,
    module: string,
    action: string,
    performedBy: string,
    lcId?: string,
    details: any = {}
  ) {
    // Non-blocking fire and forget
    setImmediate(async () => {
      try {
        const log = new AuditLogModel({
          eventId: uuidv4(),
          eventType,
          module,
          action,
          performedBy,
          lcId,
          details,
          timestamp: new Date()
        });
        await log.save();
        console.log(`[Audit Recorded] ${eventType} - ${action} by ${performedBy}`);
      } catch (err) {
        console.error('[Audit Write Failed]', err);
      }
    });
  }
}
