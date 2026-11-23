import Bid from './bids.model.js';
import ContractPost from '../marketplace/marketplace.model.js';
import Company from '../companies/companies.model.js';
import Contract from '../contracts/contracts.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import { acceptBidAndCreateContractService } from './bids.service.js';
import { createNotification } from '../notifications/notifications.service.js';

export const submitBid = async (req, res, next) => {
  try {
    // 1. Verify active provider status
    if (req.user.accountStatus !== 'active') {
      return next(new AppError('Your account is not active. Bidding is disabled.', 403));
    }

    const post = await ContractPost.findById(req.params.id);
    if (!post) {
      return next(new AppError('Contract post not found', 404));
    }

    // 2. Reject bidding on own company's tender
    const userCompany = await Company.findOne({ userId: req.user._id });
    if (
      post.createdBy.toString() === req.user._id.toString() ||
      (userCompany && post.companyId.toString() === userCompany._id.toString())
    ) {
      return next(new AppError('Forbidden: You cannot bid on your own company tender', 403));
    }

    // 3. Verify tender is open
    if (post.status !== 'open' && post.status !== 'partiallyAwarded') {
      return next(new AppError(`Cannot bid on a post with status: ${post.status}`, 400));
    }

    // 4. Verify deadline
    if (post.applicationDeadline && new Date().getTime() > new Date(post.applicationDeadline).getTime()) {
      return next(new AppError('Application deadline has passed', 400));
    }

    // 5. Check existing bid
    const existingBid = await Bid.findOne({ contractPostId: post._id, bidderId: req.user._id });
    if (existingBid) {
      return next(new AppError('You have already submitted a bid for this contract post', 409));
    }

    const bid = await Bid.create({
      contractPostId: post._id,
      bidderId: req.user._id,
      bidderType: req.user.role,
      vehicleId: req.body.vehicleId,
      proposedAmountPaise: req.body.proposedAmountPaise,
      pricePeriod: req.body.pricePeriod,
      proposalMessage: req.body.proposalMessage,
      status: 'pending',
    });

    // Notify company that a new bid has arrived
    if (post.createdBy) {
      createNotification({
        userId: post.createdBy,
        type: 'bidReceived',
        title: 'New bid received',
        message: `A new bid of ₹${(bid.proposedAmountPaise / 100).toFixed(2)} was submitted for "${post.title}".`,
        relatedType: 'Bid',
        relatedId: bid._id,
      }).catch((e) => console.error('[Notifications] submitBid dispatch failed:', e.message));
    }

    res.status(201).json({ status: 'success', message: 'Bid submitted successfully', data: { bid } });
  } catch (error) {
    if (error.code === 11000) {
      return next(new AppError('You have already submitted a bid for this contract post', 409));
    }
    next(error);
  }
};

export const withdrawBid = async (req, res, next) => {
  try {
    const bid = await Bid.findOne({ _id: req.params.id, bidderId: req.user._id });
    if (!bid) {
      return next(new AppError('Bid not found or access denied', 404));
    }

    if (bid.status === 'accepted') {
      return next(new AppError('Cannot withdraw a bid that has already been accepted into a contract', 400));
    }

    if (bid.status === 'withdrawn') {
      return res.status(200).json({ status: 'success', message: 'Bid is already withdrawn', data: { bid } });
    }

    bid.status = 'withdrawn';
    await bid.save();

    res.status(200).json({ status: 'success', message: 'Bid withdrawn successfully', data: { bid } });
  } catch (error) {
    next(error);
  }
};

export const getBidsForPost = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    const post = await ContractPost.findOne({ _id: req.params.id, companyId: company?._id });

    if (!post) {
      return next(new AppError('Unauthorized: Only owning company can view bids for this post', 403));
    }

    const bids = await Bid.find({ contractPostId: post._id })
      .populate('bidderId', 'fullName email phone role')
      .populate('vehicleId', 'vehicleNumber vehicleType capacity')
      .sort({ proposedAmountPaise: 1 });

    res.status(200).json({ status: 'success', results: bids.length, data: { bids } });
  } catch (error) {
    next(error);
  }
};

export const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ bidderId: req.user._id })
      .populate({
        path: 'contractPostId',
        populate: { path: 'companyId', select: 'companyName' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', results: bids.length, data: { bids } });
  } catch (error) {
    next(error);
  }
};

export const shortlistBid = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    const bid = await Bid.findById(req.params.id).populate('contractPostId');

    if (!bid || bid.contractPostId.companyId.toString() !== company?._id.toString()) {
      return next(new AppError('Unauthorized or bid not found', 403));
    }

    if (['accepted', 'rejected', 'withdrawn'].includes(bid.status)) {
      return next(new AppError(`Cannot shortlist a bid with status "${bid.status}"`, 400));
    }

    bid.status = 'shortlisted';
    await bid.save();
    res.status(200).json({ status: 'success', message: 'Bid shortlisted', data: { bid } });
  } catch (error) {
    next(error);
  }
};

export const rejectBid = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    const bid = await Bid.findById(req.params.id).populate('contractPostId');

    if (!bid || bid.contractPostId.companyId.toString() !== company?._id.toString()) {
      return next(new AppError('Unauthorized or bid not found', 403));
    }

    if (bid.status === 'accepted') {
      return next(new AppError('Cannot reject a bid that has already been accepted', 400));
    }

    bid.status = 'rejected';
    await bid.save();

    // Notify bidder
    createNotification({
      userId: bid.bidderId,
      type: 'bidRejected',
      title: 'Bid Update',
      message: `Your bid on "${bid.contractPostId.title}" was not selected.`,
      relatedType: 'Bid',
      relatedId: bid._id,
    }).catch((e) => console.error('[Notifications] rejectBid dispatch failed:', e.message));

    res.status(200).json({ status: 'success', message: 'Bid rejected', data: { bid } });
  } catch (error) {
    next(error);
  }
};

export const acceptBidAndCreateContract = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    const { contract, bid } = await acceptBidAndCreateContractService(req.params.id, company);

    res.status(201).json({
      status: 'success',
      message: 'Bid accepted and contract created successfully',
      data: { contract, bid },
    });
  } catch (error) {
    next(error);
  }
};
