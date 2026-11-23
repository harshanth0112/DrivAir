import mongoose from 'mongoose';

const contractRequestSchema = new mongoose.Schema(
  {
    requestType: {
      type: String,
      default: 'directHire',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    providerType: {
      type: String,
      enum: ['driver', 'vehicleOwner'],
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    location: {
      city: String,
      district: String,
      state: String,
      addressText: String,
    },
    contractType: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly', 'custom'],
      default: 'monthly',
    },
    startDate: Date,
    endDate: Date,
    offeredAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    pricePeriod: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly', 'total'],
      default: 'monthly',
    },
    status: {
      type: String,
      enum: ['pending', 'negotiating', 'accepted', 'rejected', 'withdrawn', 'expired'],
      default: 'pending',
      index: true,
    },
    responseMessage: String,
    respondedAt: Date,
  },
  { timestamps: true }
);

contractRequestSchema.index({ providerId: 1, status: 1, createdAt: -1 });
contractRequestSchema.index({ companyId: 1, status: 1, createdAt: -1 });

export const ContractRequest = mongoose.model('ContractRequest', contractRequestSchema);
export default ContractRequest;
