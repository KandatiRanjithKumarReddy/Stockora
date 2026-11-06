import { Router } from 'express';
import { submitContact, submitFeedback } from '../controllers/publicController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/contact', asyncHandler(submitContact));
router.post('/feedback', asyncHandler(submitFeedback));

export default router;

