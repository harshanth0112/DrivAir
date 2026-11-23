import ContractRequest from './directHiring.model.js';
import Company from '../companies/companies.model.js';
import User from '../users/users.model.js';
import Driver from '../drivers/drivers.model.js';
import VehicleOwner from '../vehicleOwners/vehicleOwners.model.js';
import Contract from '../contracts/contracts.model.js';
import mongoose from 'mongoose';
import { AppError } from '../../middleware/errorHandler.js';
import { createNotification, createNotifications } from '../notifications/notifications.service.js';
import { generateCanonicalContractNumber } from '../contracts/contracts.service.js';
import { isReplicaSetSupported } from '../bids/bids.service.js';

export const searchProviders = async (req, res, next) => {
  try {
    const { role = 'driver', city, state, experienceYears } = req.query;

    const userQuery = { role, accountStatus: 'active' };
    const users = await User.find(userQuery).select('fullName email phone profileImage role createdAt');

    // Attach profile details if driver
    let results = [];
    if (role === 'driver') {
      const driverProfiles = await Driver.find({ userId: { $in: users.map((u) => u._id) } });
      const driverMap = new Map(driverProfiles.map((d) => [d.userId.toString(), d]));

      results = users.map((u) => ({
        user: u,
        profile: driverMap.get(u._id.toString()) || null,
      }));
    } else {
      const ownerProfiles = await VehicleOwner.find({ userId: { $in: users.map((u) => u._id) } });
      const ownerMap = new Map(ownerProfiles.map((o) => [o.userId.toString(), o]));

      results = users.map((u) => ({
        user: u,
        profile: ownerMap.get(u._id.toString()) || null,
      }));
    }

    res.status(200).json({ status: 'success', results: results.length, data: { providers: results } });
  } catch (error) {
    next(error);
  }
};

export const createDirectOffer = async (req, res, next) => {
  try {
    let company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      company = await Company.create({
        userId: req.user._id,
        companyName: req.user.fullName ? `${req.user.fullName} Logistics` : 'Corporate Logistics Partner',
      });
    }

    // Verify recipient provider exists and is active
    const providerUser = await User.findById(req.body.providerId);
    if (!providerUser || providerUser.accountStatus !== 'active') {
      return next(new AppError('Provider account not found or is inactive', 400));
    }

    if (providerUser._id.toString() === req.user._id.toString()) {
      return next(new AppError('Forbidden: You cannot send a direct hiring offer to yourself', 400));
    }

    const offer = await ContractRequest.create({
      companyId: company._id,
      createdBy: req.user._id,
      ...req.body,
      status: 'pending',
    });

    // Notify provider that they received a direct hire offer
    createNotification({
      userId: req.body.providerId,
      type: 'offerReceived',
      title: 'You received a direct hire offer',
      message: `A company has sent you a direct hire offer: "${req.body.title || 'Contract Offer'}".`,
      relatedType: 'ContractRequest',
      relatedId: offer._id,
    }).catch((e) => console.error('[Notifications] createDirectOffer dispatch failed:', e.message));

    res.status(201).json({ status: 'success', message: 'Direct offer sent successfully', data: { offer } });
  } catch (error) {
    next(error);
  }
};

export const getReceivedOffers = async (req, res, next) => {
  try {
    const offers = await ContractRequest.find({ providerId: req.user._id })
      .populate('companyId', 'companyName verificationStatus address contactPerson')
      .populate('vehicleId', 'vehicleNumber vehicleType')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', results: offers.length, data: { offers } });
  } catch (error) {
    next(error);
  }
};

export const getSentOffers = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(200).json({ status: 'success', results: 0, data: { offers: [] } });
    }

    const offers = await ContractRequest.find({ companyId: company._id })
      .populate('providerId', 'fullName email phone role')
      .populate('vehicleId', 'vehicleNumber vehicleType')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', results: offers.length, data: { offers } });
  } catch (error) {
    next(error);
  }
};

