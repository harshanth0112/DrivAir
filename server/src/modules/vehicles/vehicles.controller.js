import Vehicle from './vehicles.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create({
      ownerId: req.user._id,
      ...req.body,
    });
    res.status(201).json({ status: 'success', data: { vehicle } });
  } catch (error) {
    next(error);
  }
};

export const getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ ownerId: req.user._id });
    res.status(200).json({ status: 'success', results: vehicles.length, data: { vehicles } });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!vehicle) {
      return next(new AppError('Vehicle not found or unauthorized to update', 404));
    }
    Object.assign(vehicle, req.body);
    await vehicle.save();
    res.status(200).json({ status: 'success', data: { vehicle } });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!vehicle) {
      return next(new AppError('Vehicle not found or unauthorized to delete', 404));
    }
    res.status(200).json({ status: 'success', message: 'Vehicle deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const searchVehicles = async (req, res, next) => {
  try {
    const { vehicleType, city, status } = req.query;
    const filter = {};
    if (vehicleType) filter.vehicleType = vehicleType;
    if (status) filter.availabilityStatus = status;

    const vehicles = await Vehicle.find(filter).populate('ownerId', 'fullName email phone');
    res.status(200).json({ status: 'success', results: vehicles.length, data: { vehicles } });
  } catch (error) {
    next(error);
  }
};
