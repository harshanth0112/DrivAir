import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/users.routes.js';
import companyRoutes from './modules/companies/companies.routes.js';
import driverRoutes from './modules/drivers/drivers.routes.js';
import vehicleOwnerRoutes from './modules/vehicleOwners/vehicleOwners.routes.js';
import vehicleRoutes from './modules/vehicles/vehicles.routes.js';
import documentRoutes from './modules/documents/documents.routes.js';
import marketplaceRoutes from './modules/marketplace/marketplace.routes.js';
import travelListingRoutes from './modules/marketplace/travelListing.routes.js';
import bidRoutes from './modules/bids/bids.routes.js';
import directHiringRoutes from './modules/directHiring/directHiring.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import contractRoutes from './modules/contracts/contracts.routes.js';
import notificationRoutes from './modules/notifications/notifications.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import tripRoutes from './modules/trips/trips.routes.js';
import trackingRoutes from './modules/tracking/tracking.routes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration - strictly locked to configured CLIENT_URL
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Deep Health & Liveness Probe
app.get('/api/v1/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1 || env.NODE_ENV !== 'production';

  const healthData = {
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    service: 'DRIVAIR Backend API',
    environment: env.NODE_ENV,
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1,
    },
    memory: {
      rssMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      heapUsedMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };

  res.status(isHealthy ? 200 : 503).json(healthData);
});

// Mount API modules (supporting both /api/v1 and /api conventions)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/vehicle-owners', vehicleOwnerRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/contract-posts', marketplaceRoutes);
app.use('/api/v1/travel-listings', travelListingRoutes);
app.use('/api/travel-listings', travelListingRoutes);
app.use('/api/v1/bids', bidRoutes);
app.use('/api/v1/direct-hiring', directHiringRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/admin', adminRoutes);

// Trips & GPS Tracking APIs
app.use('/api/v1/trips', tripRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/v1/tracking', trackingRoutes);
app.use('/api/tracking', trackingRoutes);

// 404 handler for unknown routes
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found on this server`, 404));
});

// Central error handling middleware
app.use(errorHandler);

export default app;
