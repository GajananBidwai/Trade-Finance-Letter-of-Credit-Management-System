import { Request, Response } from 'express';
import { LCModel, LCStatus } from '../models/LetterOfCredit.model';
import { LcDocumentModel, DocumentTypeEnum } from '../models/LcDocument.model';
import { SettlementModel } from '../models/Settlement.model';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { NotificationController } from './notification.controller';
import { ReportController } from './report.controller';

export class LCController {
  
  async createLC(req: Request, res: Response) {
    try {
      const { applicant, beneficiary, amount, currency, paymentType, partialShipments, transshipment, documentsRequired } = req.body;
      const createdBy = (req as any).user?.userId || 'system_user'; // Should come from decoded JWT forwarded by api-gateway

      // F-04 Spec: Check for existing LC reference (mocking it with applicant + beneficiary + amount for now)
      const existing = await LCModel.findOne({ applicant, beneficiary, amount });
      if (existing) {
        return res.status(409).json({ status: 'error', message: 'An LC with this reference already exists.' });
      }

      const lc = new LCModel({
        applicant,
        beneficiary,
        amount,
        currency,
        paymentType,
        partialShipments,
        transshipment,
        status: LCStatus.PENDING_APPROVAL,
        documentsRequired: documentsRequired || [],
        timeline: [{ status: 'CREATED', timestamp: new Date(), user: createdBy }],
        createdBy
      });

      await lc.save();
      
      NotificationController.dispatchInternal(
        createdBy,
        'LC_SUBMITTED',
        `LC created successfully. Reference ID: ${lc.id}`,
        'IN_APP'
      ).catch(e => console.error(e));

      ReportController.logEvent('LC_CREATED', 'Workflow', 'Created Letter of Credit', createdBy, lc.id, { amount, currency });
      
      res.status(201).json({ status: 'success', data: { lcId: lc.id, lcStatus: lc.status } });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async getLC(req: Request, res: Response) {
    try {
      const lc = await LCModel.findById(req.params.lcId);
      if (!lc) {
        return res.status(404).json({ status: 'error', message: 'LC not found.' });
      }
      res.status(200).json({ status: 'success', data: lc });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async getAllLCs(req: Request, res: Response) {
    try {
      const { status } = req.query;
      const query: any = {};
      if (status && typeof status === 'string' && status !== 'All Statuses') {
        query.status = status;
      }
      const lcs = await LCModel.find(query).sort({ createdAt: -1 });
      res.status(200).json({ status: 'success', data: lcs });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async updateLcStatus(req: Request, res: Response) {
    try {
      const { lcId } = req.params;
      const { status, comment, approvedBy, version } = req.body;

      if (!status || !approvedBy || version === undefined) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields: status, approvedBy, version.' });
      }

      if (status === LCStatus.REJECTED && !comment) {
        return res.status(422).json({ status: 'error', message: 'Comment is required when rejecting an LC.' });
      }

      const lc = await LCModel.findById(lcId);
      if (!lc) {
        return res.status(404).json({ status: 'error', message: 'LC not found.' });
      }

      // Optimistic Locking
      if (lc.version !== version) {
        return res.status(409).json({ status: 'error', message: 'Concurrent update conflict. Please reload and retry.' });
      }

      // Amendment blocking if documents are under review
      if (status === LCStatus.AMENDED && lc.documentsUnderReview) {
        return res.status(409).json({ status: 'error', message: 'Amendment blocked: document review in progress.' });
      }

      // State Machine enforcement
      const validTransitions: Record<string, string[]> = {
        [LCStatus.PENDING_APPROVAL]: [LCStatus.ACTIVE, LCStatus.REJECTED],
        [LCStatus.ACTIVE]: [LCStatus.AMENDED, LCStatus.SETTLED, LCStatus.EXPIRED],
        [LCStatus.AMENDED]: [LCStatus.ACTIVE, LCStatus.REJECTED]
      };

      const allowedNext = validTransitions[lc.status] || [];
      if (!allowedNext.includes(status)) {
        return res.status(422).json({ status: 'error', message: 'Invalid status transition.' });
      }

      // Perform transition
      const fromStatus = lc.status;
      lc.status = status;
      lc.version += 1;
      lc.statusHistory.push({
        fromStatus,
        toStatus: status,
        performedBy: approvedBy,
        comment: comment || '',
        timestamp: new Date()
      });

      await lc.save();

      ReportController.logEvent('LC_STATUS_UPDATED', 'Workflow', `Updated LC status to ${status}`, approvedBy, lc.id, { fromStatus, toStatus: status, comment });
      
      // Dispatch real notification
      NotificationController.dispatchInternal(
        lc.createdBy, 
        'LC_STATUS_CHANGED', 
        `Your LC ${lc.id} status was changed to ${status} by ${approvedBy}.`, 
        'EMAIL'
      ).catch(e => console.error(e));

      res.status(200).json({ status: 'success', data: { lcId: lc.id, lcStatus: lc.status, version: lc.version } });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async uploadDocument(req: Request, res: Response) {
    try {
      const { lcId } = req.params;
      const { documentType, fileUrl, submittedBy } = req.body;

      if (!documentType || !fileUrl || !submittedBy) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields.' });
      }

      // Check file type
      const lowerUrl = fileUrl.toLowerCase();
      if (!lowerUrl.endsWith('.pdf') && !lowerUrl.endsWith('.tiff') && !lowerUrl.endsWith('.png')) {
        return res.status(400).json({ status: 'error', message: 'Unsupported document format. Accepted: PDF, TIFF, PNG.' });
      }

      const lc = await LCModel.findById(lcId);
      if (!lc) {
        return res.status(404).json({ status: 'error', message: 'LC not found.' });
      }

      if (lc.status !== LCStatus.ACTIVE) {
        return res.status(422).json({ status: 'error', message: 'Documents can only be submitted against an ACTIVE LC.' });
      }

      // Mock AI invocation
      const isQualityBad = lowerUrl.includes('low_res');
      const isFail = documentType === 'BILL_OF_LADING' && lowerUrl.includes('fail');
      
      const aiResponse = {
        complianceStatus: isFail ? 'FAIL' : 'PASS',
        discrepancies: isFail ? [
          { description: 'Bill of Lading date mismatch', status: 'PENDING' }
        ] : [],
        riskScore: isFail ? 0.85 : 0.05,
        qualityWarning: isQualityBad ? 'Low Quality Scan Detected' : null
      };

      // F-11: Integrate AI Document Analysis
      // We simulate an internal call to the AI service logic here
      // Ideally we'd hit the microservice via HTTP, but we're in the same monolith for now
      
      const lcDoc = new LcDocumentModel({
        lcId,
        documentType,
        fileUrl,
        submittedBy,
        complianceStatus: 'PENDING_REVIEW', // Default before AI
        discrepancies: [],
        riskScore: 0.0,
        qualityWarning: null
      });

      try {
        const { OpenAIMockService } = require('./ai.controller');
        const aiResult: any = await OpenAIMockService.analyzeDocument(lc, documentType);
        
        lcDoc.complianceStatus = aiResult.complianceStatus;
        if (aiResult.complianceStatus === 'FAIL') {
          lcDoc.discrepancies = aiResult.discrepancies.map((d: string) => ({
            id: new mongoose.Types.ObjectId().toHexString(),
            description: d,
            severity: 'HIGH',
            status: 'PENDING'
          }));
        }

        // F-11: Record AI interaction locally
        const { AiInteractionModel } = require('../models/AiInteraction.model');
        const interaction = new AiInteractionModel({
          interactionType: 'DOCUMENT_ANALYSIS',
          lcId,
          userId: submittedBy,
          input: { documentUrl: fileUrl, documentType },
          output: aiResult,
          riskScore: aiResult.riskScore,
          finalStatus: 'SUCCESS'
        });
        await interaction.save();
        ReportController.logEvent('AI_DOCUMENT_ANALYZED', 'AI Assistant', `Analyzed document ${documentType}`, String(submittedBy), String(lcId), { complianceStatus: aiResult.complianceStatus, riskScore: aiResult.riskScore });
        
      } catch (aiErr) {
        console.error('[AI Analysis Failed]', aiErr);
        lcDoc.complianceStatus = 'MANUAL_REVIEW';
        ReportController.logEvent('AI_FALLBACK_TRIGGERED', 'AI Assistant', `Fallback to manual review for document ${documentType}`, String(submittedBy), String(lcId), { documentUrl: fileUrl });
      }

      await lcDoc.save();

      const allDocs = await LcDocumentModel.find({ lcId });
      const hasPending = allDocs.some((d: any) => d.complianceStatus === 'FAIL' || d.complianceStatus === 'MANUAL_REVIEW' || (d.discrepancies && d.discrepancies.some((dis: any) => dis.status === 'PENDING')));
      
      if (lc.documentsUnderReview !== hasPending) {
        lc.documentsUnderReview = hasPending;
        // Also update status if transitioning
        if (hasPending && lc.status === LCStatus.ACTIVE) {
          lc.status = 'DOCUMENTS_UNDER_REVIEW' as any; // Note: if DOCUMENTS_UNDER_REVIEW isn't in LCStatus enum, we bypass TS temporarily. Actually let's just keep the boolean flag.
        }
        await lc.save();
      }

      ReportController.logEvent('DOCUMENT_UPLOADED', 'Documents', `Uploaded document type ${documentType}`, submittedBy, lc.id, { documentId: lcDoc._id, complianceStatus: lcDoc.complianceStatus });

      if (lcDoc.complianceStatus === 'FAIL') {
        NotificationController.dispatchInternal(
          lc.createdBy,
          'DOCUMENT_COMPLIANCE_FLAG',
          `AI flagged compliance issues on document ${documentType} for LC ${lc.id}.`,
          'SMS'
        ).catch(e => console.error(e));
      }

      res.status(200).json({ status: 'success', data: {
        documentId: lcDoc._id,
        complianceStatus: lcDoc.complianceStatus,
        discrepancies: lcDoc.discrepancies || [],
        qualityWarning: (lcDoc as any).qualityWarning || null,
        riskScore: (lcDoc as any).riskScore || 0.0
      }});
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async getDocuments(req: Request, res: Response) {
    try {
      const { lcId } = req.params;
      const docs = await LcDocumentModel.find({ lcId }).sort({ createdAt: -1 });
      res.status(200).json({ status: 'success', data: docs });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async reviewDiscrepancy(req: Request, res: Response) {
    try {
      const { lcId, documentId, discrepancyId } = req.params;
      const { status, comment, decidedBy } = req.body;

      if (!status || !['RAISED', 'WAIVED'].includes(status)) {
        return res.status(400).json({ status: 'error', message: 'Invalid discrepancy status.' });
      }
      if (status === 'RAISED' && !comment) {
        return res.status(400).json({ status: 'error', message: 'Comment required when RAISED is selected.' });
      }

      const doc = await LcDocumentModel.findOne({ _id: documentId, lcId });
      if (!doc) {
        return res.status(404).json({ status: 'error', message: 'Document not found.' });
      }

      const discrepancy = doc.discrepancies.find((d: any) => d._id.toString() === discrepancyId);
      if (!discrepancy) {
        return res.status(404).json({ status: 'error', message: 'Discrepancy not found.' });
      }

      discrepancy.status = status;
      discrepancy.comment = comment;
      discrepancy.decidedBy = decidedBy;

      await doc.save();

      console.log(`[Audit] DISCREPANCY_${status} docId=${documentId} discrepancyId=${discrepancyId}`);

      // Check if all discrepancies are waived, if so, we can clear documentsUnderReview.
      const allDocs = await LcDocumentModel.find({ lcId });
      const hasPending = allDocs.some(d => d.complianceStatus === 'FAIL' || d.complianceStatus === 'MANUAL_REVIEW' || d.discrepancies.some((dis: any) => dis.status === 'PENDING'));
      
      const lc = await LCModel.findById(lcId);
      if (lc && lc.documentsUnderReview !== hasPending) {
        lc.documentsUnderReview = hasPending;
        await lc.save();

        NotificationController.dispatchInternal(
          lc.createdBy,
          'DISCREPANCY_REVIEWED',
          `Discrepancy update on LC ${lc.id}: ${status}.`,
          'EMAIL'
        ).catch(e => console.error(e));
      }
      res.status(200).json({ status: 'success', data: doc });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async processSettlement(req: Request, res: Response) {
    try {
      const { lcId } = req.params;
      const { settlementAmount, currency, authorizedBy, overrideApprovedBy, overrideComment } = req.body;

      if (!settlementAmount || !currency || !authorizedBy) {
        return res.status(400).json({ status: 'error', message: 'Missing required settlement fields.' });
      }

      const lc = await LCModel.findById(lcId);
      if (!lc) {
        return res.status(404).json({ status: 'error', message: 'LC not found.' });
      }

      if (lc.status === LCStatus.SETTLED) {
        return res.status(409).json({ status: 'error', message: 'This LC has already been settled.' });
      }

      if (lc.status !== LCStatus.ACTIVE) {
        return res.status(422).json({ status: 'error', message: 'Settlement can only be processed for an ACTIVE LC.' });
      }

      const documents = await LcDocumentModel.find({ lcId });
      // If there are required documents, we might check if they are all uploaded.
      // For this feature, we just ensure no pending/failed docs.
      const hasPendingDocs = documents.some(doc => doc.complianceStatus === 'FAIL' || doc.complianceStatus === 'MANUAL_REVIEW' || doc.discrepancies.some((dis: any) => dis.status === 'PENDING'));
      if (hasPendingDocs) {
        return res.status(422).json({ status: 'error', message: 'All document discrepancies must be resolved before settlement.' });
      }

      const settlementAmountNum = parseFloat(settlementAmount.toString());
      const lcAmountNum = parseFloat(lc.amount.toString());

      if (Math.abs(settlementAmountNum - lcAmountNum) > 0.01) {
        if (!overrideApprovedBy) {
          return res.status(422).json({ status: 'error', message: 'Settlement amount does not match approved LC amount. Senior officer approval required.' });
        }
      }

      const settlementId = uuidv4();
      
      const settlement = new SettlementModel({
        settlementId,
        lcId,
        settlementAmount,
        currency,
        authorizedBy,
        overrideApprovedBy: overrideApprovedBy || null,
        overrideComment: overrideComment || null,
        settledAt: new Date()
      });

      await settlement.save();

      lc.status = LCStatus.SETTLED;
      lc.settledAt = new Date();
      lc.version += 1;
      lc.statusHistory.push({
        fromStatus: LCStatus.ACTIVE,
        toStatus: LCStatus.SETTLED,
        performedBy: authorizedBy,
        comment: overrideApprovedBy ? `Settled with override by ${overrideApprovedBy}: ${overrideComment}` : 'Settled matching amount',
        timestamp: new Date()
      });
      lc.timeline.push({
        status: LCStatus.SETTLED,
        timestamp: new Date(),
        user: authorizedBy
      });

      await lc.save();

      const eventType = overrideApprovedBy ? 'SETTLEMENT_OVERRIDE_APPROVED' : 'SETTLEMENT_PROCESSED';
      console.log(`[Audit] ${eventType} lcId=${lcId} settlementId=${settlementId} amount=${settlementAmount}`);
      console.log(`[Notification] Dispatching settlement confirmation for LC ${lcId}`);

      res.status(200).json({ status: 'success', data: { settlementId, lcStatus: lc.status } });
    } catch (err: any) {
      if (err.code === 11000) {
        return res.status(409).json({ status: 'error', message: 'This LC has already been settled.' });
      }
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}
