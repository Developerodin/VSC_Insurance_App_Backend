import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const commissionSchema = mongoose.Schema(
  {
    agent: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
      required: true,
    },
    lead: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Lead',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    baseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tdsPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'cancelled'],
      default: 'pending',
    },
    paymentDetails: {
      bankAccount: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'BankAccount',
      },
      transactionId: String,
      paymentDate: Date,
      paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'upi', 'cheque', 'other'],
      },
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
commissionSchema.plugin(toJSON);
commissionSchema.plugin(paginate);

/**
 * @typedef Commission
 */
const Commission = mongoose.model('Commission', commissionSchema);

export default Commission; 