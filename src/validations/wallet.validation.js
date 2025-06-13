import Joi from 'joi';
import { objectId } from './custom.validation.js';

const getWalletTransactions = {
  query: Joi.object().keys({
    type: Joi.string().valid('commission', 'withdrawal', 'refund', 'adjustment'),
    status: Joi.string().valid('pending', 'completed', 'failed', 'cancelled'),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCommissionEarnings = {
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
  }),
};

const getWithdrawalHistory = {
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
  }),
};

const getRecentTransactions = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(50),
  }),
};

const getTransactionDetails = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId),
  }),
};

const updateWalletStatus = {
  params: Joi.object().keys({
    walletId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('active', 'suspended', 'blocked').required(),
    reason: Joi.string().when('status', {
      is: Joi.string().valid('suspended', 'blocked'),
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
  }),
};

export default {
  getWalletTransactions,
  getCommissionEarnings,
  getWithdrawalHistory,
  getRecentTransactions,
  getTransactionDetails,
  updateWalletStatus,
}; 