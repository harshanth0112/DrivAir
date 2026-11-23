import Trip from './trips.model.js';
import Contract from '../contracts/contracts.model.js';
import Company from '../companies/companies.model.js';
import LiveLocation from '../tracking/liveLocation.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export const startTrip = async (req, res, next) => {
  try {
    const { contractId, startLocation } = req.body;
    const userId = req.user._id;

    // 1. Fetch Contract and ensure it exists and is active
    const contract = await Contract.findById(contractId);
    if (!contract) {
      return next(new AppError('Contract not found', 404));
    }

    if (contract.status !== 'active') {
      return next(new AppError('Trips can only be started for active contracts', 400));
    }

    // 2. Strict authorization: Ensure user is the assigned provider
    if (contract.providerId.toString() !== userId.toString()) {
      return next(new AppError('Forbidden: You are not the assigned provider for this contract', 403));
    }

    // 3. Prevent duplicate active trips for the same contract
    const existingActive = await Trip.findOne({ contractId, status: 'active' });
    if (existingActive) {
      return res.status(200).json({
        status: 'success',
        message: 'Resumed existing active trip',
        data: { trip: existingActive },
      });
    }

    // 4. Create persistent Trip record in MongoDB
    try {
      const trip = await Trip.create({
        contractId: contract._id,
        companyId: contract.companyId,
        driverId: userId,
        vehicleId: contract.vehicleId,
        status: 'active',
        startedAt: new Date(),
        startLocation,
      });

      res.status(201).json({
        status: 'success',
        message: 'Trip started successfully',
        data: { trip },
      });
    } catch (err) {
      if (err.code === 11000) {
        // Race condition: another request created the active trip simultaneously
        const concurrentTrip = await Trip.findOne({ contractId, status: 'active' });
        return res.status(200).json({
          status: 'success',
          message: 'Resumed existing active trip',
          data: { trip: concurrentTrip },
        });
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export const endTrip = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const { endLocation } = req.body;
    const userId = req.user._id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }

    // Only the assigned driver or admin can end the trip
    const isDriver = trip.driverId.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isDriver && !isAdmin) {
      return next(new AppError('Forbidden: You cannot end this trip', 403));
    }

    if (trip.status !== 'active') {
      return next(new AppError('Trip is already ended or cancelled', 400));
    }

    trip.status = 'completed';
    trip.endedAt = new Date();
    if (endLocation) {
      trip.endLocation = endLocation;
    }
    await trip.save();

    res.status(200).json({
      status: 'success',
      message: 'Trip ended successfully',
      data: { trip },
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveTrips = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let query = { status: 'active' };

    if (role === 'driver') {
      query.driverId = userId;
    } else if (role === 'company') {
      const company = await Company.findOne({ userId });
      if (!company) {
        return res.status(200).json({ status: 'success', results: 0, data: { trips: [] } });
      }
      query.companyId = company._id;
    }

    const trips = await Trip.find(query)
      .populate('contractId', 'contractNumber title agreedAmountPaise pricePeriod')
      .populate('driverId', 'fullName email phone')
      .populate('companyId', 'companyName')
      .sort({ startedAt: -1 });

    res.status(200).json({
      status: 'success',
      results: trips.length,
      data: { trips },
    });
  } catch (error) {
    next(error);
  }
};

export const getTripById = async (req, res, next) => {
  try {
    const { tripId } = req.params;
    const userId = req.user._id;
    const role = req.user.role;

    const trip = await Trip.findById(tripId)
      .populate('contractId', 'contractNumber title location')
      .populate('driverId', 'fullName email phone')
      .populate('companyId', 'companyName');

    if (!trip) {
      return next(new AppError('Trip not found', 404));
    }

    // Access check
    if (role === 'driver' && trip.driverId._id.toString() !== userId.toString()) {
      return next(new AppError('Unauthorized', 403));
    }
    if (role === 'company') {
      const company = await Company.findOne({ userId });
      if (!company || trip.companyId._id.toString() !== company._id.toString()) {
        return next(new AppError('Unauthorized', 403));
      }
    }

    res.status(200).json({
      status: 'success',
      data: { trip },
    });
  } catch (error) {
    next(error);
  }
};

export const getTripHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let query = { status: { $in: ['completed', 'cancelled'] } };

    if (role === 'driver') {
      query.driverId = userId;
    } else if (role === 'company') {
      const company = await Company.findOne({ userId });
      if (!company) {
        return res.status(200).json({ status: 'success', results: 0, data: { trips: [] } });
      }
      query.companyId = company._id;
    }

    const trips = await Trip.find(query)
      .populate('contractId', 'contractNumber title')
      .populate('driverId', 'fullName email')
      .sort({ endedAt: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      results: trips.length,
      data: { trips },
    });
  } catch (error) {
    next(error);
  }
};
