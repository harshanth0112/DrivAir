import { z } from 'zod';

export const updateContractStatusSchema = z.object({
  status: z.enum(['active', 'completed', 'cancelled', 'terminated']).optional(),
  vehicleId: z.string().optional(),
});
