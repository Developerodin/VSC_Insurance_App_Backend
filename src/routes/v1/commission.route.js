import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as commissionValidation from '../../validations/commission.validation.js';
import * as commissionController from '../../controllers/commission.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('manageCommissions'), validate(commissionValidation.createCommission), commissionController.createCommission)
  .get(auth('getCommissions'), validate(commissionValidation.getCommissions), commissionController.getCommissions);

router
  .route('/stats')
  .get(auth('getCommissions'), validate(commissionValidation.getCommissionStats), commissionController.getCommissionStats);

router
  .route('/agent/:agentId')
  .get(auth('getCommissions'), validate(commissionValidation.getAgentCommissions), commissionController.getAgentCommissions);

router
  .route('/:commissionId')
  .get(auth('getCommissions'), validate(commissionValidation.getCommission), commissionController.getCommission)
  .patch(auth('manageCommissions'), validate(commissionValidation.updateCommission), commissionController.updateCommission);

router
  .route('/:commissionId/payout')
  .post(auth('manageCommissions'), validate(commissionValidation.processPayout), commissionController.processPayout);

export default router; 