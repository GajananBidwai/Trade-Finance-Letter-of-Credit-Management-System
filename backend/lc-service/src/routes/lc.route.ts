import { Router } from 'express';
import { LCController } from '../controllers/lc.controller';

const router = Router();
const lcController = new LCController();

router.post('/', lcController.createLC.bind(lcController));
router.get('/', lcController.getAllLCs.bind(lcController));
router.get('/:lcId', lcController.getLC.bind(lcController));
router.put('/:lcId/status', lcController.updateLcStatus.bind(lcController));
router.post('/:lcId/documents', lcController.uploadDocument.bind(lcController));
router.get('/:lcId/documents', lcController.getDocuments.bind(lcController));
router.put('/:lcId/documents/:documentId/discrepancies/:discrepancyId/review', lcController.reviewDiscrepancy.bind(lcController));
router.post('/:lcId/settlement', lcController.processSettlement.bind(lcController));

export default router;
