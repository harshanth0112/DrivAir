import { Router } from 'express';
import * as vehiclesController from './vehicles.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { vehicleSchema } from '../documents/documents.validation.js';

const router = Router();

router.use(authenticate);

// Search vehicles (company or admin)
router.get('/search', authorize('company', 'admin'), vehiclesController.searchVehicles);

// Manage own vehicles (vehicleOwner)
router.post('/', authorize('vehicleOwner'), validate(vehicleSchema), vehiclesController.createVehicle);
router.get('/mine', authorize('vehicleOwner'), vehiclesController.getMyVehicles);
router.patch('/:id', authorize('vehicleOwner'), vehiclesController.updateVehicle);
router.delete('/:id', authorize('vehicleOwner'), vehiclesController.deleteVehicle);

export default router;
