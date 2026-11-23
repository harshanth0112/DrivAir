import { z } from 'zod';

export const startTripSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  startLocation: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      address: z.string().optional(),
    })
    .optional(),
});

export const endTripSchema = z.object({
  endLocation: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      address: z.string().optional(),
    })
    .optional(),
});

export const locationUpdateSchema = z.object({
  tripId: z.string().min(1, 'Trip ID is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().min(0).optional(),
  speed: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  recordedAt: z.string().datetime().optional(),
});
