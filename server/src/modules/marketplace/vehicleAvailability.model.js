import mongoose from 'mongoose';

const vehicleAvailabilitySchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    travelListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TravelListing',
      index: true,
    },
    contractRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ContractRequest',
      index: true,
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'confirmedBooking', 'maintenance'],
      default: 'available',
      index: true,
    },
    bookedByCompanyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    notes: String,
  },
  { timestamps: true }
);

vehicleAvailabilitySchema.index({ vehicleId: 1, startDate: 1, endDate: 1, status: 1 });

/**
 * Check if a date range overlaps with any existing reserved or confirmed booking for a vehicle.
 */
vehicleAvailabilitySchema.statics.hasOverlap = async function (vehicleId, startDate, endDate, excludeId = null) {
  const query = {
    vehicleId,
    status: { $in: ['reserved', 'confirmedBooking'] },
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const conflict = await this.findOne(query);
  return !!conflict;
};

export const VehicleAvailability = mongoose.model('VehicleAvailability', vehicleAvailabilitySchema);
export default VehicleAvailability;
