import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('[MongoDB Atlas] Connection failed:', error);
    process.exit(1);
  }
};

