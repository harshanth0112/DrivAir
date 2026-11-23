/**
 * Marketplace Service
 * Extracted business logic from marketplace.controller.js.
 * Provides reusable helpers for ContractPost state management with strict FSM validation.
 */

import ContractPost from './marketplace.model.js';
import Company from '../companies/companies.model.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * Find or create a Company profile for the requesting user.
 * Used by createPost and createDirectOffer to ensure a Company record exists.
 *
 * @param {object} user - req.user (the authenticated User document)
 * @returns {Promise<object>} The Company document
 */
export const getOrCreateCompanyForUser = async (user) => {
  let company = await Company.findOne({ userId: user._id });
  if (!company) {
    company = await Company.create({
      userId: user._id,
      companyName: user.fullName ? `${user.fullName} Logistics` : 'Corporate Logistics Partner',
    });
  }
  return company;
};

/**
 * Transition a ContractPost to 'open' status.
 * Validates ownership and state invariants before saving.
 *
 * @param {string} postId   - ContractPost _id
 * @param {object} company  - Authorised Company document
 * @returns {Promise<object>} Updated ContractPost
 */
export const publishContractPost = async (postId, company) => {
  const post = await ContractPost.findOne({ _id: postId, companyId: company._id });
  if (!post) throw new AppError('Contract post not found or unauthorized', 404);

  // Validate state machine: only draft posts can be published
  if (post.status !== 'draft') {
    throw new AppError(`Cannot publish a post with status "${post.status}". Only draft posts can be published.`, 400);
  }

  // Validate application deadline if present
  if (post.applicationDeadline && new Date(post.applicationDeadline).getTime() < Date.now()) {
    throw new AppError('Cannot publish tender: application deadline has already expired', 400);
  }

  post.status = 'open';
  await post.save();
  return post;
};

/**
 * Transition a ContractPost to 'closed' status.
 * Validates ownership and allowable states.
 *
 * @param {string} postId   - ContractPost _id
 * @param {object} company  - Authorised Company document
 * @returns {Promise<object>} Updated ContractPost
 */
export const closeContractPost = async (postId, company) => {
  const post = await ContractPost.findOne({ _id: postId, companyId: company._id });
  if (!post) throw new AppError('Contract post not found or unauthorized', 404);

  if (['closed', 'cancelled', 'awarded'].includes(post.status)) {
    throw new AppError(`Contract post is already in terminal state "${post.status}"`, 400);
  }

  post.status = 'closed';
  await post.save();
  return post;
};

/**
 * Cancel a ContractPost.
 * Validates ownership and terminal state guards.
 *
 * @param {string} postId   - ContractPost _id
 * @param {object} company  - Authorised Company document
 * @returns {Promise<object>} Updated ContractPost
 */
export const cancelContractPost = async (postId, company) => {
  const post = await ContractPost.findOne({ _id: postId, companyId: company._id });
  if (!post) throw new AppError('Contract post not found or unauthorized', 404);

  if (['closed', 'cancelled'].includes(post.status)) {
    throw new AppError(`Contract post is already in terminal state "${post.status}"`, 400);
  }

  post.status = 'cancelled';
  await post.save();
  return post;
};
