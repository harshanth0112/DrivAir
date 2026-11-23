import { Router } from 'express';
import * as directHiringController from './directHiring.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { sensitiveActionLimiter } from '../../middleware/rateLimiter.js';
import {
  createDirectOfferSchema,
  respondDirectOfferSchema,
  counterDirectOfferSchema,
} from './directHiring.validation.js';

const router = Router();

router.use(authenticate);

// Provider discovery for companies
router.get('/providers/search', authorize('company', 'admin'), directHiringController.searchProviders);

// Direct offers
router.post('/offers', sensitiveActionLimiter, authorize('company'), validate(createDirectOfferSchema), directHiringController.createDirectOffer);
router.get('/offers/sent', authorize('company'), directHiringController.getSentOffers);
router.get('/offers/received', authorize('driver', 'vehicleOwner'), directHiringController.getReceivedOffers);

// Provider actions
router.post('/offers/:id/accept', sensitiveActionLimiter, authorize('driver', 'vehicleOwner'), validate(respondDirectOfferSchema), directHiringController.acceptDirectOffer);
router.post('/offers/:id/reject', sensitiveActionLimiter, authorize('driver', 'vehicleOwner'), validate(respondDirectOfferSchema), directHiringController.rejectDirectOffer);
router.post('/offers/:id/counter', sensitiveActionLimiter, validate(counterDirectOfferSchema), directHiringController.counterDirectOffer);

export default router;
