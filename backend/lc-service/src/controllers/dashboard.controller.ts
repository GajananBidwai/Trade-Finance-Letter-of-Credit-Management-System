import { Request, Response } from 'express';
import { createClient } from 'redis';
import { LCModel, LCStatus } from '../models/LetterOfCredit.model';
import { LcDocumentModel } from '../models/LcDocument.model';
import { SettlementModel } from '../models/Settlement.model';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.log('Redis Client Error in lc-service', err));
redisClient.connect().catch(console.error);

export class DashboardController {
  async getSummary(req: Request, res: Response) {
    try {
      const userId = req.headers['x-user-id'] as string || 'system';
      const userRole = req.headers['x-user-role'] as string || 'TRADE_OFFICER';

      let cacheKey = `dashboard:summary:${userRole}`;
      if (userRole === 'TRADE_OFFICER') {
        cacheKey = `dashboard:summary:TRADE_OFFICER:${userId}`;
      }

      // Try Redis Cache
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          console.log(`[Dashboard] Cache hit for ${cacheKey}`);
          return res.status(200).json({ status: 'success', data: JSON.parse(cachedData) });
        }
      } catch (err) {
        console.error('Redis get error', err);
      }

      console.log(`[Dashboard] Cache miss for ${cacheKey}. Calculating live data.`);

      // Active LCs query
      const activeFilter: any = { status: LCStatus.ACTIVE };
      if (userRole === 'TRADE_OFFICER') {
        activeFilter.createdBy = userId; // scoping to user
      }
      const activeLCs = await LCModel.countDocuments(activeFilter);

      // Pending Settlements
      // LCs that are ACTIVE, have all docs compliant, but no settlement
      // For simplicity, we just count LCs that are ACTIVE and not documentsUnderReview
      // and not in Settlement collection
      const activeDocsFilter: any = { status: LCStatus.ACTIVE, documentsUnderReview: false };
      if (userRole === 'TRADE_OFFICER') activeDocsFilter.createdBy = userId;
      const readyLcs = await LCModel.find(activeDocsFilter).select('_id');
      const readyLcIds = readyLcs.map(l => l._id.toString());
      
      const settled = await SettlementModel.find({ lcId: { $in: readyLcIds } }).select('lcId');
      const settledLcIds = settled.map(s => s.lcId.toString());
      
      const pendingSettlements = readyLcIds.filter(id => !settledLcIds.includes(id)).length;

      // Overdue Workflows (PENDING_APPROVAL > 4 hours)
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
      const overdueFilter: any = {
        status: { $in: [LCStatus.PENDING_APPROVAL, LCStatus.AMENDED] },
        updatedAt: { $lt: fourHoursAgo }
      };
      if (userRole === 'TRADE_OFFICER') overdueFilter.createdBy = userId;
      const overdueWorkflows = await LCModel.countDocuments(overdueFilter);

      // Compliance Score (percentage of LCs with zero raised discrepancies in last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentDocs = await LcDocumentModel.find({ createdAt: { $gte: thirtyDaysAgo } });
      let perfectDocs = 0;
      recentDocs.forEach(doc => {
        const hasRaised = doc.discrepancies.some((d: any) => d.status === 'RAISED' || d.status === 'PENDING');
        if (!hasRaised) perfectDocs++;
      });
      const complianceScore = recentDocs.length > 0 ? (perfectDocs / recentDocs.length) * 100 : 100.0;

      const summaryData = {
        activeLCs,
        pendingSettlements,
        complianceScore: parseFloat(complianceScore.toFixed(1)),
        overdueWorkflows,
        dataAsOf: new Date().toISOString()
      };

      // Set to Redis with 60s TTL
      try {
        await redisClient.setEx(cacheKey, 60, JSON.stringify(summaryData));
      } catch (err) {
        console.error('Redis set error', err);
      }

      res.status(200).json({ status: 'success', data: summaryData });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}
