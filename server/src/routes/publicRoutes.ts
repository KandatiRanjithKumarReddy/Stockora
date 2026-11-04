import { Router } from 'express';
import { submitContact, submitFeedback } from '../controllers/publicController.js';

const router = Router();

router.post('/contact', submitContact);
router.post('/feedback', submitFeedback);

export default router;

