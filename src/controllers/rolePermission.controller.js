import httpStatus from 'http-status';
import {catchAsync} from '../utils/catchAsync.js';
import * as  rolePermissionService  from '../services/rolePermission.service.js';
import { Role } from '../models/index.js';

const assignPermissionsToRole = catchAsync(async (req, res) => {
  // Debug logs
  console.log('Request body:', JSON.stringify(req.body));
  console.log('permissionIds from body:', req.body.permissionIds);
  
  const { roleId } = req.params;
  const { permissionIds } = req.body;
  
  console.log('Extracted permissionIds:', permissionIds);
  
  const rolePermissions = await rolePermissionService.assignPermissionsToRole(roleId, permissionIds);
  res.status(httpStatus.CREATED).send(rolePermissions);
});

const getPermissionsForRole = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const permissions = await rolePermissionService.getPermissionsForRole(roleId);
  res.send(permissions);
});

const removePermissionFromRole = catchAsync(async (req, res) => {
  const { roleId, permissionId } = req.params;
  await rolePermissionService.removePermissionFromRole(roleId, permissionId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Get permissions for the current user's role
const getMyRolePermissions = catchAsync(async (req, res) => {
  console.log('Getting permissions for current user:', req.user.name);
  
  // Get the user's role
  const roleName = req.user.role;
  
  // Find the role by name
  const role = await Role.findOne({ name: roleName });
  if (!role) {
    return res.status(httpStatus.NOT_FOUND).send({ message: 'Role not found' });
  }
  
  // Get permissions for this role
  const permissions = await rolePermissionService.getPermissionsForRole(role._id);
  
  // Return the permissions
  res.send({
    role: {
      name: role.name,
      description: role.description,
      id: role._id
    },
    permissions
  });
});

export default {
  assignPermissionsToRole,
  getPermissionsForRole,
  removePermissionFromRole,
  getMyRolePermissions,
}; 