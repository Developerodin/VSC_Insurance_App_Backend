import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugins
roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);

/**
 * Check if name is taken
 * @param {string} name - The role's name
 * @param {ObjectId} [excludeRoleId] - The id of the role to be excluded
 * @returns {Promise<boolean>}
 */
roleSchema.statics.isNameTaken = async function (name, excludeRoleId) {
  const role = await this.findOne({ name, _id: { $ne: excludeRoleId } });
  return !!role;
};

const Role = mongoose.model('Role', roleSchema);

export default Role; 