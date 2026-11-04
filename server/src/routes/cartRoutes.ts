import { Router } from 'express';
import { calculateCart } from '../controllers/cartController.js';

const router = Router();

router.post('/calculate', calculateCart);

export default router;

