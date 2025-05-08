import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as transactionValidation from '../../validations/transaction.validation.js';
import * as transactionController from '../../controllers/transaction.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('manageTransactions'), validate(transactionValidation.createTransaction), transactionController.createTransaction)
  .get(auth('getTransactions'), validate(transactionValidation.getTransactions), transactionController.getTransactions);

router
  .route('/:transactionId')
  .get(auth('getTransactions'), validate(transactionValidation.getTransaction), transactionController.getTransaction)
  .patch(auth('manageTransactions'), validate(transactionValidation.updateTransaction), transactionController.updateTransaction)
  .delete(auth('manageTransactions'), validate(transactionValidation.deleteTransaction), transactionController.deleteTransaction);

router
  .route('/stats')
  .get(auth('getTransactions'), validate(transactionValidation.getTransactionStats), transactionController.getTransactionStats);

router
  .route('/agent/:agentId')
  .get(auth('getTransactions'), validate(transactionValidation.getAgentTransactions), transactionController.getAgentTransactions);

router
  .route('/:transactionId/notes')
  .post(auth('manageTransactions'), validate(transactionValidation.addTransactionNote), transactionController.addTransactionNote);

export default router; 