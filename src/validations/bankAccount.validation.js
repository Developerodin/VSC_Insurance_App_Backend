import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createBankAccount = {
  body: Joi.object().keys({
    accountHolderName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    bankName: Joi.string().required(),
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),
    branchName: Joi.string().allow(null, ''),
    accountType: Joi.string().valid('savings', 'current', 'salary').allow(null, ''),
    status: Joi.string().valid('pending', 'verified', 'rejected').default('pending'),
    isDefault: Joi.boolean().default(false),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
      verified: Joi.boolean().default(false),
    })).allow(null),
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
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    branchName: Joi.string().allow(null, ''),
    accountType: Joi.string().valid('savings', 'current', 'salary').allow(null, ''),
    status: Joi.string().valid('pending', 'verified', 'rejected'),
    isDefault: Joi.boolean(),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
      verified: Joi.boolean(),
    })).allow(null),
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