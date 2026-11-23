import Company from './companies.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export const getMyCompany = async (req, res, next) => {
  try {
    let company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      company = await Company.create({
        userId: req.user._id,
        companyName: req.user.fullName || 'New Company',
      });
    }
    res.status(200).json({ status: 'success', data: { company } });
  } catch (error) {
    next(error);
  }
};

export const updateMyCompany = async (req, res, next) => {
  try {
    const { companyName, registrationNumber, gstNumber, businessType, address, contactPerson } = req.body;
    let company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      company = new Company({
        userId: req.user._id,
        companyName: companyName || req.user.fullName || 'New Company',
        registrationNumber,
        gstNumber,
        businessType,
        address,
        contactPerson,
      });
    } else {
      if (companyName !== undefined) company.companyName = companyName;
      if (registrationNumber !== undefined) company.registrationNumber = registrationNumber;
      if (gstNumber !== undefined) company.gstNumber = gstNumber;
      if (businessType !== undefined) company.businessType = businessType;
      if (address !== undefined) company.address = address;
      if (contactPerson !== undefined) company.contactPerson = contactPerson;
    }
    await company.save();
    res.status(200).json({ status: 'success', message: 'Company profile updated', data: { company } });
  } catch (error) {
    next(error);
  }
};
