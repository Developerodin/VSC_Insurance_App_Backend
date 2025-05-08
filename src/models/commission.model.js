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
    sale: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Sale',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'cancelled'],
      default: 'pending',
    },
    payout: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Payout',
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
    documents: [{
      name: String,
      url: String,
      type: String,
    }],
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