import httpStatus from 'http-status';
import { RolePermission, Role, Permission } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

/**
 * Assign permissions to a role
 * @param {ObjectId} roleId
 * @param {Array<ObjectId>} permissionIds
 * @param {Array<ObjectId>} productIds - Optional array of product IDs for product-wise access
 * @returns {Promise<Array<RolePermission>>}
 */
const assignPermissionsToRole = async (roleId, permissionIds, productIds = []) => {
  // Validate roleId
  const role = await Role.findById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  // Filter out null/undefined values from permissionIds
  const validPermissionIds = permissionIds.filter(id => id !== null && id !== undefined && id !== '');
  
  // Validate permissionIds
  if (!validPermissionIds || !Array.isArray(validPermissionIds) || validPermissionIds.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Permission IDs must be a non-empty array');
  }

  // Verify all permissions exist
  const permissions = await Permission.find({ _id: { $in: validPermissionIds } });
  if (permissions.length !== validPermissionIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'One or more permissions not found');
  }

  // Filter out null/undefined values from productIds
  const validProductIds = productIds ? productIds.filter(id => id !== null && id !== undefined && id !== '') : [];

  // Validate productIds if provided
  if (validProductIds && validProductIds.length > 0) {
    const { Product } = await import('../models/index.js');
    const products = await Product.find({ _id: { $in: validProductIds } });
    if (products.length !== validProductIds.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'One or more products not found');
    }
  }

  // Create role-permission mappings
  const rolePermissions = validPermissionIds.map((permissionId) => ({
    roleId,
    permissionId,
    productIds: validProductIds || [],
  }));

  // Remove existing permissions and add new ones
  await RolePermission.deleteMany({ roleId });
  const createdRolePermissions = await RolePermission.insertMany(rolePermissions);
  return createdRolePermissions;
};

/**
 * Get permissions for a role
 * @param {ObjectId} roleId
 * @returns {Promise<Array<Object>>}
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
    
    const rolePermissions = await RolePermission.find({ roleId })
      .populate('permissionId')
      .populate('productIds');
    console.log('Found rolePermissions count:', rolePermissions.length);
    
    const permissions = rolePermissions
      .filter(rp => rp.permissionId) // Filter out any null permissionIds
      .map(rp => ({
        permission: rp.permissionId,
        productIds: rp.productIds || [],
        createdAt: rp.createdAt,
        updatedAt: rp.updatedAt
      }));
      
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

/**
 * Get permissions for a role filtered by product
 * @param {ObjectId} roleId
 * @param {ObjectId} productId
 * @returns {Promise<Array<Object>>}
 */
const getPermissionsForRoleByProduct = async (roleId, productId) => {
  const role = await Role.findById(roleId);
  if (!role) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Role not found');
  }

  const rolePermissions = await RolePermission.find({ 
    roleId,
    productIds: { $in: [productId] }
  })
    .populate('permissionId')
    .populate('productIds');

  return rolePermissions
    .filter(rp => rp.permissionId)
    .map(rp => ({
      permission: rp.permissionId,
      productIds: rp.productIds || [],
      createdAt: rp.createdAt,
      updatedAt: rp.updatedAt
    }));
};

export {
  assignPermissionsToRole,
  getPermissionsForRole,
  removePermissionFromRole,
  getPermissionsForRoleByProduct,
}; 