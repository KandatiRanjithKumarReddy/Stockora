import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import { Retailer } from '../models/Retailer.js';
import { signToken } from '../utils/jwt.js';
import { env } from '../config/env.js';

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const setSessionCookie = (res: Response, token: string): void => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_MS,
  });
};

// Bounded Input Validation Schemas
const loginSchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/, 'Valid 10-digit phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password is too long'),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100, 'Name is too long'),
  phone: z.string().trim().regex(/^\d{10}$/, 'Valid 10-digit phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password is too long'),
  storeName: z.string().trim().min(2, 'Kirana Store Name is required').max(120, 'Store name is too long'),
  locality: z.string().trim().min(2, 'Locality in Jabalpur is required').max(120, 'Locality is too long'),
  gstin: z.string().trim().max(20, 'Invalid GSTIN length').optional(),
});

const otpRequestSchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/, 'Valid 10-digit phone number is required'),
});

const otpVerifySchema = z.object({
  phone: z.string().trim().regex(/^\d{10}$/, 'Valid 10-digit phone number is required'),
  otp: z.string().trim().length(6, '6-digit OTP is required'),
});

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const { phone, password } = result.data;
  const user = await User.findOne({ phone }).populate('retailerId');

  if (!user || !user.passwordHash) {
    res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid phone number or password.' });
    return;
  }

  if (user.status === 'PENDING_APPROVAL') {
    res.status(403).json({
      success: false,
      message: 'Your retailer registration is pending review by Company A Order Desk.',
    });
    return;
  }

  if (user.status === 'SUSPENDED') {
    res.status(403).json({
      success: false,
      message: 'Your account is suspended. Please contact Company A Order Desk.',
    });
    return;
  }

  if (user.role === 'RETAILER' && user.retailerId && (user.retailerId as any).isActive === false) {
    res.status(403).json({
      success: false,
      message: 'This retailer shop profile is currently inactive.',
    });
    return;
  }

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
    retailerId: user.retailerId ? (user.retailerId as any)._id.toString() : undefined,
  });

  setSessionCookie(res, token);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      status: user.status,
      retailer: user.retailerId,
    },
  });
};

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const { name, phone, password, storeName, locality, gstin } = result.data;

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    res.status(409).json({ success: false, message: 'An account with this phone number already exists.' });
    return;
  }

  const retailer = await Retailer.create({
    storeName,
    ownerName: name,
    phone,
    address: {
      street: '',
      locality,
      city: 'Jabalpur',
      pincode: '482001',
      state: 'Madhya Pradesh',
    },
    gstin: gstin || undefined,
    creditLimit: 25000,
    outstandingBalance: 0,
    creditStatus: 'GOOD',
    priceTier: 'DEFAULT',
    isActive: true,
  });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name,
    phone,
    passwordHash,
    role: 'RETAILER',
    status: 'ACTIVE',
    retailerId: retailer._id,
    authProvider: 'LOCAL',
  });

  const token = signToken({
    userId: newUser._id.toString(),
    role: newUser.role,
    retailerId: retailer._id.toString(),
  });

  setSessionCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'Retailer account created successfully',
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      status: newUser.status,
      retailer,
    },
  });
};

export const requestOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!env.ENABLE_DEMO_AUTH) {
    res.status(503).json({
      success: false,
      message: 'SMS OTP gateway is disabled in this environment. Please sign in with your password.',
    });
    return;
  }

  const result = otpRequestSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const { phone } = result.data;

  // Staff accounts (Order Desk & Admin) must never authenticate via passwordless OTP
  const existingUser = await User.findOne({ phone });
  if (existingUser && existingUser.role !== 'RETAILER') {
    res.status(403).json({
      success: false,
      message: 'Order Desk and Admin staff must sign in with their password.',
    });
    return;
  }

  res.json({
    success: true,
    message: `Verification code sent to ${phone}. Use 123456 for demo retailer sign-in.`,
    ...(env.NODE_ENV !== 'production' ? { isDemoMode: true } : {}),
  });
};

