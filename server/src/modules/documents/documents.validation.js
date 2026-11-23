import { z } from 'zod';

export const companyProfileSchema = z.object({
  companyName: z.string().min(2).max(100),
  registrationNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  businessType: z.string().optional(),
  address: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  contactPerson: z.string().optional(),
});

export const driverProfileSchema = z.object({
  dateOfBirth: z.string().datetime().optional().or(z.string()),
  address: z
    .object({
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
  experienceYears: z.number().min(0).max(60).optional(),
  skills: z.array(z.string()).optional(),
  preferredLocations: z.array(z.object({ city: z.string(), state: z.string() })).optional(),
  availabilityStatus: z.enum(['available', 'busy', 'unavailable']).optional(),
});

export const vehicleOwnerProfileSchema = z.object({
  ownerName: z.string().min(2).max(100),
  address: z
    .object({
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
});

export const vehicleSchema = z.object({
  vehicleNumber: z.string().min(3).max(20),
  vehicleType: z.string().min(2),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  manufactureYear: z.number().min(1980).max(2035).optional(),
  capacity: z
    .object({
      value: z.number().min(0),
      unit: z.string().optional(),
    })
    .optional(),
  fuelType: z.string().optional(),
  description: z.string().optional(),
  photos: z.array(z.string()).optional(),
  availabilityStatus: z.enum(['available', 'booked', 'unavailable']).optional(),
});

export const uploadDirectFileSchema = z.object({
  ownerType: z.enum(['company', 'driver', 'vehicleOwner', 'vehicle']),
  documentType: z.string().min(2).max(100),
  documentNumber: z.string().max(100).optional(),
  vehicleId: z.string().optional(),
});

export const uploadDocumentSchema = z.object({
  ownerType: z.enum(['company', 'driver', 'vehicleOwner', 'vehicle']),
  vehicleId: z.string().optional(),
  documentType: z.string().min(2),
  documentNumber: z.string().optional(),
  storageProvider: z.enum(['cloudinary', 's3', 'local', 'other']).optional(),
  storageKey: z.string().min(1),
  secureUrl: z.string().url(),
  originalFileName: z.string().optional(),
  mimeType: z.string().optional(),
  fileSizeBytes: z.number().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  issuingAuthority: z.string().optional(),
});

export const verifyDocumentSchema = z.object({
  status: z.enum(['verified', 'rejected', 'resubmissionRequired']),
  rejectionReason: z.string().optional(),
});
