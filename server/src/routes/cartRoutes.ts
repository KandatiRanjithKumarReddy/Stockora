import { Router } from 'express';
import { calculateCart } from '../controllers/cartController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/calculate', asyncHandler(requireAuth), asyncHandler(calculateCart));

export default router;

