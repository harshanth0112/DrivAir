import { Router } from 'express';
import * as companiesController from './companies.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { companyProfileSchema } from '../documents/documents.validation.js';

const router = Router();

router.use(authenticate);

// GET /api/v1/companies/me
router.get('/me', authorize('company', 'admin'), companiesController.getMyCompany);

// PUT /api/v1/companies/me
router.put('/me', authorize('company'), validate(companyProfileSchema), companiesController.updateMyCompany);

export default router;
