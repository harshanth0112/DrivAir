import dns from 'dns';

// Fix for Windows & ISP local DNS servers that fail on MongoDB Atlas SRV lookup records (querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
  console.log('[DNS] Initialized reliable public DNS resolvers (8.8.8.8, 1.1.1.1) for Atlas SRV resolution.');
} catch (e) {
  console.warn('[DNS Warning] Could not set custom DNS servers:', e.message);
}

import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  if (!env.MONGODB_URI) {
    console.log('[Database] No MONGODB_URI provided. Skipping DB connection.');
    return null;
  }

  // Graceful connection recovery listeners
  mongoose.connection.on('disconnected', () => {
    console.warn('[Database Alert] Mongoose connection lost. Auto-reconnecting...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[Database Info] Mongoose successfully reconnected to cluster.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Error] Mongoose runtime error: ${err.message}`);
  });

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      autoIndex: env.NODE_ENV !== 'production',
    });
    console.log(`[Database] ✅ Connected successfully to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (env.NODE_ENV === 'production') {
      console.error('[Database Fatal] Exiting process in production due to lack of DB connectivity.');
      process.exit(1);
    }
    return null;
  }
};
