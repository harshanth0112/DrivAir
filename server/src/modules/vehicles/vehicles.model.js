import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
    },
    vehicleType: {
      type: String,
      required: true, // e.g., car, taxi, bus, truck
      trim: true,
    },
    manufacturer: String,
    model: String,
    manufactureYear: Number,
    capacity: {
      value: Number,
      unit: { type: String, default: 'tons' }, // or 'seats'
    },
    fuelType: String,
    description: String,
    photos: [{ type: String }],
    registration: {
      rcNumber: String,
      issuingState: String,
      registrationDate: Date,
    },
    availabilityStatus: {
      type: String,
      enum: ['available', 'booked', 'unavailable'],
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

vehicleSchema.index({ vehicleType: 1, availabilityStatus: 1, verificationStatus: 1 });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
