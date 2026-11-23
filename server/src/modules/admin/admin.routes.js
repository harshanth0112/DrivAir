import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router = Router();

router.use(authenticate, authorize('admin'));

// Admin user governance
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
