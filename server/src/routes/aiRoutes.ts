import { Router } from 'express';
import { parseWhatsAppOrder, saveRetailerAlias } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/parse-order', parseWhatsAppOrder);
router.post('/alias', requireAuth, saveRetailerAlias);

export default router;

