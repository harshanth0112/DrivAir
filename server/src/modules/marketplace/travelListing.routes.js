import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import * as travelListingController from './travelListing.controller.js';

const router = Router();

// Public browse and get single
router.get('/', travelListingController.getTravelListings);
router.get('/:id', travelListingController.getTravelListingById);
router.get('/:id/availability', travelListingController.getListingAvailability);

// Protected provider operations
router.use(authenticate);

router.post(
  '/',
  authorize('vehicleOwner', 'driver', 'admin'),
  travelListingController.createTravelListing
);

router.patch(
  '/:id',
  authorize('vehicleOwner', 'driver', 'admin'),
  travelListingController.updateTravelListing
);

router.delete(
  '/:id',
  authorize('vehicleOwner', 'driver', 'admin'),
  travelListingController.deleteTravelListing
);

export default router;
