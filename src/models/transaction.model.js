import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const transactionSchema = mongoose.Schema(
  {
    agent: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['commission', 'payout', 'refund', 'adjustment', 'other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    reference: {
      type: mongoose.SchemaTypes.ObjectId,
      refPath: 'referenceModel',
    },
    referenceModel: {
      type: String,
      enum: ['Commission', 'Payout', 'Lead', 'Product'],
    },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'upi', 'cheque', 'cash', 'other'],
    },
    bankAccount: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'BankAccount',
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    notes: [{
      content: String,
      createdBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    documents: [{
      name: String,
      url: String,
      type: String,
    }],
    processedBy: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
    error: {
      code: String,
      message: String,
      details: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
transactionSchema.plugin(toJSON);
transactionSchema.plugin(paginate);

/**
 * @typedef Transaction
 */
const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction; 