export const verifyOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!env.ENABLE_DEMO_AUTH) {
    res.status(503).json({
      success: false,
      message: 'SMS OTP gateway is disabled in this environment. Please sign in with your password.',
    });
    return;
  }

  const result = otpVerifySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const { phone, otp } = result.data;

  if (otp !== '123456') {
    res.status(400).json({
      success: false,
      message: 'Invalid verification code. Please check the 6-digit code and try again.',
    });
    return;
  }

  let user = await User.findOne({ phone }).populate('retailerId');

  // Strict Role Boundary: Never issue ADMIN or ORDER_DESK tokens via OTP
  if (user && user.role !== 'RETAILER') {
    res.status(403).json({
      success: false,
      message: 'Order Desk and Admin staff must sign in with their password.',
    });
    return;
  }

  if (user && user.status === 'SUSPENDED') {
    res.status(403).json({
      success: false,
      message: 'Your account is suspended. Please contact Company A Order Desk.',
    });
    return;
  }

  if (user && user.status === 'PENDING_APPROVAL') {
    res.status(403).json({
      success: false,
      message: 'Your retailer registration is pending review by Company A Order Desk.',
    });
    return;
  }

  if (!user) {
    const retailer = await Retailer.create({
      storeName: `Kirana Store (${phone.slice(-4)})`,
      ownerName: 'Kirana Owner',
      phone,
      address: {
        street: 'Main Road',
        locality: 'Wright Town',
        city: 'Jabalpur',
        pincode: '482002',
        state: 'Madhya Pradesh',
      },
      creditLimit: 25000,
      outstandingBalance: 0,
      creditStatus: 'GOOD',
    });

    user = await User.create({
      name: 'Kirana Store Owner',
      phone,
      role: 'RETAILER',
      status: 'ACTIVE',
      retailerId: retailer._id,
      authProvider: 'LOCAL',
    });
    user.retailerId = retailer as any;
  }

  const token = signToken({
    userId: user._id.toString(),
    role: 'RETAILER',
    retailerId: user.retailerId ? (user.retailerId as any)._id.toString() : undefined,
  });

  setSessionCookie(res, token);

  res.json({
    success: true,
    message: 'OTP verification successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      retailer: user.retailerId,
    },
  });
};

export const googleAuth = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { demoAccount, idToken } = req.body || {};

  if (!env.ENABLE_DEMO_AUTH) {
    res.status(501).json({
      success: false,
      message: 'Google sign-in is disabled in production mode. Please use mobile number sign-in.',
    });
    return;
  }

  if (!idToken || demoAccount) {
    const demoRetailerUser = await User.findOne({
      phone: '9826012345',
      role: 'RETAILER',
      status: 'ACTIVE',
    }).populate('retailerId');

    if (!demoRetailerUser) {
      res.status(404).json({ success: false, message: 'Demo retailer user not seeded.' });
      return;
    }

    const token = signToken({
      userId: demoRetailerUser._id.toString(),
      role: 'RETAILER',
      retailerId: demoRetailerUser.retailerId ? (demoRetailerUser.retailerId as any)._id.toString() : undefined,
    });

    setSessionCookie(res, token);

    res.json({
      success: true,
      message: 'Demo Google authentication successful (Connected as Ramesh Gupta)',
      token,
      isMockMode: true,
      user: {
        id: demoRetailerUser._id,
        name: demoRetailerUser.name,
        phone: demoRetailerUser.phone,
        email: demoRetailerUser.email,
        role: demoRetailerUser.role,
        status: demoRetailerUser.status,
        retailer: demoRetailerUser.retailerId,
      },
    });
    return;
  }

  res.status(501).json({
    success: false,
    message: 'Google workspace sign-in is currently available in demo mode.',
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      email: req.user.email,
      role: req.user.role,
      status: req.user.status,
      retailer: req.user.retailerId,
    },
  });
};

export const logout = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully' });
};
