import mongoose from 'mongoose';
import toJSON from './plugins/toJSON.plugin.js';
import paginate from './plugins/paginate.plugin.js';

const permissionSchema = mongoose.Schema(
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
    module: {
      type: String,
      required: true,
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
permissionSchema.plugin(toJSON);
permissionSchema.plugin(paginate);

/**
 * Check if name is taken
 * @param {string} name - The permission's name
 * @param {ObjectId} [excludePermissionId] - The id of the permission to be excluded
 * @returns {Promise<boolean>}
 */
permissionSchema.statics.isNameTaken = async function (name, excludePermissionId) {
  const permission = await this.findOne({ name, _id: { $ne: excludePermissionId } });
  return !!permission;
};

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission; 