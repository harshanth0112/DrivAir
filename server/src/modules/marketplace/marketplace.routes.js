import { Router } from 'express';
import * as marketplaceController from './marketplace.controller.js';
import * as bidsController from '../bids/bids.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { sensitiveActionLimiter } from '../../middleware/rateLimiter.js';
import { createContractPostSchema, submitBidSchema } from './marketplace.validation.js';

const router = Router();

router.use(authenticate);

// Public / browse posts
router.get('/', marketplaceController.getBrowsePosts);
router.get('/mine', authorize('company'), marketplaceController.getMyCompanyPosts);
router.get('/:id', marketplaceController.getPostDetails);

// Company manage posts
router.post('/', sensitiveActionLimiter, authorize('company'), validate(createContractPostSchema), marketplaceController.createPost);
router.post('/:id/publish', sensitiveActionLimiter, authorize('company'), marketplaceController.publishPost);
router.post('/:id/close', sensitiveActionLimiter, authorize('company'), marketplaceController.closePost);
router.post('/:id/cancel', sensitiveActionLimiter, authorize('company'), marketplaceController.cancelPost);

// Post bids
router.post('/:id/bids', sensitiveActionLimiter, authorize('driver', 'vehicleOwner'), validate(submitBidSchema), bidsController.submitBid);
router.get('/:id/bids', authorize('company'), bidsController.getBidsForPost);

export default router;
