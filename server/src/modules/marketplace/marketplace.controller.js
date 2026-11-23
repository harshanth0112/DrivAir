import ContractPost from './marketplace.model.js';
import Company from '../companies/companies.model.js';
import { AppError } from '../../middleware/errorHandler.js';
import {
  getOrCreateCompanyForUser,
  publishContractPost,
  closeContractPost,
  cancelContractPost,
} from './marketplace.service.js';

export const createPost = async (req, res, next) => {
  try {
    const company = await getOrCreateCompanyForUser(req.user);

    const post = await ContractPost.create({
      companyId: company._id,
      createdBy: req.user._id,
      ...req.body,
      status: 'draft',
    });

    res.status(201).json({ status: 'success', data: { post } });
  } catch (error) {
    next(error);
  }
};

export const publishPost = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    const post = await publishContractPost(req.params.id, company);

    res.status(200).json({ status: 'success', message: 'Post published to marketplace', data: { post } });
  } catch (error) {
    next(error);
  }
};

export const closePost = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    const post = await closeContractPost(req.params.id, company);

    res.status(200).json({ status: 'success', message: 'Post closed', data: { post } });
  } catch (error) {
    next(error);
  }
};

export const cancelPost = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return next(new AppError('Company profile not found', 404));
    }

    const post = await cancelContractPost(req.params.id, company);

    res.status(200).json({ status: 'success', message: 'Post cancelled', data: { post } });
  } catch (error) {
    next(error);
  }
};

export const getBrowsePosts = async (req, res, next) => {
  try {
    const { category, city, status = 'open' } = req.query;
    // Security: Only allow browsing open or partiallyAwarded tenders. Drafts must never be public.
    const allowedStatuses = ['open', 'partiallyAwarded'];
    const targetStatus = allowedStatuses.includes(status) ? status : 'open';

    const filter = { status: targetStatus };
    if (category) filter.serviceCategory = category;
    if (city) filter['location.city'] = city;

    const posts = await ContractPost.find(filter)
      .populate('companyId', 'companyName verificationStatus address')
      .sort({ createdAt: -1 });

    res.status(200).json({ status: 'success', results: posts.length, data: { posts } });
  } catch (error) {
    next(error);
  }
};

export const getPostDetails = async (req, res, next) => {
  try {
    const post = await ContractPost.findById(req.params.id).populate('companyId', 'companyName verificationStatus address');
    if (!post) {
      return next(new AppError('Contract post not found', 404));
    }

    // Privacy guard: Draft posts are only visible to the owning company or admin
    if (post.status === 'draft') {
      const company = await Company.findOne({ userId: req.user._id });
      const isOwner = company && post.companyId?._id?.toString() === company._id.toString();
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) {
        return next(new AppError('Contract post not found or unpublished', 404));
      }
    }

    res.status(200).json({ status: 'success', data: { post } });
  } catch (error) {
    next(error);
  }
};

export const getMyCompanyPosts = async (req, res, next) => {
  try {
    const company = await Company.findOne({ userId: req.user._id });
    if (!company) {
      return res.status(200).json({ status: 'success', results: 0, data: { posts: [] } });
    }

    const posts = await ContractPost.find({ companyId: company._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: posts.length, data: { posts } });
  } catch (error) {
    next(error);
  }
};
