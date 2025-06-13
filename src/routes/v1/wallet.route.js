import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as walletValidation from '../../validations/wallet.validation.js';
import * as walletController from '../../controllers/wallet.controller.js';

const router = express.Router();

// Get wallet details
router
  .route('/')
  .get(
    auth('getWallet'),
    walletController.getWallet
  );

// Get wallet transactions
router
  .route('/transactions')
  .get(
    auth('getWallet'),
    validate(walletValidation.getWalletTransactions),
    walletController.getWalletTransactions
  );

// Get wallet statistics
router
  .route('/stats')
  .get(
    auth('getWallet'),
    walletController.getWalletStats
  );

// Update wallet status (admin only)
router
  .route('/:walletId/status')
  .patch(
    auth('manageWallets'),
    validate(walletValidation.updateWalletStatus),
    walletController.updateWalletStatus
  );

export default router; 