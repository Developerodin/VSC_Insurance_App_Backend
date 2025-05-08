import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const leadSchema = mongoose.Schema(
  {
    agent: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'interested', 'followUp', 'qualified', 'proposal', 'negotiation', 'closed', 'lost'],
      default: 'new',
    },
    source: {
      type: String,
      enum: ['direct', 'referral', 'website', 'social', 'other'],
      required: true,
    },
    products: [{
      product: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
      },
      status: {
        type: String,
        enum: ['interested', 'proposed', 'sold', 'rejected'],
      },
      notes: String,
    }],
    requirements: {
      type: String,
    },
    budget: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR',
      },
    },
    followUps: [{
      date: {
        type: Date,
        required: true,
      },
      notes: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
      },
      agent: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
      },
    }],
    documents: [{
      name: String,
      url: String,
      type: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
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
    lastContact: {
      type: Date,
    },
    nextFollowUp: {
      type: Date,
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: {
        type: String,
        default: 'India',
      },
    },
    tags: [{
      type: String,
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
leadSchema.plugin(toJSON);
leadSchema.plugin(paginate);

/**
 * @typedef Lead
 */
const Lead = mongoose.model('Lead', leadSchema);

export default Lead; 