import mongoose from 'mongoose';
import { toJSON, paginate } from './plugins/index.js';

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      // Note: Names can be duplicate - no unique constraint
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['insurance', 'banking', 'capital market', 'it sector', 'project funding'],
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

// add plugin that converts mongoose to json
categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);

/**
 * @typedef Category
 */
const Category = mongoose.model('Category', categorySchema);

export default Category; 