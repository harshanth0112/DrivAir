import User from '../users/users.model.js';
import AuditLog from './admin.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (status) filter.accountStatus = status;

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', results: users.length, data: { users } });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'active', 'suspended', 'blocked'].includes(status)) {
      return next(new AppError('Invalid account status', 400));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const oldStatus = user.accountStatus;
    user.accountStatus = status;
    await user.save();

    // Log admin action to AuditLog
    await AuditLog.create({
      actorId: req.user._id,
      action: 'UPDATE_USER_STATUS',
      targetType: 'User',
      targetId: user._id,
      metadata: { oldStatus, newStatus: status },
      ipAddress: req.ip,
    });

    res.status(200).json({ status: 'success', message: `User status changed to ${status}`, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('actorId', 'fullName email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ status: 'success', results: logs.length, data: { auditLogs: logs } });
  } catch (error) {
    next(error);
  }
};
