import mongoose from 'mongoose';

const vehicleOwnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    ownerName: {
      type: String,
      trim: true,
    },
    address: {
      city: String,
      district: String,
      state: String,
      postalCode: String,
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

export const VehicleOwner = mongoose.model('VehicleOwner', vehicleOwnerSchema);
export default VehicleOwner;
