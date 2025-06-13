import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const walletTransactionSchema = mongoose.Schema(
  {
    wallet: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    type: {
      type: String,
      enum: ['commission', 'withdrawal', 'refund', 'adjustment'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
    },
    reference: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    referenceModel: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
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
walletTransactionSchema.plugin(toJSON);
walletTransactionSchema.plugin(paginate);

/**
 * @typedef WalletTransaction
 */
export const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema); 