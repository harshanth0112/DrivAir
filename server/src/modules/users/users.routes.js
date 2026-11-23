import { Router } from 'express';
import * as usersController from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { updateMeSchema } from '../auth/auth.validation.js';

const router = Router();

// GET /api/v1/users/me
router.get('/me', authenticate, usersController.getMe);

// PATCH /api/v1/users/me
router.patch('/me', authenticate, validate(updateMeSchema), usersController.updateMe);

// GET /api/v1/users/:id/public-profile
router.get('/:id/public-profile', authenticate, usersController.getPublicProfile);

export default router;
