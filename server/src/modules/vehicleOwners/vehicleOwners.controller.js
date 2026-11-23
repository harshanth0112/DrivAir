import VehicleOwner from './vehicleOwners.model.js';

export const getMyVehicleOwnerProfile = async (req, res, next) => {
  try {
    let owner = await VehicleOwner.findOne({ userId: req.user._id });
    if (!owner) {
      owner = await VehicleOwner.create({
        userId: req.user._id,
        ownerName: req.user.fullName || 'Vehicle Owner',
      });
    }
    res.status(200).json({ status: 'success', data: { vehicleOwner: owner } });
  } catch (error) {
    next(error);
  }
};

export const updateMyVehicleOwnerProfile = async (req, res, next) => {
  try {
    const { ownerName, address } = req.body;
    let owner = await VehicleOwner.findOne({ userId: req.user._id });
    if (!owner) {
      owner = new VehicleOwner({
        userId: req.user._id,
        ownerName: ownerName || req.user.fullName || 'Vehicle Owner',
        address,
      });
    } else {
      if (ownerName !== undefined) owner.ownerName = ownerName;
      if (address !== undefined) owner.address = address;
    }
    await owner.save();
    res.status(200).json({ status: 'success', message: 'Vehicle owner profile updated', data: { vehicleOwner: owner } });
  } catch (error) {
    next(error);
  }
};
