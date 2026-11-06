import { Router } from 'express';
import {
  login,
  register,
  requestOtp,
  verifyOtp,
  googleAuth,
  getMe,
  logout,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));
router.post('/otp/request', asyncHandler(requestOtp));
router.post('/otp/verify', asyncHandler(verifyOtp));
router.post('/google', asyncHandler(googleAuth));
router.get('/me', asyncHandler(requireAuth), asyncHandler(getMe));
router.post('/logout', asyncHandler(logout));

export default router;

