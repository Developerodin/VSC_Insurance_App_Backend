import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync.js';
import { rolePermissionService } from '../services/index.js';

const assignPermissionsToRole = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body;
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