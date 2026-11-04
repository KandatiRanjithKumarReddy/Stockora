import { Router } from 'express';
import {
  getDeskOrders,
  getDeskOrderDetail,
  updateOrderStatus,
  updateOrderLines,
  exportTallyCsv,
} from '../controllers/orderDeskController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('ORDER_DESK', 'ADMIN'));

router.get('/orders', getDeskOrders);
router.get('/orders/:id', getDeskOrderDetail);
router.patch('/orders/:id/status', updateOrderStatus);
router.put('/orders/:id/lines', updateOrderLines);
router.get('/export/tally-csv', exportTallyCsv);

export default router;

