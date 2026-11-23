import Contract from './contracts.model.js';
import Company from '../companies/companies.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export const getMyContracts = async (req, res, next) => {
  try {
    let filter = {};
    if (req.user.role === 'company') {
      const company = await Company.findOne({ userId: req.user._id });
      if (!company) {
        return res.status(200).json({ status: 'success', results: 0, data: { contracts: [] } });
      }
      filter.companyId = company._id;
    } else {
      filter.providerId = req.user._id;
    }

    const contracts = await Contract.find(filter)
      .populate('companyId', 'companyName address contactPerson')
      .populate('providerId', 'fullName email phone role')
      .populate('vehicleId', 'vehicleNumber vehicleType')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', results: contracts.length, data: { contracts } });
  } catch (error) {
    next(error);
  }
};

export const getContractById = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('companyId', 'companyName address contactPerson')
      .populate('providerId', 'fullName email phone role')
      .populate('vehicleId', 'vehicleNumber vehicleType');

    if (!contract) {
      return next(new AppError('Contract not found', 404));
    }

    let isCompanyOwner = false;
    if (req.user.role === 'company') {
      const company = await Company.findOne({ userId: req.user._id });
      if (company && contract.companyId?._id?.toString() === company._id.toString()) {
        isCompanyOwner = true;
      }
    }

    const isProvider = contract.providerId?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCompanyOwner && !isProvider && !isAdmin) {
      return next(new AppError('Unauthorized to view this contract', 403));
    }

    res.status(200).json({ status: 'success', data: { contract } });
  } catch (error) {
    next(error);
  }
};

export const updateContractStatus = async (req, res, next) => {
  try {
    const { status, vehicleId } = req.body;
    if (status && !['active', 'completed', 'cancelled', 'terminated'].includes(status)) {
      return next(new AppError('Invalid contract status', 400));
    }

    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return next(new AppError('Contract not found', 404));
    }

    let isCompanyOwner = false;
    if (req.user.role === 'company') {
      const company = await Company.findOne({ userId: req.user._id });
      if (company && contract.companyId.toString() === company._id.toString()) {
        isCompanyOwner = true;
      }
    }

    const isProvider = contract.providerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCompanyOwner && !isProvider && !isAdmin) {
      return next(new AppError('Unauthorized to update this contract', 403));
    }

    if (status) contract.status = status;
    if (vehicleId) contract.vehicleId = vehicleId;

    await contract.save();

    res.status(200).json({
      status: 'success',
      message: `Contract updated successfully`,
      data: { contract },
    });
  } catch (error) {
    next(error);
  }
};
