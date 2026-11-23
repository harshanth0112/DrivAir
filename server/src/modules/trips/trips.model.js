import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    startLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    endLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    lastKnownLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      speed: Number,
      heading: Number,
      recordedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

tripSchema.index({ companyId: 1, status: 1 });
tripSchema.index({ driverId: 1, status: 1 });
tripSchema.index({ contractId: 1, status: 1 });

// P0 Fix: Enforce single active trip per contract using partial unique index
tripSchema.index(
  { contractId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
  }
);

const Trip = mongoose.model('Trip', tripSchema);
export default Trip;
