import { Router } from 'express';
import * as tripsController from './trips.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { startTripSchema, endTripSchema } from './trips.validation.js';

const router = Router();

router.use(authenticate);

router.post('/start', authorize('driver', 'vehicleOwner'), validate(startTripSchema), tripsController.startTrip);
router.post('/:tripId/end', authorize('driver', 'vehicleOwner', 'admin'), validate(endTripSchema), tripsController.endTrip);
router.get('/active', tripsController.getActiveTrips);
router.get('/history', tripsController.getTripHistory);
router.get('/:tripId', tripsController.getTripById);

export default router;
