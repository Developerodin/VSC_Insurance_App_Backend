

import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as bankAccountValidation from '../../validations/bankAccount.validation.js';
import * as bankAccountController from '../../controllers/bankAccount.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('getBankAccounts'), validate(bankAccountValidation.createBankAccount), bankAccountController.createBankAccount)
  .get(auth('getBankAccounts'), validate(bankAccountValidation.getBankAccounts), bankAccountController.getBankAccounts);

router
  .route('/:bankAccountId')
  .get(auth('getBankAccounts'), validate(bankAccountValidation.getBankAccount), bankAccountController.getBankAccount)
  .patch(auth('getBankAccounts'), validate(bankAccountValidation.updateBankAccount), bankAccountController.updateBankAccount)
  .delete(auth('getBankAccounts'), validate(bankAccountValidation.deleteBankAccount), bankAccountController.deleteBankAccount);

router
  .route('/:bankAccountId/verify')
  .post(auth('manageBankAccounts'), validate(bankAccountValidation.verifyBankAccount), bankAccountController.verifyBankAccount);

router
  .route('/:bankAccountId/default')
  .post(auth('getBankAccounts'), validate(bankAccountValidation.setDefaultBankAccount), bankAccountController.setDefaultBankAccount);

router
  .route('/:bankAccountId/documents')
  .post(auth('getBankAccounts'), validate(bankAccountValidation.uploadBankAccountDocument), bankAccountController.uploadBankAccountDocument);

  export default router; 