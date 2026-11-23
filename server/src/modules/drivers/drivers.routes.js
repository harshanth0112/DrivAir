import { Router } from 'express';
import * as driversController from './drivers.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { driverProfileSchema } from '../documents/documents.validation.js';

const router = Router();

router.use(authenticate);

// GET /api/v1/drivers/me
router.get('/me', authorize('driver', 'admin'), driversController.getMyDriverProfile);

// PUT /api/v1/drivers/me
router.put('/me', authorize('driver'), validate(driverProfileSchema), driversController.updateMyDriverProfile);

export default router;
