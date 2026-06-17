import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';

const router = Router();
const aiController = new AiController();

router.post('/analyze-document', aiController.analyzeDocument.bind(aiController));
router.post('/query', aiController.queryAssistant.bind(aiController));

export default router;
