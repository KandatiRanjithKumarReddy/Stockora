import type { Request, Response } from 'express';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';

const app = createApp();

export default async function vercelHandler(req: Request, res: Response): Promise<void> {
  await connectDB();
  app(req, res);
}

