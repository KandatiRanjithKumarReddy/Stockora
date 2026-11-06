import { Router } from 'express';
import { parseWhatsAppOrder, saveRetailerAlias } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/parse-order', asyncHandler(requireAuth), asyncHandler(parseWhatsAppOrder));
router.post('/alias', asyncHandler(requireAuth), asyncHandler(saveRetailerAlias));

export default router;

