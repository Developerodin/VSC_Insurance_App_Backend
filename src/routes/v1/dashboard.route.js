import express from 'express';
import auth from '../../middlewares/auth.js';
import * as dashboardController from '../../controllers/dashboard.controller.js';

const router = express.Router();

// Main dashboard stats
router
  .route('/stats')
  .get( dashboardController.getDashboardStats);

// Lead trends
router
  .route('/trends/leads')
  .get( dashboardController.getLeadTrends);

// Transaction trends
router
  .route('/trends/transactions')
  .get( dashboardController.getTransactionTrends);

// KYC statistics
router
  .route('/kyc-stats')
  .get( dashboardController.getKycStats);

export default router; 