import httpStatus from 'http-status';
import {catchAsync} from '../utils/catchAsync.js';
import * as  rolePermissionService  from '../services/rolePermission.service.js';

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

export default {
  assignPermissionsToRole,
  getPermissionsForRole,
  removePermissionFromRole,
}; 