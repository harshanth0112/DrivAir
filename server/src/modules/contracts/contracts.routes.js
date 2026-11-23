import { Router } from 'express';
import * as contractsController from './contracts.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

// View and manage contracts
router.get('/mine', contractsController.getMyContracts);
router.get('/:id', contractsController.getContractById);
router.patch('/:id/status', contractsController.updateContractStatus);

export default router;
