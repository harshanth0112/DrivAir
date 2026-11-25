import { TravelListing, SERVICE_CATEGORIES, PRICING_MODELS } from './travelListing.model.js';
import { Vehicle } from '../vehicles/vehicles.model.js';
import { VehicleAvailability } from './vehicleAvailability.model.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * Create a new travel/vehicle listing
 */
export const createTravelListing = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      vehicleId,
      title,
      description,
      serviceCategory,
      origin,
      destination,
      routeStops,
      availableDates,
      departureTime,
      returnDate,
      availableSeats,
      cargoCapacityKg,
      pricing,
      listingImages,
    } = req.body;

    if (!['vehicleOwner', 'driver'].includes(user.role)) {
      return next(new AppError('Only vehicle owners and drivers can publish travel listings', 403));
    }

    if (!vehicleId || !title || !serviceCategory || !origin?.city || !destination?.city || !pricing?.amountPaise) {
      return next(new AppError('Missing required listing fields (vehicleId, title, serviceCategory, origin, destination, pricing)', 400));
    }

    // Verify vehicle ownership or assignment
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return next(new AppError('Vehicle not found', 404));
    }

    const isOwner = vehicle.ownerId.toString() === user._id.toString();
    const isAssignedDriver = vehicle.assignedDriverId && vehicle.assignedDriverId.toString() === user._id.toString();

    if (!isOwner && !isAssignedDriver) {
      return next(new AppError('Unauthorized: You can only publish listings for vehicles you own or are assigned to drive', 403));
    }

    const listing = await TravelListing.create({
      providerId: user._id,
      providerType: user.role,
      vehicleId,
      title,
      description,
      serviceCategory,
      origin,
      destination,
      routeStops: routeStops || [],
      availableDates: availableDates || [],
      departureTime,
      returnDate,
      availableSeats: availableSeats !== undefined ? availableSeats : (vehicle.seatingCapacity || 1),
      cargoCapacityKg: cargoCapacityKg !== undefined ? cargoCapacityKg : (vehicle.cargoCapacityKg || 0),
      pricing: {
        model: pricing.model || 'perDay',
        amountPaise: pricing.amountPaise,
        currency: pricing.currency || 'INR',
        isNegotiable: pricing.isNegotiable !== undefined ? pricing.isNegotiable : true,
      },
      listingImages: listingImages || vehicle.photos || [],
      status: 'active',
      moderationStatus: 'approved',
    });

    res.status(201).json({
      status: 'success',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Public search and browse travel listings with filters
 */
export const getTravelListings = async (req, res, next) => {
  try {
    const {
      originCity,
      destinationCity,
      serviceCategory,
      vehicleCategory,
      minSeats,
      minCargoKg,
      isAC,
      maxPricePaise,
      pricingModel,
      providerId,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      status: 'active',
      moderationStatus: 'approved',
    };

    if (providerId) {
      query.providerId = providerId;
    }

    if (originCity) {
      query['origin.city'] = { $regex: originCity, $options: 'i' };
    }

    if (destinationCity) {
      query['destination.city'] = { $regex: destinationCity, $options: 'i' };
    }

    if (serviceCategory) {
      query.serviceCategory = serviceCategory;
    }

    if (pricingModel) {
      query['pricing.model'] = pricingModel;
    }

    if (maxPricePaise) {
      query['pricing.amountPaise'] = { $lte: Number(maxPricePaise) };
    }

    if (minSeats) {
      query.availableSeats = { $gte: Number(minSeats) };
    }

    if (minCargoKg) {
      query.cargoCapacityKg = { $gte: Number(minCargoKg) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const listings = await TravelListing.find(query)
      .populate('providerId', 'fullName role email profileImage phone')
      .populate({
        path: 'vehicleId',
        select: 'vehicleNumber category vehicleType manufacturer model manufactureYear isAirConditioned seatingCapacity cargoCapacityKg photos verificationStatus operationalStatus rcDocumentId commercialPermitDocumentId insuranceDocumentId fitnessCertificateDocumentId',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await TravelListing.countDocuments(query);

    // Format safe response with masked vehicle numbers and verification badges (never raw document URLs)
    const sanitizedListings = listings.map((item) => {
      const doc = item.toObject();
      if (doc.vehicleId) {
        const rawNum = doc.vehicleId.vehicleNumber || '';
        const clean = rawNum.replace(/\s+/g, '');
        doc.vehicleId.maskedVehicleNumber = clean.length > 4 ? `${clean.slice(0, 4)}-**-${clean.slice(-2)}` : '****';
        delete doc.vehicleId.vehicleNumber; // Strip raw registration number

        // Emitting verification badges
        doc.vehicleId.badges = {
          rcVerified: !!doc.vehicleId.rcDocumentId,
          permitVerified: !!doc.vehicleId.commercialPermitDocumentId,
          insuranceVerified: !!doc.vehicleId.insuranceDocumentId,
          fitnessVerified: !!doc.vehicleId.fitnessCertificateDocumentId,
          overallVerified: doc.vehicleId.verificationStatus === 'verified',
        };

        // Remove private Document IDs
        delete doc.vehicleId.rcDocumentId;
        delete doc.vehicleId.commercialPermitDocumentId;
        delete doc.vehicleId.insuranceDocumentId;
        delete doc.vehicleId.fitnessCertificateDocumentId;
      }
      return doc;
    });

    res.status(200).json({
      status: 'success',
      results: sanitizedListings.length,
      total,
      page: Number(page),
      data: { listings: sanitizedListings },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single travel listing by ID
 */
export const getTravelListingById = async (req, res, next) => {
  try {
    const listing = await TravelListing.findById(req.params.id)
      .populate('providerId', 'fullName role email profileImage phone')
      .populate({
        path: 'vehicleId',
        select: 'vehicleNumber category vehicleType manufacturer model manufactureYear isAirConditioned seatingCapacity cargoCapacityKg photos verificationStatus operationalStatus rcDocumentId commercialPermitDocumentId insuranceDocumentId fitnessCertificateDocumentId',
      });

    if (!listing) {
      return next(new AppError('Travel listing not found', 404));
    }

    const doc = listing.toObject();
    if (doc.vehicleId) {
      const rawNum = doc.vehicleId.vehicleNumber || '';
      const clean = rawNum.replace(/\s+/g, '');
      doc.vehicleId.maskedVehicleNumber = clean.length > 4 ? `${clean.slice(0, 4)}-**-${clean.slice(-2)}` : '****';
      delete doc.vehicleId.vehicleNumber;

      doc.vehicleId.badges = {
        rcVerified: !!doc.vehicleId.rcDocumentId,
        permitVerified: !!doc.vehicleId.commercialPermitDocumentId,
        insuranceVerified: !!doc.vehicleId.insuranceDocumentId,
        fitnessVerified: !!doc.vehicleId.fitnessCertificateDocumentId,
        overallVerified: doc.vehicleId.verificationStatus === 'verified',
      };

      delete doc.vehicleId.rcDocumentId;
      delete doc.vehicleId.commercialPermitDocumentId;
      delete doc.vehicleId.insuranceDocumentId;
      delete doc.vehicleId.fitnessCertificateDocumentId;
    }

    res.status(200).json({
      status: 'success',
      data: { listing: doc },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update listing by provider
 */
export const updateTravelListing = async (req, res, next) => {
  try {
    const user = req.user;
    const listing = await TravelListing.findById(req.params.id);

    if (!listing) {
      return next(new AppError('Travel listing not found', 404));
    }

    if (listing.providerId.toString() !== user._id.toString() && user.role !== 'admin') {
      return next(new AppError('Forbidden: You can only update your own listings', 403));
    }

    const allowedUpdates = [
      'title',
      'description',
      'routeStops',
      'availableDates',
      'departureTime',
      'returnDate',
      'availableSeats',
      'cargoCapacityKg',
      'pricing',
      'listingImages',
      'status',
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    await listing.save();

    res.status(200).json({
      status: 'success',
      data: { listing },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete / Archive travel listing
 */
export const deleteTravelListing = async (req, res, next) => {
  try {
    const user = req.user;
    const listing = await TravelListing.findById(req.params.id);

    if (!listing) {
      return next(new AppError('Travel listing not found', 404));
    }

    if (listing.providerId.toString() !== user._id.toString() && user.role !== 'admin') {
      return next(new AppError('Forbidden: You can only delete your own listings', 403));
    }

    listing.status = 'archived';
    await listing.save();

    res.status(200).json({
      status: 'success',
      message: 'Travel listing successfully archived',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get listing availability schedule
 */
export const getListingAvailability = async (req, res, next) => {
  try {
    const listing = await TravelListing.findById(req.params.id);
    if (!listing) {
      return next(new AppError('Travel listing not found', 404));
    }

    const bookings = await VehicleAvailability.find({
      vehicleId: listing.vehicleId,
      status: { $in: ['reserved', 'confirmedBooking'] },
    }).select('startDate endDate status');

    res.status(200).json({
      status: 'success',
      data: {
        availableDates: listing.availableDates,
        bookedPeriods: bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};
