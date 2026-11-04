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

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/otp/request', requestOtp);
router.post('/otp/verify', verifyOtp);
router.post('/google', googleAuth);
router.get('/me', requireAuth, getMe);
router.post('/logout', logout);

export default router;

