import httpStatus from 'http-status';
import { Notification } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

/**
 * Create a notification
 * @param {Object} notificationBody
 * @returns {Promise<Notification>}
 */
const createNotification = async (notificationBody) => {
  return Notification.create(notificationBody);
};

/**
 * Get notification by id
 * @param {ObjectId} id
 * @returns {Promise<Notification>}
 */
const getNotificationById = async (id) => {
  return Notification.findById(id);
};

/**
 * Get notifications by user id
 * @param {ObjectId} userId
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const getNotificationsByUser = async (userId, filter, options) => {
  const notifications = await Notification.paginate({ recipient: userId, ...filter }, options);
  return notifications;
};

/**
 * Update notification by id
 * @param {ObjectId} notificationId
 * @param {Object} updateBody
 * @returns {Promise<Notification>}
 */
const updateNotificationById = async (notificationId, updateBody) => {
  const notification = await getNotificationById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  Object.assign(notification, updateBody);
  await notification.save();
  return notification;
};

/**
 * Mark notification as read
 * @param {ObjectId} notificationId
 * @returns {Promise<Notification>}
 */
const markNotificationAsRead = async (notificationId) => {
  const notification = await getNotificationById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  notification.status = 'read';
  notification.readAt = new Date();
  await notification.save();
  return notification;
};

/**
 * Mark all notifications as read for a user
 * @param {ObjectId} userId
 * @returns {Promise<Notification[]>}
 */
const markAllNotificationsAsRead = async (userId) => {
  await Notification.updateMany(
    { recipient: userId, status: 'unread' },
    { status: 'read', readAt: new Date() }
  );
  return getNotificationsByUser(userId);
};

/**
 * Delete notification by id
 * @param {ObjectId} notificationId
 * @returns {Promise<Notification>}
 */
const deleteNotificationById = async (notificationId) => {
  const notification = await getNotificationById(notificationId);
  if (!notification) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  await notification.remove();
  return notification;
};

/**
 * Create a withdrawal request notification
 * @param {ObjectId} userId
 * @param {Object} withdrawalRequest
 * @returns {Promise<Notification>}
 */
const createWithdrawalRequestNotification = async (userId, withdrawalRequest) => {
  let type, title, message;
  
  switch (withdrawalRequest.status) {
    case 'pending':
      type = 'withdrawal_request_created';
      title = 'Withdrawal Request Created';
      message = `Your withdrawal request for ${withdrawalRequest.amount} has been created and is pending approval`;
      break;
    case 'approved':
      type = 'withdrawal_request_approved';
      title = 'Withdrawal Request Approved';
      message = `Your withdrawal request for ${withdrawalRequest.amount} has been approved`;
      break;
    case 'rejected':
      type = 'withdrawal_request_rejected';
      title = 'Withdrawal Request Rejected';
      message = `Your withdrawal request for ${withdrawalRequest.amount} has been rejected${withdrawalRequest.rejectionReason ? `: ${withdrawalRequest.rejectionReason}` : ''}`;
      break;
    case 'paid':
      type = 'withdrawal_request_paid';
      title = 'Withdrawal Request Paid';
      message = `Your withdrawal request for ${withdrawalRequest.amount} has been processed and paid`;
      break;
    default:
      type = 'payout_processed';
      title = 'Withdrawal Request Update';
      message = `Your withdrawal request for ${withdrawalRequest.amount} has been ${withdrawalRequest.status}`;
  }

  const notificationBody = {
    recipient: userId,
    type,
    title,
    message,
    priority: 'high',
    channels: ['in_app', 'email'],
    data: {
      withdrawalRequestId: withdrawalRequest._id,
      amount: withdrawalRequest.amount,
      status: withdrawalRequest.status,
      rejectionReason: withdrawalRequest.rejectionReason,
    },
  };
  return createNotification(notificationBody);
};

/**
 * Create a wallet status notification
 * @param {ObjectId} userId
 * @param {string} status
 * @param {string} reason
 * @returns {Promise<Notification>}
 */
const createWalletStatusNotification = async (userId, status, reason) => {
  const notificationBody = {
    recipient: userId,
    type: 'wallet_status_change',
    title: 'Wallet Status Update',
    message: `Your wallet has been ${status}${reason ? `: ${reason}` : ''}`,
    priority: 'high',
    channels: ['in_app', 'email'],
    data: {
      status,
      reason,
    },
  };
  return createNotification(notificationBody);
};

export {
  createNotification,
  getNotificationById,
  getNotificationsByUser,
  updateNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationById,
  createWithdrawalRequestNotification,
  createWalletStatusNotification,
}; 