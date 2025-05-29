import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as leadValidation from '../../validations/lead.validation.js';
import * as leadController from '../../controllers/lead.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('manageLeads'), validate(leadValidation.createLead), leadController.createLead)
  .get(auth('getLeads'), validate(leadValidation.getLeads), leadController.getLeads);

router
  .route('/:leadId')
  .get(auth('getLeads'), validate(leadValidation.getLead), leadController.getLead)
  .patch(auth('manageLeads'), validate(leadValidation.updateLead), leadController.updateLead)
  .delete(auth('manageLeads'), validate(leadValidation.deleteLead), leadController.deleteLead);

router
  .route('/stats')
  .get(auth('getLeads'), validate(leadValidation.getLeadStats), leadController.getLeadStats);

router
  .route('/:leadId/assign')
  .post(auth('manageLeads'), validate(leadValidation.assignLead), leadController.assignLead);

router
  .route('/user/:userId')
  .get(auth('getLeads'), validate(leadValidation.getLeadsByUserId), leadController.getLeadsByUserId);

router
  .route('/:leadId/fields')
  .patch(auth('manageLeads'), validate(leadValidation.updateLeadFields), leadController.updateLeadFields);

router
  .route('/:leadId/products')
  .patch(auth('manageLeads'), validate(leadValidation.updateLeadProducts), leadController.updateLeadProducts);

export default router; 