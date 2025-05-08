import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createBankAccount = {
  body: Joi.object().keys({
    accountHolderName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    bankName: Joi.string().required(),
    branchName: Joi.string().required(),
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),
    accountType: Joi.string().valid('savings', 'current', 'salary').required(),
    status: Joi.string().valid('pending', 'verified', 'rejected').default('pending'),
    isDefault: Joi.boolean().default(false),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
      verified: Joi.boolean().default(false),
    })),
  }),
};

const getBankAccounts = {
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'verified', 'rejected'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getBankAccount = {
  params: Joi.object().keys({
    bankAccountId: Joi.string().custom(objectId),
  }),
};

const updateBankAccount = {
  params: Joi.object().keys({
    bankAccountId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    accountHolderName: Joi.string(),
    accountNumber: Joi.string(),
    bankName: Joi.string(),
    branchName: Joi.string(),
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    accountType: Joi.string().valid('savings', 'current', 'salary'),
    status: Joi.string().valid('pending', 'verified', 'rejected'),
    isDefault: Joi.boolean(),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
      verified: Joi.boolean(),
    })),
  }),
};

const deleteBankAccount = {
  params: Joi.object().keys({
    bankAccountId: Joi.string().custom(objectId),
  }),
};

const verifyBankAccount = {
  params: Joi.object().keys({
    bankAccountId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    notes: Joi.string(),
  }),
};

const setDefaultBankAccount = {
  params: Joi.object().keys({
    bankAccountId: Joi.string().custom(objectId),
  }),
};

const uploadBankAccountDocument = {
  params: Joi.object().keys({
    bankAccountId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    url: Joi.string().required(),
    type: Joi.string().required(),
  }),
};

export {
  createBankAccount,
  getBankAccounts,
  getBankAccount,
  updateBankAccount,
  deleteBankAccount,
  verifyBankAccount,
  setDefaultBankAccount,
  uploadBankAccountDocument,
}; 