import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const notificationSchema = mongoose.Schema(
  {
    recipient: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'lead_created',
        'lead_assigned',
        'lead_status_change',
        'commission_earned',
        'commission_status_change',
        'commission_amount_change',
        'payout_processed',
        'kyc_verified',
        'bank_account_verified',
        'product_update',
        'system_announcement',
        'follow_up_reminder',
        'document_uploaded',
        'wallet_status_change',
        'withdrawal_request_created',
        'withdrawal_request_approved',
        'withdrawal_request_rejected',
        'withdrawal_request_paid',
        'other'
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread',
    },
    readAt: {
      type: Date,
    },
    data: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    action: {
      type: {
        type: String,
        enum: ['link', 'button', 'none'],
        default: 'none',
      },
      label: String,
      url: String,
    },
    channels: [{
      type: String,
      enum: ['email', 'push', 'sms', 'whatsapp', 'in_app'],
      required: true,
    }],
    deliveryStatus: [{
      channel: {
        type: String,
        enum: ['email', 'push', 'sms', 'whatsapp', 'in_app'],
      },
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending',
      },
      sentAt: Date,
      error: String,
    }],
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
notificationSchema.plugin(toJSON);
notificationSchema.plugin(paginate);

/**
 * @typedef Notification
 */
const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 