import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import rolePermissionValidation from '../../validations/rolePermission.validation.js';
import rolePermissionController from '../../controllers/rolePermission.controller.js';

const router = express.Router();

// Route for getting current user's role permissions - available to all authenticated users
router
  .route('/my-permissions')
  .get(auth(), rolePermissionController.getMyRolePermissions);

router
  .route('/roles/:roleId/permissions')
  .post(
    auth('manageRoles', 'managePermissions'),
    validate(rolePermissionValidation.assignPermissionsToRole),
    rolePermissionController.assignPermissionsToRole
  )
  .get(
    auth('getRoles', 'getPermissions', 'manageRoles', 'managePermissions'),
    validate(rolePermissionValidation.getPermissionsForRole),
    rolePermissionController.getPermissionsForRole
  );

router
  .route('/roles/:roleId/permissions/:permissionId')
  .delete(
    auth('manageRoles', 'managePermissions'),
    validate(rolePermissionValidation.removePermissionFromRole),
    rolePermissionController.removePermissionFromRole
  );

router
  .route('/roles/:roleId/products/:productId/permissions')
  .get(
    auth('getRoles', 'getPermissions', 'manageRoles', 'managePermissions'),
    validate(rolePermissionValidation.getPermissionsForRoleByProduct),
    rolePermissionController.getPermissionsForRoleByProduct
  );

export default router; 