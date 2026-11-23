/**
 * Bids Service
 * Business logic for the bidding and transactional/concurrency-protected acceptance workflow.
 */

import mongoose from 'mongoose';
import Bid from './bids.model.js';
import ContractPost from '../marketplace/marketplace.model.js';
import Contract from '../contracts/contracts.model.js';
import { generateCanonicalContractNumber } from '../contracts/contracts.service.js';
import { createNotifications } from '../notifications/notifications.service.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * Helper to check whether MongoDB connection supports multi-document transactions.
 * Returns true only if the connection is part of a replica set or mongos.
 */
export const isReplicaSetSupported = () => {
  try {
    const topology = mongoose.connection?.client?.topology;
    if (!topology) return false;
    const desc = topology.description;
    return desc && (desc.type === 'ReplicaSetWithPrimary' || desc.type === 'Sharded');
  } catch {
    return false;
  }
};

/**
 * Accept a bid and atomically create the resulting canonical contract with concurrency control.
 *
 * Concurrency protection:
 * 1. Uses conditional atomic findOneAndUpdate on ContractPost to claim an award position.
 *    If two concurrent requests attempt to award the last position, only one succeeds.
 * 2. Uses conditional atomic findOneAndUpdate on Bid to ensure only one request transitions status to 'accepted'.
 * 3. Enforces unique constraint on Contract.sourceBidId.
 * 4. Rolls back bid & post states cleanly if contract creation fails.
 * 5. If running on a MongoDB Replica Set, encapsulates in a multi-document session transaction.
 *
 * @param {string} bidId     - The bid document _id
 * @param {object} company   - The authorised company document (populated from req.user)
 * @returns {Promise<{ contract: object, bid: object }>}
 */
export const acceptBidAndCreateContractService = async (bidId, company) => {
  // First load bid to verify existence and company ownership
  const targetBid = await Bid.findById(bidId).populate('contractPostId');
  if (!targetBid) {
    throw new AppError('Bid not found', 404);
  }

  const post = targetBid.contractPostId;
  if (!post) {
    throw new AppError('Associated contract post not found', 404);
  }

  if (post.companyId.toString() !== company._id.toString()) {
    throw new AppError('Unauthorized: bid does not belong to your company', 403);
  }

  if (targetBid.status === 'accepted') {
    throw new AppError('This bid has already been accepted', 400);
  }

  if (targetBid.status === 'withdrawn' || targetBid.status === 'rejected') {
    throw new AppError(`Cannot accept a bid with status "${targetBid.status}"`, 400);
  }

  const maxPositions = (post.requiredDrivers || 1) + (post.requiredVehicles || 0);

  // Check if transactions are available
  const canUseTx = isReplicaSetSupported();
  let session = null;

  if (canUseTx) {
    session = await mongoose.startSession();
    session.startTransaction();
  }

  const opts = session ? { session } : {};

  try {
    // 1. Atomic conditional claim of position on ContractPost
    // Only succeeds if current awardedBidIds length is less than maxPositions
    const updatedPost = await ContractPost.findOneAndUpdate(
      {
        _id: post._id,
        status: { $in: ['open', 'partiallyAwarded'] },
        $expr: { $lt: [{ $size: '$awardedBidIds' }, maxPositions] },
        awardedBidIds: { $ne: targetBid._id },
      },
      {
        $push: { awardedBidIds: targetBid._id },
      },
      { new: true, ...opts }
    );

    if (!updatedPost) {
      throw new AppError(
        'All available positions for this contract have already been awarded or tender is not available',
        409
      );
    }

    // Set post status to awarded if filled, else partiallyAwarded
    const newPostStatus = updatedPost.awardedBidIds.length >= maxPositions ? 'awarded' : 'partiallyAwarded';
    updatedPost.status = newPostStatus;
    await updatedPost.save(opts);

    // 2. Atomic conditional claim of Bid
    // Only transitions if status was not already accepted
    const updatedBid = await Bid.findOneAndUpdate(
      {
        _id: targetBid._id,
        status: { $in: ['pending', 'shortlisted', 'negotiating'] },
      },
      {
        $set: {
          status: 'accepted',
          acceptedAt: new Date(),
        },
      },
      { new: true, ...opts }
    );

    if (!updatedBid) {
      // Revert post claim if bid could not be claimed
      await ContractPost.updateOne(
        { _id: post._id },
        { $pull: { awardedBidIds: targetBid._id } },
        opts
      );
      throw new AppError('Bid is no longer in an acceptable state or was already accepted', 409);
    }

    // 3. Create Canonical Contract
    const contractNumber = generateCanonicalContractNumber('bid');
    let contract;
    try {
      const createdContracts = await Contract.create(
        [
          {
            contractNumber,
            sourceType: 'bid',
            sourceBidId: updatedBid._id,
            companyId: company._id,
            providerId: updatedBid.bidderId,
            providerType: updatedBid.bidderType,
            vehicleId: updatedBid.vehicleId,
            title: post.title,
            description: post.description,
            location: post.location,
            contractType: post.contractType,
            startDate: post.startDate,
            endDate: post.endDate,
            agreedAmountPaise: updatedBid.proposedAmountPaise,
            pricePeriod: updatedBid.pricePeriod,
            status: 'active',
            acceptedAt: new Date(),
          },
        ],
        opts
      );
      contract = createdContracts[0];
    } catch (contractErr) {
      // Duplicate key on sourceBidId or other constraint failure: rollback
      if (!session) {
        // Fallback compensation for non-transactional standalone mode
        await Bid.updateOne({ _id: targetBid._id }, { $set: { status: targetBid.status, acceptedAt: null } });
        await ContractPost.updateOne({ _id: post._id }, { $pull: { awardedBidIds: targetBid._id }, status: post.status });
      }
      if (contractErr.code === 11000) {
        throw new AppError('A canonical contract for this bid has already been created', 409);
      }
      throw contractErr;
    }

    if (session) {
      await session.commitTransaction();
    }

    // 4. Notifications sent ONLY after successful commit
    createNotifications([
      {
        userId: updatedBid.bidderId,
        type: 'bidAccepted',
        title: 'Your bid was accepted!',
        message: `Your bid for "${post.title}" has been accepted. Contract ${contract.contractNumber} is now active.`,
        relatedType: 'Contract',
        relatedId: contract._id,
      },
      {
        userId: company.userId || company._id,
        type: 'contractCreated',
        title: 'Contract created',
        message: `Contract "${contract.contractNumber}" was created from an accepted bid on "${post.title}".`,
        relatedType: 'Contract',
        relatedId: contract._id,
      },
    ]).catch((e) => console.error('[Notifications] Dispatch failed:', e.message));

    return { contract, bid: updatedBid };
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {
        /* ignore abort errors */
      }
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};
