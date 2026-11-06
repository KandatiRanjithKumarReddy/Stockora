import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(asyncHandler(requireAuth));

router.post('/', asyncHandler(createOrder));
router.get('/my', asyncHandler(getMyOrders));
router.get('/:id', asyncHandler(getOrderById));

export default router;

