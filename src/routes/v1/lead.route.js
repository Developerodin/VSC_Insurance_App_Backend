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
  .route('/:leadId/follow-up')
  .post(auth('manageLeads'), validate(leadValidation.addFollowUp), leadController.addFollowUp);

router
  .route('/:leadId/notes')
  .post(auth('manageLeads'), validate(leadValidation.addNote), leadController.addNote);

router
  .route('/stats')
  .get(auth('getLeads'), validate(leadValidation.getLeadStats), leadController.getLeadStats);

router
  .route('/:leadId/assign')
  .post(auth('manageLeads'), validate(leadValidation.assignLead), leadController.assignLead);

export default router; 