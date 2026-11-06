import express from 'express';
import cors from 'cors';
import * as helmetPkg from 'helmet';
import { rateLimit } from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import orderDeskRoutes from './routes/orderDeskRoutes.js';

const helmetMiddleware = (
  typeof (helmetPkg as any).default === 'function' ? (helmetPkg as any).default : helmetPkg
) as (options?: Record<string, unknown>) => express.RequestHandler;

export const createApp = (): express.Application => {
  const app = express();

  app.set('trust proxy', 1);

  // HTTP Security Headers (ESM & CJS TypeScript 5.9 compatible)
  app.use(
    helmetMiddleware({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Strict CORS Allowlist (normalizes trailing slashes & auto-trusts Vercel deployment URLs)
  const configuredOrigins = env.CLIENT_ORIGIN.split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (process.env.VERCEL_URL) {
    configuredOrigins.push(`https://${process.env.VERCEL_URL.replace(/\/+$/, '')}`);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    configuredOrigins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, '')}`);
  }
  if (env.NODE_ENV !== 'production') {
    configuredOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173');
  }

  const allowedOriginSet = new Set(configuredOrigins);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow same-origin / server-to-server requests (no Origin header) or allowlisted origins
        if (!origin || allowedOriginSet.has(origin.replace(/\/+$/, ''))) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true,
    })
  );

  // Bounded Payload Parsers (prevent oversized memory DoS)
  app.use(express.json({ limit: '32kb' }));
  app.use(express.urlencoded({ extended: true, limit: '32kb' }));
  app.use(cookieParser());

  // Tiered API Rate Limiters
  const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 400,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this network. Please wait a moment and try again.',
    },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many sign-in attempts. Please wait a few minutes before trying again.',
    },
  });

  const aiParseLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 25,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Smart Order rate limit reached. Please wait a few minutes or add items from the catalog.',
    },
  });

  const publicFormLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many form submissions. Please wait a few minutes before sending another message.',
    },
  });

  app.use('/api/v1', generalApiLimiter);

  // Root & Healthcheck endpoints
  app.get('/', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'Stockora API',
      version: '1.0.0',
    });
  });

  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'Stockora API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Ensure MongoDB connection is established on serverless cold starts before business routes
  app.use(
    '/api/v1',
    asyncHandler(async (_req, _res, next) => {
      await connectDB();
      next();
    })
  );

  // REST API Routes
  app.use('/api/v1/auth/login', authLimiter);
  app.use('/api/v1/auth/register', authLimiter);
  app.use('/api/v1/auth/otp', authLimiter);
  app.use('/api/v1/auth/google', authLimiter);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/public', publicFormLimiter, publicRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/ai/parse-order', aiParseLimiter);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/desk', orderDeskRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
