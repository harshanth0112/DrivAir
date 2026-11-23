import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
  {
    contractNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['bid', 'directHire'],
      required: true,
    },
    sourceBidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
    },
    sourceRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContractRequest',
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
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
    agreedAmountPaise: {
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
    terms: String,
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'terminated'],
      default: 'active',
      index: true,
    },
    acceptedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

contractSchema.index({ companyId: 1, status: 1, createdAt: -1 });
contractSchema.index({ providerId: 1, status: 1, createdAt: -1 });

// P0/Phase 3 Fix: Unique partial indexes on sourceBidId and sourceRequestId
// Prevents duplicate canonical contracts from being formed for the same source bid or direct offer.
// Note: MongoDB forbids combining sparse: true with partialFilterExpression. Only partialFilterExpression is used.
contractSchema.index(
  { sourceBidId: 1 },
  { unique: true, partialFilterExpression: { sourceBidId: { $exists: true } } }
);
contractSchema.index(
  { sourceRequestId: 1 },
  { unique: true, partialFilterExpression: { sourceRequestId: { $exists: true } } }
);

export const Contract = mongoose.model('Contract', contractSchema);
export default Contract;
