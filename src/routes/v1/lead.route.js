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
  .route('/stats/monthly')
  .get(auth('getLeads'), validate(leadValidation.getMonthlyLeadStats), leadController.getMonthlyLeadStats);

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

router
  .route('/:leadId/status')
  .patch(auth('manageLeads'), validate(leadValidation.updateLeadStatus), leadController.updateLeadStatus);

// New route for lead timeline
router
  .route('/:leadId/timeline')
  .get(auth('getLeads'), validate(leadValidation.getLead), leadController.getLeadTimeline);

// Document management routes
router
  .route('/:leadId/documents')
  .get(auth('getLeads'), validate(leadValidation.getLead), leadController.getDocuments)
  .post(auth('manageLeads'), validate(leadValidation.getLead), leadController.addDocument);

router
  .route('/:leadId/documents/:documentKey')
  .delete(auth('manageLeads'), validate(leadValidation.getLead), leadController.removeDocument);

export default router; 