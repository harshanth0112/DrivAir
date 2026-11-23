import { z } from 'zod';

export const createContractPostSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
    description: z.string().trim().min(5, 'Description must be at least 5 characters'),
    serviceCategory: z.string().default('Transport'),
    providerTypes: z.array(z.enum(['driver', 'vehicleOwner'])).default(['driver']),
    vehicleCategory: z.string().optional(),
    requiredDrivers: z.number().int().min(0).default(1),
    requiredVehicles: z.number().int().min(0).default(0),
    location: z
      .object({
        city: z.string().optional().default('Pan-India'),
        district: z.string().optional(),
        state: z.string().optional(),
        postalCode: z.string().optional(),
        addressText: z.string().optional(),
      })
      .optional()
      .default({ city: 'Pan-India' }),
    contractType: z.enum(['weekly', 'monthly', 'yearly', 'custom']).default('monthly'),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budget: z
      .object({
        minAmountPaise: z.number().int().min(0).optional(),
        maxAmountPaise: z.number().int().min(0).optional().default(0),
        currency: z.string().default('INR'),
        pricePeriod: z.enum(['weekly', 'monthly', 'yearly', 'total']).default('monthly'),
      })
      .optional()
      .default({ maxAmountPaise: 0, currency: 'INR', pricePeriod: 'monthly' }),
    requirements: z
      .object({
        minimumExperienceYears: z.number().min(0).optional(),
        licenceCategories: z.array(z.string()).optional(),
        vehicleTypes: z.array(z.string()).optional(),
        minimumCapacity: z.number().optional(),
        requiredDocumentTypes: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
      .optional(),
    applicationDeadline: z.string().optional(),
  })
  .refine(
    (data) => {
      // Must require at least 1 driver or 1 vehicle
      const totalPositions = (data.requiredDrivers ?? 1) + (data.requiredVehicles ?? 0);
      return totalPositions >= 1;
    },
    { message: 'Tender must require at least 1 driver or 1 vehicle position', path: ['requiredDrivers'] }
  )
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    { message: 'Start date cannot be after end date', path: ['endDate'] }
  )
  .refine(
    (data) => {
      if (data.applicationDeadline) {
        // Deadline cannot be in the past
        return new Date(data.applicationDeadline).getTime() > Date.now() - 60000;
      }
      return true;
    },
    { message: 'Application deadline cannot be in the past', path: ['applicationDeadline'] }
  );

export const submitBidSchema = z.object({
  vehicleId: z.string().optional(),
  proposedAmountPaise: z.number().int().min(1, 'Proposed amount must be greater than zero'),
  pricePeriod: z.enum(['weekly', 'monthly', 'yearly', 'total']).default('monthly'),
  proposalMessage: z.string().trim().min(1, 'Proposal message cannot be empty').max(2000),
});
