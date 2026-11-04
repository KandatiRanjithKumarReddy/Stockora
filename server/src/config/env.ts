import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_stockora_secret_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_PRIMARY_MODEL: process.env.GEMINI_PRIMARY_MODEL || 'gemini-3.5-flash-lite',
  GEMINI_SECONDARY_MODEL: process.env.GEMINI_SECONDARY_MODEL || 'gemini-3.6-flash',
  GEMINI_TERTIARY_MODEL: process.env.GEMINI_TERTIARY_MODEL || 'gemini-3.8-flash',
  STOCK_RESERVATION_EXPIRY_MINUTES: parseInt(process.env.STOCK_RESERVATION_EXPIRY_MINUTES || '1440', 10),
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};
