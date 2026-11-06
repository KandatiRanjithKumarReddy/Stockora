import { Router } from 'express';
import {
  getDeskOrders,
  getDeskOrderDetail,
  updateOrderStatus,
  updateOrderLines,
  exportTallyCsv,
} from '../controllers/orderDeskController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(asyncHandler(requireAuth));
router.use(requireRole('ORDER_DESK', 'ADMIN'));

router.get('/orders', asyncHandler(getDeskOrders));
router.get('/orders/:id', asyncHandler(getDeskOrderDetail));
router.patch('/orders/:id/status', asyncHandler(updateOrderStatus));
router.put('/orders/:id/lines', asyncHandler(updateOrderLines));
router.get('/export/tally-csv', asyncHandler(exportTallyCsv));

export default router;

