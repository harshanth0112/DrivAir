import mongoose from 'mongoose';

export const VEHICLE_CATEGORIES = [
  'hatchback',
  'sedan',
  'suv',
  'tempoTraveller',
  'van',
  'miniBus',
  'bus',
  'goodsCarrier',
  'pickupTruck',
  'lorry',
  'other',
];

const vehicleSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    vehicleType: {
      type: String,
      required: true, // e.g., car, taxi, bus, truck, hatchback, sedan, suv, etc.
      trim: true,
    },
    category: {
      type: String,
      enum: VEHICLE_CATEGORIES,
      default: 'other',
      index: true,
    },
    manufacturer: String,
    model: String,
    manufactureYear: Number,
    seatingCapacity: {
      type: Number,
      default: 1,
      min: 1,
    },
    cargoCapacityKg: {
      type: Number,
      default: 0,
      min: 0,
    },
    capacity: {
      value: Number,
      unit: { type: String, default: 'tons' }, // backwards compatibility
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'cng', 'electric', 'hybrid', 'other'],
      default: 'diesel',
    },
    isAirConditioned: {
      type: Boolean,
      default: false,
    },
    description: String,
    photos: [{ type: String }],
    registration: {
      rcNumber: String,
      issuingState: String,
      registrationDate: Date,
    },
    // Document references for verified compliance
    rcDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    commercialPermitDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    insuranceDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    fitnessCertificateDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
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
    operationalStatus: {
      type: String,
      enum: ['active', 'maintenance', 'decommissioned'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Masked registration number helper
vehicleSchema.methods.getMaskedVehicleNumber = function () {
  if (!this.vehicleNumber) return '';
  const clean = this.vehicleNumber.replace(/\s+/g, '');
  if (clean.length <= 4) return '****';
  const prefix = clean.slice(0, 4);
  const suffix = clean.slice(-2);
  return `${prefix}-**-${suffix}`;
};

vehicleSchema.index({ vehicleType: 1, availabilityStatus: 1, verificationStatus: 1 });
vehicleSchema.index({ category: 1, availabilityStatus: 1, verificationStatus: 1 });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
