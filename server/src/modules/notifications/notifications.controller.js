import Notification from './notifications.model.js';
import { AppError } from '../../middleware/errorHandler.js';

/**
 * GET /api/v1/notifications
 * Returns the authenticated user's 50 most-recent notifications.
 */
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ status: 'success', results: notifications.length, data: { notifications } });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/notifications/unread-count
 * Returns the number of unread notifications for the authenticated user.
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    res.status(200).json({ status: 'success', data: { unreadCount: count } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/:id/read
 * Marks a single notification as read. Enforces ownership — users can only mark their own.
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return next(new AppError('Notification not found or access denied', 404));
    }
    res.status(200).json({ status: 'success', data: { notification } });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 * Marks ALL unread notifications as read for the authenticated user.
 */
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({
      status: 'success',
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: { modifiedCount: result.modifiedCount },
    });
  } catch (error) {
    next(error);
  }
};
