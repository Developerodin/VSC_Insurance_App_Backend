import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import adminUserValidation from '../../validations/adminUser.validation.js';
import adminUserController from '../../controllers/adminUser.controller.js';

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageUsers'),
    validate(adminUserValidation.createAdminUser),
    adminUserController.createAdminUser
  )
  .get(
    auth('getUsers'),
    validate(adminUserValidation.getAdminUsers),
    adminUserController.getAdminUsers
  );

router
  .route('/:userId')
  .get(
    auth('getUsers'),
    validate(adminUserValidation.getAdminUser),
    adminUserController.getAdminUser
  )
  .patch(
    auth('manageUsers'),
    validate(adminUserValidation.updateAdminUser),
    adminUserController.updateAdminUser
  )
  .delete(
    auth('manageUsers'),
    validate(adminUserValidation.deleteAdminUser),
    adminUserController.deleteAdminUser
  );

export default router;
