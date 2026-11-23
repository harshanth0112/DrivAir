import { z } from 'zod';

export const createConversationSchema = z.object({
  recipientId: z.string().min(1),
  recipientRole: z.enum(['company', 'driver', 'vehicleOwner', 'admin']),
  contextType: z.enum(['direct', 'contractPost', 'bid', 'directHire', 'contract']).default('direct'),
  contextId: z.string().optional(),
});

export const sendMessageSchema = z.object({
  messageText: z.string().min(1).max(2000),
  messageType: z.enum(['text', 'image', 'file', 'offer', 'system']).default('text'),
});
