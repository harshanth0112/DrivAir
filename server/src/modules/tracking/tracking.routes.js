import { Router } from 'express';
import * as trackingController from './tracking.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { locationUpdateSchema } from '../trips/trips.validation.js';

const router = Router();

router.use(authenticate);

router.post('/location', authorize('driver', 'vehicleOwner'), validate(locationUpdateSchema), trackingController.recordLocation);
router.get('/:tripId/latest', trackingController.getLatestLocation);
router.get('/:tripId/history', trackingController.getLocationHistory);

export default router;
