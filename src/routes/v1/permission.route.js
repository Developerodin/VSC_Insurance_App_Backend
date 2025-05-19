import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as permissionValidation from '../../validations/permission.validation.js';
import * as permissionController from '../../controllers/permission.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('managePermissions'), validate(permissionValidation.createPermission), permissionController.createPermission)
  .get(auth('getPermissions'), validate(permissionValidation.getPermissions), permissionController.getPermissions);

router
  .route('/:permissionId')
  .get(auth('getPermissions'), validate(permissionValidation.getPermission), permissionController.getPermission)
  .patch(auth('managePermissions'), validate(permissionValidation.updatePermission), permissionController.updatePermission)
  .delete(auth('managePermissions'), validate(permissionValidation.deletePermission), permissionController.deletePermission);

export default router; 