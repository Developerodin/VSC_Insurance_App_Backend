import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const withdrawalRequestSchema = mongoose.Schema(
  {
    agent: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    bankAccount: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    commissions: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Commission',
    }],
    adminNote: {
      type: String,
    },
    rejectionReason: {
      type: String,
    },
    paymentDetails: {
      type: Map,
      of: mongoose.SchemaTypes.Mixed,
    },
    approvedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    rejectedAt: {
      type: Date,
    },
    paidBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
withdrawalRequestSchema.plugin(toJSON);
withdrawalRequestSchema.plugin(paginate);

/**
 * @typedef WithdrawalRequest
 */
export const WithdrawalRequest = mongoose.model('WithdrawalRequest', withdrawalRequestSchema); 