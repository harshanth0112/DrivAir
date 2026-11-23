import { Router } from 'express';
import * as chatController from './chat.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import { createConversationSchema, sendMessageSchema } from './chat.validation.js';

const router = Router();

router.use(authenticate);

// Conversations
router.post('/conversations', validate(createConversationSchema), chatController.getOrCreateConversation);
router.get('/conversations', chatController.getMyConversations);

// Messages
router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/conversations/:id/messages', validate(sendMessageSchema), chatController.postMessage);

export default router;
