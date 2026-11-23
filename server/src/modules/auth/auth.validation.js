import { z } from 'zod';

export const syncUserSchema = z.object({
  role: z.enum(['company', 'driver', 'vehicleOwner']).optional(),
  // Allow empty string or missing — user may not set fullName at registration time
  fullName: z.string().max(100).optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  profileImage: z.string().url().optional().or(z.literal('')),
});

export const updateMeSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().optional().or(z.literal('')),
  profileImage: z.string().url().optional().or(z.literal('')),
});
