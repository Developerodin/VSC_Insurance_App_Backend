import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const leadSchema = mongoose.Schema(
  {
    agent: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
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
    category: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategory: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Subcategory',
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
    }],
    // Dynamic fields submitted by the user
    fieldsData: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastContact: {
      type: Date,
    },
    nextFollowUp: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
leadSchema.plugin(toJSON);
leadSchema.plugin(paginate);

// Create compound index for category and product
leadSchema.index({ category: 1, 'products.product': 1 });
leadSchema.index({ agent: 1 });
leadSchema.index({ status: 1 });

/**
 * @typedef Lead
 */
const Lead = mongoose.model('Lead', leadSchema);

export default Lead; 