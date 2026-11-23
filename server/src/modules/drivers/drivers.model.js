import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    dateOfBirth: Date,
    address: {
      city: String,
      district: String,
      state: String,
      postalCode: String,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    licence: {
      number: { type: String, select: false }, // sensitive
      categories: [{ type: String }],
      issuingAuthority: String,
      issueDate: Date,
      expiryDate: Date,
    },
    skills: [{ type: String }],
    preferredLocations: [
      {
        city: String,
        state: String,
      },
    ],
    availabilityStatus: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['notSubmitted', 'pending', 'verified', 'rejected'],
      default: 'notSubmitted',
      index: true,
    },
  },
  { timestamps: true }
);

driverSchema.index({ availabilityStatus: 1, verificationStatus: 1 });
driverSchema.index({ 'address.city': 1, 'address.state': 1, experienceYears: 1 });

export const Driver = mongoose.model('Driver', driverSchema);
export default Driver;
