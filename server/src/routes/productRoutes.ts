import { Router } from 'express';
import { getProducts, getProductById, getCategories } from '../controllers/productController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/categories', asyncHandler(getCategories));
router.get('/', asyncHandler(optionalAuth), asyncHandler(getProducts));
router.get('/:id', asyncHandler(optionalAuth), asyncHandler(getProductById));

export default router;

