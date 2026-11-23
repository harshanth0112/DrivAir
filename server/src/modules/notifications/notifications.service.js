/**
 * Notifications Service
 * Centralised helper for creating in-app notifications.
 * Import createNotification wherever a business event should produce a notification.
 */

import Notification from './notifications.model.js';

let _io = null;

/**
 * Register global Socket.IO instance for real-time notification dispatch
 * @param {object} io
 */
export const setNotificationSocketIO = (io) => {
  _io = io;
};

/**
 * Create a single notification for a user.
 *
 * @param {object} opts
 * @param {string|ObjectId} opts.userId       - Recipient user _id
 * @param {string}          opts.type         - One of the Notification model enum values
 * @param {string}          opts.title        - Short human-readable title
 * @param {string}          opts.message      - Full notification message
 * @param {string}         [opts.relatedType] - e.g. 'Bid', 'Contract', 'ContractRequest'
 * @param {string|ObjectId}[opts.relatedId]   - The related document _id
 * @returns {Promise<object>} The saved Notification document
 */
export const createNotification = async ({ userId, type, title, message, relatedType, relatedId }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      ...(relatedType ? { relatedType } : {}),
      ...(relatedId ? { relatedId } : {}),
    });

    // Real-time recipient-scoped dispatch via Socket.IO if available
    if (_io && userId) {
      _io.to(`user_${userId.toString()}`).emit('notification_received', {
        _id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedType: notification.relatedType,
        relatedId: notification.relatedId,
        createdAt: notification.createdAt,
        isRead: false,
      });
    }

    return notification;
  } catch (err) {
    // Never let a notification failure crash the calling business operation
    console.error('[Notifications] Failed to create notification:', err.message);
    return null;
  }
};

/**
 * Bulk-create notifications (e.g. notify all participants of an event).
 *
 * @param {Array<object>} notificationsArray - Array of notification option objects
 * @returns {Promise<object[]>} Array of saved Notification documents (nulls filtered out)
 */
export const createNotifications = async (notificationsArray) => {
  const results = await Promise.all(notificationsArray.map(createNotification));
  return results.filter(Boolean);
};
