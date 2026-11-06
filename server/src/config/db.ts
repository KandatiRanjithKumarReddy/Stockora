import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async (): Promise<void> => {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[MongoDB] Database connection established.');
  } catch (error) {
    console.error('[MongoDB] Connection failed.');
    process.exit(1);
  }
};

