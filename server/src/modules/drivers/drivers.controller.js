import Driver from './drivers.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export const getMyDriverProfile = async (req, res, next) => {
  try {
    let driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      driver = await Driver.create({ userId: req.user._id });
    }
    res.status(200).json({ status: 'success', data: { driver } });
  } catch (error) {
    next(error);
  }
};

export const updateMyDriverProfile = async (req, res, next) => {
  try {
    const { dateOfBirth, address, experienceYears, skills, preferredLocations, availabilityStatus } = req.body;
    let driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) {
      driver = new Driver({
        userId: req.user._id,
        dateOfBirth,
        address,
        experienceYears,
        skills,
        preferredLocations,
        availabilityStatus,
      });
    } else {
      if (dateOfBirth !== undefined) driver.dateOfBirth = dateOfBirth;
      if (address !== undefined) driver.address = address;
      if (experienceYears !== undefined) driver.experienceYears = experienceYears;
      if (skills !== undefined) driver.skills = skills;
      if (preferredLocations !== undefined) driver.preferredLocations = preferredLocations;
      if (availabilityStatus !== undefined) driver.availabilityStatus = availabilityStatus;
    }
    await driver.save();
    res.status(200).json({ status: 'success', message: 'Driver profile updated', data: { driver } });
  } catch (error) {
    next(error);
  }
};
