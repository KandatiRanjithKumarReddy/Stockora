import express from 'express';
import cors from 'cors';
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

  // Middleware
  app.use(
    cors({
      origin: [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

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
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/public', publicRoutes);
  app.use('/api/v1/products', productRoutes);
  app.use('/api/v1/cart', cartRoutes);
  app.use('/api/v1/orders', orderRoutes);
  app.use('/api/v1/ai', aiRoutes);
  app.use('/api/v1/desk', orderDeskRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
