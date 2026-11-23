import { Router } from 'express';
import * as notificationsController from './notifications.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

// P1 FIX: Added unread-count and read-all endpoints
router.get('/unread-count', notificationsController.getUnreadCount);
router.get('/', notificationsController.getMyNotifications);
router.patch('/read-all', notificationsController.markAllNotificationsRead);
router.patch('/:id/read', notificationsController.markNotificationRead);

export default router;
