import { Router } from 'express';
import * as vehicleOwnersController from './vehicleOwners.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { vehicleOwnerProfileSchema } from '../documents/documents.validation.js';

const router = Router();

router.use(authenticate);

// GET /api/v1/vehicle-owners/me
router.get('/me', authorize('vehicleOwner', 'admin'), vehicleOwnersController.getMyVehicleOwnerProfile);

// PUT /api/v1/vehicle-owners/me
router.put('/me', authorize('vehicleOwner'), validate(vehicleOwnerProfileSchema), vehicleOwnersController.updateMyVehicleOwnerProfile);

export default router;
