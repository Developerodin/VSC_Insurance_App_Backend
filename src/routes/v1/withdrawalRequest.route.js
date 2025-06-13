import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as withdrawalRequestValidation from '../../validations/withdrawalRequest.validation.js';
import * as withdrawalRequestController from '../../controllers/withdrawalRequest.controller.js';

const router = express.Router();

// Create withdrawal request
router
  .route('/')
  .post(
    auth('createWithdrawalRequest'),
    validate(withdrawalRequestValidation.createWithdrawalRequest),
    withdrawalRequestController.createWithdrawalRequest
  );

// Get all withdrawal requests (admin only)
router
  .route('/')
  .get(
    auth('getWithdrawalRequests'),
    validate(withdrawalRequestValidation.getWithdrawalRequests),
    withdrawalRequestController.getWithdrawalRequests
  );

// Get user's withdrawal requests
router
  .route('/user')
  .get(
    auth('getUserWithdrawalRequests'),
    validate(withdrawalRequestValidation.getUserWithdrawalRequests),
    withdrawalRequestController.getUserWithdrawalRequests
  );

// Get withdrawal request details
router
  .route('/:withdrawalRequestId')
  .get(
    auth('getWithdrawalRequest'),
    validate(withdrawalRequestValidation.getWithdrawalRequest),
    withdrawalRequestController.getWithdrawalRequest
  );

// Approve withdrawal request (admin only)
router
  .route('/:withdrawalRequestId/approve')
  .patch(
    auth('approveWithdrawalRequest'),
    validate(withdrawalRequestValidation.approveWithdrawalRequest),
    withdrawalRequestController.approveWithdrawalRequest
  );

// Reject withdrawal request (admin only)
router
  .route('/:withdrawalRequestId/reject')
  .patch(
    auth('rejectWithdrawalRequest'),
    validate(withdrawalRequestValidation.rejectWithdrawalRequest),
    withdrawalRequestController.rejectWithdrawalRequest
  );

// Mark withdrawal request as paid (admin only)
router
  .route('/:withdrawalRequestId/pay')
  .patch(
    auth('markWithdrawalRequestAsPaid'),
    validate(withdrawalRequestValidation.markWithdrawalRequestAsPaid),
    withdrawalRequestController.markWithdrawalRequestAsPaid
  );

export default router; 