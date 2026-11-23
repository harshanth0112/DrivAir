import mongoose from 'mongoose';

const contractPostSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    serviceCategory: {
      type: String,
      required: true,
      index: true,
    },
    providerTypes: {
      type: [String],
      enum: ['driver', 'vehicleOwner'],
      default: ['driver'],
    },
    vehicleCategory: String,
    requiredDrivers: {
      type: Number,
      default: 1,
      min: 1,
    },
    requiredVehicles: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      city: String,
      district: String,
      state: String,
      postalCode: String,
      addressText: String,
    },
    contractType: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly', 'custom'],
      default: 'monthly',
    },
    startDate: Date,
    endDate: Date,
    budget: {
      minAmountPaise: { type: Number, min: 0 },
      maxAmountPaise: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' },
      pricePeriod: {
        type: String,
        enum: ['weekly', 'monthly', 'yearly', 'total'],
        default: 'monthly',
      },
    },
    requirements: {
      minimumExperienceYears: { type: Number, default: 0 },
      licenceCategories: [String],
      vehicleTypes: [String],
      minimumCapacity: Number,
      requiredDocumentTypes: [String],
      notes: String,
    },
    applicationDeadline: {
      type: Date,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'partiallyAwarded', 'awarded', 'closed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    awardedBidIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid',
      },
    ],
  },
  { timestamps: true }
);

contractPostSchema.index({ status: 1, applicationDeadline: 1 });
contractPostSchema.index({ companyId: 1, createdAt: -1 });
contractPostSchema.index({ serviceCategory: 1, 'location.city': 1, 'location.state': 1, status: 1 });

export const ContractPost = mongoose.model('ContractPost', contractPostSchema);
export default ContractPost;
