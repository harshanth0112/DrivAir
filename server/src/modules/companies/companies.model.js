import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    businessType: {
      type: String,
      trim: true,
    },
    address: {
      line1: String,
      line2: String,
      city: String,
      district: String,
      state: String,
      postalCode: String,
      country: { type: String, default: 'India' },
    },
    contactPerson: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: ['notSubmitted', 'pending', 'verified', 'rejected'],
      default: 'notSubmitted',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

companySchema.index({ companyName: 'text', 'address.city': 1, 'address.state': 1 });

export const Company = mongoose.model('Company', companySchema);
export default Company;
