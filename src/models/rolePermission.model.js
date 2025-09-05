import mongoose from 'mongoose';

const rolePermissionSchema = mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    permissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
      required: true,
    },
    productIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    }],
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure unique role-permission pairs
rolePermissionSchema.index({ roleId: 1, permissionId: 1 }, { unique: true });

const RolePermission = mongoose.model('RolePermission', rolePermissionSchema);

export default RolePermission; 