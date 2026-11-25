import mongoose from 'mongoose';

export const SERVICE_CATEGORIES = [
  'oneWay',
  'roundTrip',
  'multiDay',
  'localRental',
  'staffTransport',
  'corporateTransport',
  'goodsTransport',
  'recurringDaily',
  'contractWeeklyMonthly',
  'longTermFleet',
];

export const PRICING_MODELS = [
  'perKm',
  'perDay',
  'perSeat',
  'flatRate',
  'monthlyRate',
];

const travelListingSchema = new mongoose.Schema(
  {
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
      index: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    serviceCategory: {
      type: String,
      enum: SERVICE_CATEGORIES,
      required: true,
      index: true,
    },
    origin: {
      city: { type: String, required: true, trim: true },
      district: String,
      state: String,
      addressText: String,
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined,
      },
    },
    destination: {
      city: { type: String, required: true, trim: true },
      district: String,
      state: String,
      addressText: String,
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined,
      },
    },
    routeStops: [
      {
        stopName: { type: String, required: true },
        order: { type: Number, default: 0 },
        estimatedTime: String,
      },
    ],
    availableDates: [
      {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        isBooked: { type: Boolean, default: false },
      },
    ],
    departureTime: String,
    returnDate: Date,
    availableSeats: {
      type: Number,
      default: 1,
      min: 0,
    },
    cargoCapacityKg: {
      type: Number,
      default: 0,
      min: 0,
    },
    pricing: {
      model: {
        type: String,
        enum: PRICING_MODELS,
        default: 'perDay',
      },
      amountPaise: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      isNegotiable: {
        type: Boolean,
        default: true,
      },
    },
    listingImages: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'paused', 'booked', 'archived'],
      default: 'active',
      index: true,
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'flagged', 'suspended'],
      default: 'approved',
      index: true,
    },
  },
  { timestamps: true }
);

travelListingSchema.index({ status: 1, moderationStatus: 1, 'origin.city': 1, 'destination.city': 1 });
travelListingSchema.index({ serviceCategory: 1, status: 1 });
travelListingSchema.index({ providerId: 1, createdAt: -1 });

export const TravelListing = mongoose.model('TravelListing', travelListingSchema);
export default TravelListing;
