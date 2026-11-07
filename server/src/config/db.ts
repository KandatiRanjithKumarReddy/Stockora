import mongoose from 'mongoose';
import { env } from './env.js';

let cachedConnectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  if (!env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  // Fast path for warm serverless containers
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!cachedConnectionPromise) {
    cachedConnectionPromise = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 10,
        minPoolSize: 1,
        maxIdleTimeMS: 60000,
        socketTimeoutMS: 30000,
      })
      .then((conn) => {
        console.log('[MongoDB] Database connection established.');
        return conn;
      })
      .catch((error) => {
        cachedConnectionPromise = null;
        console.error('[MongoDB] Connection failed.');
        throw error;
      });
  }

  await cachedConnectionPromise;
};
