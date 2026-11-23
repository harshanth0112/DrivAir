import rateLimit from 'express-rate-limit';

/**
 * Sensitive operation rate limiters.
 * Protect against brute-force, DoS, and automated credential stuffing.
 */

// Auth sync: max 30 sync attempts per 15 minutes per IP
export const authSyncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    status: 'fail',
    message: 'Too many authentication sync attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File uploads: max 20 uploads per 15 minutes per IP
export const fileUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: 'fail',
    message: 'File upload rate limit reached. Please wait a few minutes before uploading more documents.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sensitive bidding/offers: max 60 actions per 15 minutes
export const sensitiveActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    status: 'fail',
    message: 'Too many transaction requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
