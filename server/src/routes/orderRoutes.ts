import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById } from '../controllers/orderController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/:id', getOrderById);

export default router;

