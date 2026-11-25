import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/drivair'),
  FIREBASE_PROJECT_ID: z.string().default(''),
  FIREBASE_CLIENT_EMAIL: z.string().default(''),
  FIREBASE_PRIVATE_KEY: z.string().default(''),
  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('[Environment Validation Error] Invalid configuration:', parsed.error.format());
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Fatal: Invalid production environment variables');
  }
}

const rawEnv = parsed.success ? parsed.data : process.env;

// Production safety verification
if (rawEnv.NODE_ENV === 'production') {
  const missing = [];
  if (!rawEnv.MONGODB_URI || rawEnv.MONGODB_URI.includes('127.0.0.1')) missing.push('MONGODB_URI (remote cluster)');
  if (!rawEnv.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
  if (!rawEnv.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');
  if (missing.length > 0) {
    console.warn(`[Production Warning] Missing critical production configuration variables: ${missing.join(', ')}`);
  }
}

const cleanPrivateKey = (key) => {
  if (!key) return '';
  let cleaned = key.trim();
  // Strip enclosing quotes if present (e.g. from env files or dashboard UI)
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  // Replace literal \n with actual newlines
  cleaned = cleaned.replace(/\\n/g, '\n');
  return cleaned;
};

export const env = {
  NODE_ENV: rawEnv.NODE_ENV || 'development',
  PORT: Number(rawEnv.PORT) || 5000,
  CLIENT_URL: rawEnv.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: rawEnv.MONGODB_URI || 'mongodb://127.0.0.1:27017/drivair',
  FIREBASE_PROJECT_ID: rawEnv.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: rawEnv.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: cleanPrivateKey(rawEnv.FIREBASE_PRIVATE_KEY),
  CLOUDINARY_CLOUD_NAME: rawEnv.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: rawEnv.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: rawEnv.CLOUDINARY_API_SECRET || '',
};

export default env;
