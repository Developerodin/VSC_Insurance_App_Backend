import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as adminValidation from '../../validations/admin.validation.js';
import * as adminController from '../../controllers/admin.controller.js';

const router = express.Router();

router
  .route('/users')
  .get(auth('manageUsers', 'getUsers'), validate(adminValidation.getUsers), adminController.getUsers);

router
  .route('/users/:userId')
  .get(auth('manageUsers', 'getUsers'), validate(adminValidation.getUser), adminController.getUser)
  .patch(auth('manageUsers'), validate(adminValidation.updateUser), adminController.updateUser);

router
  .route('/users/:userId/kyc/:documentId/verify')
  .post(auth('manageUsers'), validate(adminValidation.verifyKycDocument), adminController.verifyKycDocument);

router
  .route('/users/:userId/kyc/aadhaar/verify')
  .post(auth('manageUsers'), validate(adminValidation.verifyAadhaar), adminController.verifyAadhaar);

router
  .route('/users/:userId/kyc/pan/verify')
  .post(auth('manageUsers'), validate(adminValidation.verifyPan), adminController.verifyPan);

router
  .route('/users/:userId/onboarding')
  .patch(auth('manageUsers'), validate(adminValidation.updateOnboardingStatus), adminController.updateOnboardingStatus);

router
  .route('/kyc/stats')
  .get(auth('manageUsers'), validate(adminValidation.getKycStats), adminController.getKycStats);

export default router;