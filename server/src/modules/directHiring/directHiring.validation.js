import { z } from 'zod';

export const createDirectOfferSchema = z.object({
  providerId: z.string().min(1),
  providerType: z.enum(['driver', 'vehicleOwner']),
  vehicleId: z.string().optional(),
  title: z.string().min(5).max(150),
  description: z.string().optional(),
  location: z
    .object({
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      addressText: z.string().optional(),
    })
    .optional(),
  contractType: z.enum(['weekly', 'monthly', 'yearly', 'custom']).default('monthly'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  offeredAmountPaise: z.number().min(1),
  pricePeriod: z.enum(['weekly', 'monthly', 'yearly', 'total']).default('monthly'),
});

export const respondDirectOfferSchema = z.object({
  responseMessage: z.string().optional(),
});

export const counterDirectOfferSchema = z.object({
  counterAmountPaise: z.number().min(1),
  responseMessage: z.string().min(2),
});
