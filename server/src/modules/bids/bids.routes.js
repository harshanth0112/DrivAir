import { Router } from 'express';
import * as bidsController from './bids.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { sensitiveActionLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.use(authenticate);

// Provider bids
router.get('/mine', authorize('driver', 'vehicleOwner'), bidsController.getMyBids);
router.patch('/:id/withdraw', sensitiveActionLimiter, authorize('driver', 'vehicleOwner'), bidsController.withdrawBid);

// Company actions on bids
router.post('/:id/shortlist', sensitiveActionLimiter, authorize('company'), bidsController.shortlistBid);
router.post('/:id/reject', sensitiveActionLimiter, authorize('company'), bidsController.rejectBid);
router.post('/:id/accept', sensitiveActionLimiter, authorize('company'), bidsController.acceptBidAndCreateContract);

export default router;
