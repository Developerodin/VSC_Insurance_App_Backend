import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const subcategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
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

// Create compound index for category and name to ensure uniqueness within a category
subcategorySchema.index({ category: 1, name: 1 }, { unique: true });

// add plugin that converts mongoose to json
subcategorySchema.plugin(toJSON);
subcategorySchema.plugin(paginate);

/**
 * @typedef Subcategory
 */
const Subcategory = mongoose.model('Subcategory', subcategorySchema);

export default Subcategory; 