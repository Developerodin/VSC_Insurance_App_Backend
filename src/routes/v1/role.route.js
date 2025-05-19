import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as roleValidation from '../../validations/role.validation.js';
import * as roleController from '../../controllers/role.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('manageRoles'), validate(roleValidation.createRole), roleController.createRole)
  .get(auth('getRoles'), validate(roleValidation.getRoles), roleController.getRoles);

router
  .route('/:roleId')
  .get(auth('getRoles'), validate(roleValidation.getRole), roleController.getRole)
  .patch(auth('manageRoles'), validate(roleValidation.updateRole), roleController.updateRole)
  .delete(auth('manageRoles'), validate(roleValidation.deleteRole), roleController.deleteRole);

export default router; 