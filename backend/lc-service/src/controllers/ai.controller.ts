import { Request, Response } from 'express';
import { AiInteractionModel } from '../models/AiInteraction.model';
import { ReportController } from './report.controller';
import { LCModel } from '../models/LetterOfCredit.model';
import { NotificationController } from './notification.controller';

// Simulated OpenAI Mock Service
export class OpenAIMockService {
  static async analyzeDocument(lcTerms: any, documentType: string) {
    return new Promise((resolve, reject) => {
      // Simulate P95 10s latency
      const delay = Math.random() > 0.95 ? 12000 : Math.floor(Math.random() * 2000) + 1500;
      
      setTimeout(() => {
        // Randomly simulate OpenAI being unreachable (5% chance)
        if (Math.random() < 0.05) return reject(new Error('OpenAI API connection timeout'));
        
        // Mock semantic analysis result
        const discrepancies = documentType === 'BILL_OF_LADING' 
          ? ['Port of discharge mismatch', 'Late shipment detected'] 
          : [];
        const complianceStatus = discrepancies.length > 0 ? 'FAIL' : 'PASS';
        const riskScore = discrepancies.length > 0 ? 0.85 : 0.15;
        
        // Simulate low quality document warning randomly
        const qualityWarning = Math.random() < 0.1 ? 'Low resolution scan detected. Results may be inaccurate.' : null;

        resolve({
          complianceStatus,
          discrepancies,
          riskScore,
          qualityWarning
        });
      }, delay);
    });
  }

  static async resolveQuery(query: string, lcTermsContext: any) {
    return new Promise((resolve, reject) => {
      // Simulate P95 5s latency
      const delay = Math.random() > 0.95 ? 6000 : Math.floor(Math.random() * 1000) + 500;
      
      setTimeout(() => {
        // Randomly simulate OpenAI being unreachable (5% chance)
        if (Math.random() < 0.05) return reject(new Error('OpenAI API connection timeout'));

        const response = lcTermsContext 
          ? `Based on the terms of LC ${lcTermsContext.id}, the required documents are Commercial Invoice and Bill of Lading.` 
          : `Generally in trade finance, a Commercial Invoice and Bill of Lading are standard requirements.`;
          
        resolve({
          response,
          references: ['UCP 600 Article 14', 'ISBP 745']
        });
      }, delay);
    });
  }
}

export class AiController {

  // F-11: POST /api/v1/ai/analyze-document
  async analyzeDocument(req: Request, res: Response) {
    const { lcId, documentUrl, documentType } = req.body;
    const userId = req.headers['x-user-id'] as string || 'system_user';

    try {
      const lc = await LCModel.findById(lcId);
      if (!lc) return res.status(404).json({ status: 'error', message: 'LC not found' });
      
      if (!documentUrl || !documentUrl.startsWith('https://')) {
        return res.status(422).json({ status: 'error', message: 'Document could not be retrieved from the provided URL.' });
      }

      // Retry mechanism (up to 3 times with exponential backoff 1s, 2s, 4s)
      let attempt = 0;
      let analysisResult: any;
      let success = false;
      const backoffs = [1000, 2000, 4000];

      while (attempt <= 3 && !success) {
        try {
          // In real implementation, we would query MongoDB Atlas Vector Search here
          // to extract semantic embeddings of the LC terms
          analysisResult = await OpenAIMockService.analyzeDocument(lc, documentType);
          success = true;
        } catch (error) {
          attempt++;
          if (attempt <= 3) {
            console.log(`[AI Retry] Attempt ${attempt} failed, retrying in ${backoffs[attempt-1]}ms...`);
            await new Promise(r => setTimeout(r, backoffs[attempt-1]));
          }
        }
      }

      const interaction = new AiInteractionModel({
        interactionType: 'DOCUMENT_ANALYSIS',
        lcId,
        userId,
        input: { documentUrl, documentType },
        retryCount: Math.min(attempt, 3),
      });

      if (!success) {
        // FR-11-5: After exhaustion, flag MANUAL_REVIEW and notify
        interaction.finalStatus = 'FALLBACK_MANUAL_REVIEW';
        await interaction.save();

        NotificationController.dispatchInternal(
          lc.createdBy,
          'DOCUMENT_COMPLIANCE_FLAG',
          `AI Service unavailable. Document ${documentType} requires MANUAL REVIEW.`,
          'IN_APP'
        );

        ReportController.logEvent('AI_FALLBACK_TRIGGERED', 'AI Assistant', `Fallback to manual review for document ${documentType}`, userId, lcId, { documentUrl });
        
        return res.status(200).json({
          status: 'success',
          data: {
            complianceStatus: 'MANUAL_REVIEW',
            discrepancies: ['Manual review required due to AI unavailability'],
            riskScore: 0.5,
            qualityWarning: null
          }
        });
      }

      interaction.output = analysisResult;
      interaction.riskScore = analysisResult.riskScore;
      interaction.finalStatus = 'SUCCESS';
      await interaction.save();

      ReportController.logEvent('AI_DOCUMENT_ANALYZED', 'AI Assistant', `Analyzed document ${documentType}`, userId, lcId, { complianceStatus: analysisResult.complianceStatus, riskScore: analysisResult.riskScore });

      return res.status(200).json({
        status: 'success',
        data: analysisResult
      });

    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: err.message });
    }
  }

  // F-11: POST /api/v1/ai/query
  async queryAssistant(req: Request, res: Response) {
    const { query, context } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!query || query.length < 5 || query.length > 2000) {
      return res.status(400).json({ status: 'error', message: 'Query must be between 5 and 2000 characters' });
    }

    try {
      let lcContext = null;
      if (context?.lcId) {
        lcContext = await LCModel.findById(context.lcId);
      }

      const queryResult: any = await OpenAIMockService.resolveQuery(query, lcContext);

      const interaction = new AiInteractionModel({
        interactionType: 'QUERY',
        lcId: context?.lcId,
        userId,
        input: { query },
        output: queryResult,
        finalStatus: 'SUCCESS'
      });
      await interaction.save();

      // Ensure PII (query) is not directly logged in the central audit trail
      ReportController.logEvent('AI_QUERY_EXECUTED', 'AI Assistant', 'User queried AI Assistant', userId, context?.lcId, { interactionId: interaction._id });

      return res.status(200).json({
        status: 'success',
        data: queryResult
      });

    } catch (err: any) {
      // Return 503 if AI is unreachable on queries
      ReportController.logEvent('AI_FALLBACK_TRIGGERED', 'AI Assistant', 'AI Query failed (503)', userId, context?.lcId);
      return res.status(503).json({ status: 'error', message: 'AI Assistant is temporarily unavailable. Please try again shortly.' });
    }
  }
}
