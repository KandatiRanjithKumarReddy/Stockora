import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import { Retailer } from '../models/Retailer.js';
import { signToken } from '../utils/jwt.js';

// Input Validation Schemas
const loginSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  storeName: z.string().min(2, 'Kirana Store Name is required'),
  locality: z.string().min(2, 'Locality in Jabalpur is required'),
  gstin: z.string().optional(),
});

const otpRequestSchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
});

const otpVerifySchema = z.object({
  phone: z.string().min(10, 'Valid 10-digit phone number is required'),
  otp: z.string().length(6, '6-digit OTP is required'),
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

  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
    retailerId: user.retailerId ? user.retailerId._id.toString() : undefined,
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

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

  // Create Retailer record
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
    creditLimit: 25000, // Initial default limit
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
    status: 'ACTIVE', // Automatically active for immediate ordering demo
    retailerId: retailer._id,
    authProvider: 'LOCAL',
  });

  const token = signToken({
    userId: newUser._id.toString(),
    role: newUser.role,
    retailerId: retailer._id.toString(),
  });

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
  const result = otpRequestSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const { phone } = result.data;
  // Mock SMS OTP for development/demo testing
  const mockOtp = '123456';

  res.json({
    success: true,
    message: `Mock OTP sent to ${phone}. (Use '123456' for instant demo login)`,
    mockOtp,
    isDemoMode: true,
  });
};

export const verifyOtp = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = otpVerifySchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, message: result.error.errors[0].message });
    return;
  }

  const { phone, otp } = result.data;

  if (otp !== '123456') {
    res.status(400).json({ success: false, message: 'Invalid OTP code. For demo, use 123456.' });
    return;
  }

  let user = await User.findOne({ phone }).populate('retailerId');
  if (!user) {
    // Auto-provision demo retailer if new phone
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
      creditLimit: 30000,
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
    role: user.role,
    retailerId: user.retailerId ? user.retailerId._id.toString() : undefined,
  });

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
  const { demoAccount, idToken } = req.body;

  // Handle Mock Google OAuth for Demo
  if (!idToken || demoAccount) {
    const demoRetailerUser = await User.findOne({ phone: '9826012345' }).populate('retailerId');
    if (!demoRetailerUser) {
      res.status(404).json({ success: false, message: 'Demo retailer user not seeded.' });
      return;
    }

    const token = signToken({
      userId: demoRetailerUser._id.toString(),
      role: demoRetailerUser.role,
      retailerId: demoRetailerUser.retailerId ? demoRetailerUser.retailerId._id.toString() : undefined,
    });

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

  // Ready for live Google Client ID ID-token verification
  res.status(501).json({
    success: false,
    message: 'Live Google Client ID not yet configured in .env. Use Demo Google Sign-In.',
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
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
};

