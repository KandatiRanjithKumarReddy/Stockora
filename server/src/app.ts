import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import orderDeskRoutes from './routes/orderDeskRoutes.js';

export const createApp = (): express.Application => {
  const app = express();

  app.set('trust proxy', 1);

  // HTTP Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Strict CORS Allowlist
  const allowedOrigins =
    env.NODE_ENV === 'production'
      ? [env.CLIENT_ORIGIN]
      : [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];

  app.use(
    cors({
      origin: allowedOrigins,
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

  // Healthcheck endpoint
  app.get('/api/v1/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'Stockora API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

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
