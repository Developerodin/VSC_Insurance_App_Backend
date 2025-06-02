import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['insurance', 'banking', 'capital market', 'it sector', 'project funding'],
      required: true,
    },
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    }],
    description: {
      type: String,
      required: true,
    },
    features: [{
      type: String,
    }],
    terms: [{
      type: String,
    }],
    eligibility: {
      type: String,
    },
    commission: {
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      minAmount: {
        type: Number,
        default: 0,
      },
      maxAmount: {
        type: Number,
      },
      bonus: {
        type: Number,
        default: 0,
      },
    },
    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'INR',
      },
      discounts: [{
        type: {
          type: String,
          enum: ['percentage', 'fixed'],
        },
        value: Number,
        validUntil: Date,
      }],
    },
    // Insurance specific fields
    coverage: {
      type: String,
    },
    duration: {
      type: String,
    },
    // Banking specific fields
    interestRate: {
      type: Number,
    },
    loanAmount: {
      min: Number,
      max: Number,
    },
    tenure: {
      min: Number,
      max: Number,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active',
    },
    documents: [{
      name: String,
      url: String,
      type: String,
    }],
    images: [{
      url: String,
      alt: String,
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
productSchema.plugin(toJSON);
productSchema.plugin(paginate);

/**
 * @typedef Product
 */
const Product = mongoose.model('Product', productSchema);

export default Product; 