import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const bankAccountSchema = mongoose.Schema(
  {
    agent: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    branchName: {
      type: String,
      required: false,
      trim: true,
    },
    ifscCode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
        },
        message: props => `${props.value} is not a valid IFSC code!`
      }
    },
    accountType: {
      type: String,
      enum: ['savings', 'current', 'salary'],
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    documents: [{
      name: String,
      url: String,
      type: String,
      verified: {
        type: Boolean,
        default: false,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    verificationDetails: {
      verifiedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
      },
      verifiedAt: Date,
      notes: String,
      // Truthscreen verification data
      tsTransactionId: String,
      verificationStatus: String,
      accountHolderNameVerified: String, // Name from verification service
      bankNameVerified: String, // Bank name from verification service
      verificationDescription: String,
      truthscreenData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
      verificationMethod: {
        type: String,
        enum: ['manual', 'automatic', 'truthscreen'],
        default: 'manual'
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
bankAccountSchema.plugin(toJSON);
bankAccountSchema.plugin(paginate);

/**
 * @typedef BankAccount
 */
const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

export default BankAccount; 