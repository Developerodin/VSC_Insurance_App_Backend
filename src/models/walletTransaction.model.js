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
      enum: ['commission', 'withdrawal', 'refund', 'adjustment', 'commission_reversal', 'commission_adjustment', 'commission_reduction', 'commission_cancellation', 'commission_percentage_change'],
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
    reason: {
      type: String,
      enum: ['lead_closure', 'commission_approval', 'commission_rejection', 'commission_cancellation', 'commission_amount_change', 'commission_percentage_change', 'commission_bonus_change', 'withdrawal_request', 'withdrawal_rejection', 'refund', 'manual_adjustment'],
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