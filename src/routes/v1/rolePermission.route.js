import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as rolePermissionValidation from '../../validations/rolePermission.validation.js';
import  rolePermissionController from '../../controllers/rolePermission.controller.js';

const router = express.Router();

router
  .route('/roles/:roleId/permissions')
  .post(
    auth('manageRoles'),
    validate(rolePermissionValidation.assignPermissionsToRole),
    rolePermissionController.assignPermissionsToRole
  )
  .get(
    auth('getRoles'),
    validate(rolePermissionValidation.getPermissionsForRole),
    rolePermissionController.getPermissionsForRole
  );

router
  .route('/roles/:roleId/permissions/:permissionId')
  .delete(
    auth('manageRoles'),
    validate(rolePermissionValidation.removePermissionFromRole),
    rolePermissionController.removePermissionFromRole
  );

export default router; 