export const acceptDirectOffer = async (req, res, next) => {
  try {
    // 1. Concurrency guard: Atomic conditional update
    // Only transitions status if currently pending or negotiating
    const canUseTx = isReplicaSetSupported();
    let session = null;
    if (canUseTx) {
      session = await mongoose.startSession();
      session.startTransaction();
    }
    const opts = session ? { session } : {};

    try {
      const offer = await ContractRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          providerId: req.user._id,
          status: { $in: ['pending', 'negotiating'] },
        },
        {
          $set: {
            status: 'accepted',
            respondedAt: new Date(),
            ...(req.body.responseMessage ? { responseMessage: req.body.responseMessage } : {}),
          },
        },
        { new: true, ...opts }
      ).populate('companyId');

      if (!offer) {
        // Query to provide exact diagnostic error
        const existing = await ContractRequest.findOne({ _id: req.params.id, providerId: req.user._id });
        if (!existing) {
          throw new AppError('Offer not found or unauthorized to accept', 404);
        }
        if (existing.status === 'accepted') {
          throw new AppError('This offer has already been accepted', 409);
        }
        throw new AppError(`Cannot accept offer with status: ${existing.status}`, 400);
      }

      // 2. Create canonical contract
      const contractNumber = generateCanonicalContractNumber('directHire');
      let contract;
      try {
        const createdContracts = await Contract.create(
          [
            {
              contractNumber,
              sourceType: 'directHire',
              sourceRequestId: offer._id,
              companyId: offer.companyId._id || offer.companyId,
              providerId: offer.providerId,
              providerType: offer.providerType,
              vehicleId: offer.vehicleId,
              title: offer.title,
              description: offer.description,
              location: offer.location,
              contractType: offer.contractType,
              startDate: offer.startDate,
              endDate: offer.endDate,
              agreedAmountPaise: offer.offeredAmountPaise,
              pricePeriod: offer.pricePeriod,
              status: 'active',
              acceptedAt: new Date(),
            },
          ],
          opts
        );
        contract = createdContracts[0];
      } catch (err) {
        if (!session) {
          // Compensating rollback for standalone mode
          await ContractRequest.updateOne({ _id: offer._id }, { $set: { status: 'pending', respondedAt: null } });
        }
        if (err.code === 11000) {
          throw new AppError('A canonical contract for this direct offer has already been created', 409);
        }
        throw err;
      }

      if (session) {
        await session.commitTransaction();
      }

      // Notifications after commit
      createNotifications([
        {
          userId: offer.createdBy,
          type: 'offerAccepted',
          title: 'Your direct hire offer was accepted',
          message: `Your offer "${offer.title}" was accepted. Contract ${contract.contractNumber} is now active.`,
          relatedType: 'Contract',
          relatedId: contract._id,
        },
        {
          userId: offer.providerId,
          type: 'contractCreated',
          title: 'Contract created',
          message: `You are now under contract "${contract.contractNumber}" for "${offer.title}".`,
          relatedType: 'Contract',
          relatedId: contract._id,
        },
      ]).catch((e) => console.error('[Notifications] acceptDirectOffer dispatch failed:', e.message));

      res.status(201).json({
        status: 'success',
        message: 'Direct offer accepted and contract created successfully',
        data: { contract, offer },
      });
    } catch (err) {
      if (session) {
        try { await session.abortTransaction(); } catch { /* ignore */ }
      }
      throw err;
    } finally {
      if (session) {
        session.endSession();
      }
    }
  } catch (error) {
    next(error);
  }
};

export const rejectDirectOffer = async (req, res, next) => {
  try {
    const offer = await ContractRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        providerId: req.user._id,
        status: { $in: ['pending', 'negotiating'] },
      },
      {
        $set: {
          status: 'rejected',
          respondedAt: new Date(),
          ...(req.body.responseMessage ? { responseMessage: req.body.responseMessage } : {}),
        },
      },
      { new: true }
    );

    if (!offer) {
      const existing = await ContractRequest.findOne({ _id: req.params.id, providerId: req.user._id });
      if (!existing) {
        return next(new AppError('Offer not found or unauthorized to reject', 404));
      }
      return next(new AppError(`Cannot reject offer with status: ${existing.status}`, 400));
    }

    res.status(200).json({ status: 'success', message: 'Offer rejected', data: { offer } });
  } catch (error) {
    next(error);
  }
};

export const counterDirectOffer = async (req, res, next) => {
  try {
    const offer = await ContractRequest.findById(req.params.id);
    if (!offer) {
      return next(new AppError('Offer not found', 404));
    }

    if (['accepted', 'rejected', 'withdrawn', 'expired'].includes(offer.status)) {
      return next(new AppError(`Cannot counter-offer on a request with terminal status "${offer.status}"`, 400));
    }

    const isProvider = offer.providerId.toString() === req.user._id.toString();
    const isCompanyOwner = offer.createdBy.toString() === req.user._id.toString();

    if (!isProvider && !isCompanyOwner) {
      return next(new AppError('Unauthorized to negotiate this offer', 403));
    }

    offer.status = 'negotiating';
    offer.offeredAmountPaise = req.body.counterAmountPaise;
    offer.responseMessage = req.body.responseMessage;
    offer.respondedAt = new Date();
    await offer.save();

    res.status(200).json({ status: 'success', message: 'Counter offer submitted', data: { offer } });
  } catch (error) {
    next(error);
  }
};
