import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    contractPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContractPost',
      required: true,
      index: true,
    },
    bidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bidderType: {
      type: String,
      enum: ['driver', 'vehicleOwner'],
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    proposedAmountPaise: {
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
    proposalMessage: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'negotiating', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: Date,
  },
  { timestamps: true }
);

bidSchema.index({ contractPostId: 1, bidderId: 1 }, { unique: true });
bidSchema.index({ contractPostId: 1, status: 1, proposedAmountPaise: 1 });
bidSchema.index({ bidderId: 1, status: 1, submittedAt: -1 });

export const Bid = mongoose.model('Bid', bidSchema);
export default Bid;
