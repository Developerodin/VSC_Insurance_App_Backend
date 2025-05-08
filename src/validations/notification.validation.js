import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createNotification = {
  body: Joi.object().keys({
    recipient: Joi.string().custom(objectId).required(),
    type: Joi.string().valid(
      'lead_assigned',
      'lead_status_change',
      'commission_earned',
      'payout_processed',
      'kyc_verified',
      'bank_account_verified',
      'product_update',
      'system_announcement',
      'follow_up_reminder',
      'document_uploaded',
      'other'
    ).required(),
    title: Joi.string().required(),
    message: Joi.string().required(),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    status: Joi.string().valid('unread', 'read', 'archived').default('unread'),
    data: Joi.object(),
    action: Joi.object().keys({
      type: Joi.string().valid('link', 'button', 'none').default('none'),
      label: Joi.string(),
      url: Joi.string(),
    }),
    channels: Joi.array().items(
      Joi.string().valid('email', 'push', 'sms', 'whatsapp', 'in_app')
    ).required(),
  }),
};

const getNotifications = {
  query: Joi.object().keys({
    type: Joi.string().valid(
      'lead_assigned',
      'lead_status_change',
      'commission_earned',
      'payout_processed',
      'kyc_verified',
      'bank_account_verified',
      'product_update',
      'system_announcement',
      'follow_up_reminder',
      'document_uploaded',
      'other'
    ),
    status: Joi.string().valid('unread', 'read', 'archived'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

const updateNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('unread', 'read', 'archived'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    readAt: Joi.date(),
  }),
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

const markAsRead = {
  params: Joi.object().keys({
    notificationId: Joi.string().custom(objectId),
  }),
};

const markAllAsRead = {
  body: Joi.object().keys({
    type: Joi.string().valid(
      'lead_assigned',
      'lead_status_change',
      'commission_earned',
      'payout_processed',
      'kyc_verified',
      'bank_account_verified',
      'product_update',
      'system_announcement',
      'follow_up_reminder',
      'document_uploaded',
      'other'
    ),
  }),
};

const getUnreadCount = {
  query: Joi.object().keys({
    type: Joi.string().valid(
      'lead_assigned',
      'lead_status_change',
      'commission_earned',
      'payout_processed',
      'kyc_verified',
      'bank_account_verified',
      'product_update',
      'system_announcement',
      'follow_up_reminder',
      'document_uploaded',
      'other'
    ),
  }),
};

const getNotificationStats = {
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),
};

export{
  createNotification,
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getNotificationStats,
}; 