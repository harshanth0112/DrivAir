import Trip from '../trips/trips.model.js';
import LiveLocation from './liveLocation.model.js';
import Company from '../companies/companies.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export const recordLocation = async (req, res, next) => {
  try {
    const { tripId, latitude, longitude, accuracy = 0, speed = 0, heading = 0, recordedAt: clientTime } = req.body;
    const userId = req.user._id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }

    // 1. Strict lifecycle check: completed/cancelled trips cannot receive location updates
    if (trip.status !== 'active') {
      return next(new AppError(`Location updates rejected: Trip is already ${trip.status}`, 400));
    }

    // 2. Strict caller check: Only the assigned driver can send location updates
    if (trip.driverId.toString() !== userId.toString()) {
      return next(new AppError('Forbidden: You are not authorized to broadcast location for this trip', 403));
    }

    const recordedAt = clientTime ? new Date(clientTime) : new Date();

    // 3. Stale update protection: prevent older out-of-order packets from overwriting newer coords
    if (trip.lastKnownLocation && trip.lastKnownLocation.recordedAt) {
      const existingTime = new Date(trip.lastKnownLocation.recordedAt).getTime();
      if (recordedAt.getTime() < existingTime) {
        // Discard out-of-order stale update, return latest
        return res.status(200).json({
          status: 'success',
          message: 'Ignored stale out-of-order coordinate update',
          data: { location: trip.lastKnownLocation },
        });
      }
    }

    // 4. Update latest location on Trip document
    trip.lastKnownLocation = {
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      recordedAt,
    };
    await trip.save();

    // 5. Persist historical breadcrumb in LiveLocation collection
    const liveLoc = await LiveLocation.create({
      tripId: trip._id,
      contractId: trip.contractId,
      companyId: trip.companyId,
      driverId: trip.driverId,
      vehicleId: trip.vehicleId,
      latitude,
      longitude,
      accuracy,
      speed,
      heading,
      recordedAt,
    });

    res.status(201).json({
      status: 'success',
      data: { location: liveLoc },
    });
  } catch (error) {
    next(error);
  }
};

export const getLatestLocation = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const userId = req.user._id;
    const role = req.user.role;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }

    // Strict Access Control: only assigned driver, contract owner company, or admin
    if (role === 'driver' && trip.driverId.toString() !== userId.toString()) {
      return next(new AppError('Forbidden', 403));
    }
    if (role === 'company') {
      const company = await Company.findOne({ userId });
      if (!company || trip.companyId.toString() !== company._id.toString()) {
        return next(new AppError('Forbidden: Your company does not own this contract trip', 403));
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        tripId: trip._id,
        status: trip.status,
        lastKnownLocation: trip.lastKnownLocation,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLocationHistory = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const userId = req.user._id;
    const role = req.user.role;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }

    if (role === 'company') {
      const company = await Company.findOne({ userId });
      if (!company || trip.companyId.toString() !== company._id.toString()) {
        return next(new AppError('Forbidden: Access denied to historical route data', 403));
      }
    } else if (role === 'driver' && trip.driverId.toString() !== userId.toString()) {
      return next(new AppError('Forbidden: Access denied to historical route data', 403));
    }

    const history = await LiveLocation.find({ tripId })
      .sort({ recordedAt: 1 })
      .limit(300);

    res.status(200).json({
      status: 'success',
      results: history.length,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
};
