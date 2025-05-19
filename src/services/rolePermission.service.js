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
  const role = await Role.findById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  const permissions = await Permission.find({ _id: { $in: permissionIds } });
  if (permissions.length !== permissionIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'One or more permissions not found');
  }

  const rolePermissions = permissionIds.map((permissionId) => ({
    roleId,
    permissionId,
  }));

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
  const role = await Role.findById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  const rolePermissions = await RolePermission.find({ roleId }).populate('permissionId');
  return rolePermissions.map((rp) => rp.permissionId);
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
  await rolePermission.remove();
};

export const rolePermissionService = {
  assignPermissionsToRole,
  getPermissionsForRole,
  removePermissionFromRole,
}; 