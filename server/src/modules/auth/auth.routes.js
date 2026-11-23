import { Router } from 'express';
import * as authController from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { syncUserSchema } from './auth.validation.js';
import { authSyncLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// POST /api/v1/auth/sync
router.post('/sync', authSyncLimiter, validate(syncUserSchema), authController.sync);

export default router;
