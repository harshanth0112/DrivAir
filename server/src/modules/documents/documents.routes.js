import { Router } from 'express';
import * as documentsController from './documents.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { fileUploadLimiter } from '../../middleware/rateLimiter.js';
import { uploadDirectFileSchema, uploadDocumentSchema, verifyDocumentSchema } from './documents.validation.js';

const router = Router();

router.use(authenticate);

// Direct File Upload from device (PDF, PNG, JPG) via Multer + Cloudinary
router.post(
  '/upload-file',
  fileUploadLimiter,
  documentsController.uploadMiddleware,
  validate(uploadDirectFileSchema),
  documentsController.uploadDirectFile
);

// Metadata URL upload (legacy / manual)
router.post('/upload', validate(uploadDocumentSchema), documentsController.uploadDocumentRecord);

// Get user documents & inspect
router.get('/mine', documentsController.getMyDocuments);
router.get('/:id/access', documentsController.getDocumentAccess);

// Admin verification queue & actions
router.get('/admin/queue', authorize('admin'), documentsController.getAdminVerificationQueue);
router.patch('/admin/:id/verify', authorize('admin'), validate(verifyDocumentSchema), documentsController.verifyDocument);

export default router;
