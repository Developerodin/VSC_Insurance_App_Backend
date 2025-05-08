

import express from 'express';
import auth from '../../middlewares/auth.js';
import validate from '../../middlewares/validate.js';
import * as bankAccountValidation from '../../validations/bankAccount.validation.js';
import * as bankAccountController from '../../controllers/bankAccount.controller.js';

const router = express.Router();

router
  .route('/')
  .post(auth('manageBankAccounts'), validate(bankAccountValidation.createBankAccount), bankAccountController.createBankAccount)
  .get(auth('getBankAccounts'), validate(bankAccountValidation.getBankAccounts), bankAccountController.getBankAccounts);

router
  .route('/:bankAccountId')
  .get(auth('getBankAccounts'), validate(bankAccountValidation.getBankAccount), bankAccountController.getBankAccount)
  .patch(auth('manageBankAccounts'), validate(bankAccountValidation.updateBankAccount), bankAccountController.updateBankAccount)
  .delete(auth('manageBankAccounts'), validate(bankAccountValidation.deleteBankAccount), bankAccountController.deleteBankAccount);

router
  .route('/:bankAccountId/verify')
  .post(auth('manageBankAccounts'), validate(bankAccountValidation.verifyBankAccount), bankAccountController.verifyBankAccount);

router
  .route('/:bankAccountId/default')
  .post(auth('manageBankAccounts'), validate(bankAccountValidation.setDefaultBankAccount), bankAccountController.setDefaultBankAccount);

router
  .route('/:bankAccountId/documents')
  .post(auth('manageBankAccounts'), validate(bankAccountValidation.uploadBankAccountDocument), bankAccountController.uploadBankAccountDocument);

  export default router; 