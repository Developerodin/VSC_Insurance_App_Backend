import httpStatus from 'http-status';

import {catchAsync} from '../utils/catchAsync.js';
import * as permissionService  from '../services/permission.service.js';

const createPermission = catchAsync(async (req, res) => {
  const permission = await permissionService.createPermission(req.body);
  res.status(httpStatus.CREATED).send(permission);
});

const getPermissions = catchAsync(async (req, res) => {
  const filter = req.query;
  const options = req.query;
  const result = await permissionService.queryPermissions(filter, options);
  res.send(result);
});

const getPermission = catchAsync(async (req, res) => {
  const permission = await permissionService.getPermissionById(req.params.permissionId);
  res.send(permission);
});

const updatePermission = catchAsync(async (req, res) => {
  const permission = await permissionService.updatePermissionById(req.params.permissionId, req.body);
  res.send(permission);
});

const deletePermission = catchAsync(async (req, res) => {
  await permissionService.deletePermissionById(req.params.permissionId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createPermission,
  getPermissions,
  getPermission,
  updatePermission,
  deletePermission,
}; 