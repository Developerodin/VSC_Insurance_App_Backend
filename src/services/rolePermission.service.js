import httpStatus from 'http-status';
import { RolePermission, Role, Permission } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

/**
 * Assign permissions to a role
 * @param {ObjectId} roleId
 * @param {Array<ObjectId>} permissionIds
 * @returns {Promise<Array<RolePermission>>}
 */
const assignPermissionsToRole = async (roleId, permissionIds) => {
  // Validate roleId
  const role = await Role.findById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  // Validate permissionIds
  if (!permissionIds || !Array.isArray(permissionIds) || permissionIds.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Permission IDs must be a non-empty array');
  }

  // Verify all permissions exist
  const permissions = await Permission.find({ _id: { $in: permissionIds } });
  if (permissions.length !== permissionIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'One or more permissions not found');
  }

  // Create role-permission mappings
  const rolePermissions = permissionIds.map((permissionId) => ({
    roleId,
    permissionId,
  }));

  // Remove existing permissions and add new ones
  await RolePermission.deleteMany({ roleId });
  const createdRolePermissions = await RolePermission.insertMany(rolePermissions);
  return createdRolePermissions;
};

/**
 * Get permissions for a role
 * @param {ObjectId} roleId
 * @returns {Promise<Array<Permission>>}
 */
const getPermissionsForRole = async (roleId) => {
  console.log('Getting permissions for role ID:', roleId);
  
  try {
    const role = await Role.findById(roleId);
    if (!role) {
      console.log('Role not found with ID:', roleId);
      throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
    }
    
    console.log('Found role:', role.name);
    
    const rolePermissions = await RolePermission.find({ roleId }).populate('permissionId');
    console.log('Found rolePermissions count:', rolePermissions.length);
    
    const permissions = rolePermissions
      .filter(rp => rp.permissionId) // Filter out any null permissionIds
      .map(rp => rp.permissionId);
      
    console.log('Returning permissions count:', permissions.length);
    
    return permissions;
  } catch (error) {
    console.error('Error in getPermissionsForRole:', error);
    throw error;
  }
};

/**
 * Remove a permission from a role
 * @param {ObjectId} roleId
 * @param {ObjectId} permissionId
 * @returns {Promise<void>}
 */
const removePermissionFromRole = async (roleId, permissionId) => {
  const rolePermission = await RolePermission.findOne({ roleId, permissionId });
  if (!rolePermission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role permission not found');
  }
  await rolePermission.deleteOne();
};

export {
  assignPermissionsToRole,
  getPermissionsForRole,
  removePermissionFromRole,
}; 