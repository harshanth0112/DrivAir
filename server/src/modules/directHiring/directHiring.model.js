import mongoose from 'mongoose';

const counterOfferSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposedAmountPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    proposedStartDate: Date,
    proposedEndDate: Date,
    message: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

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
    travelListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TravelListing',
      index: true,
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
    passengersCount: Number,
    cargoWeightKg: Number,
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
      enum: ['weekly', 'monthly', 'yearly', 'total', 'perKm', 'perDay', 'perSeat'],
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
    counterOffers: [counterOfferSchema],
  },
  { timestamps: true }
);

contractRequestSchema.index({ providerId: 1, status: 1, createdAt: -1 });
contractRequestSchema.index({ companyId: 1, status: 1, createdAt: -1 });
contractRequestSchema.index({ travelListingId: 1, status: 1 });

export const ContractRequest = mongoose.model('ContractRequest', contractRequestSchema);
export default ContractRequest;
