import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createTransaction = {
  body: Joi.object().keys({
    type: Joi.string().valid('commission', 'payout', 'refund', 'adjustment', 'other').required(),
    amount: Joi.number().required(),
    currency: Joi.string().default('INR'),
    status: Joi.string().valid('pending', 'completed', 'failed', 'cancelled').default('pending'),
    reference: Joi.string().custom(objectId),
    referenceModel: Joi.string().valid('Commission', 'Payout', 'Lead', 'Product'),
    paymentMethod: Joi.string().valid('bank_transfer', 'upi', 'cheque', 'cash', 'other'),
    bankAccount: Joi.string().custom(objectId),
    transactionId: Joi.string(),
    description: Joi.string(),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
    })),
    notes: Joi.array().items(Joi.object().keys({
      content: Joi.string().required(),
    })),
  }),
};

const getTransactions = {
  query: Joi.object().keys({
    type: Joi.string().valid('commission', 'payout', 'refund', 'adjustment', 'other'),
    status: Joi.string().valid('pending', 'completed', 'failed', 'cancelled'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId),
  }),
};

const updateTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'completed', 'failed', 'cancelled'),
    paymentMethod: Joi.string().valid('bank_transfer', 'upi', 'cheque', 'cash', 'other'),
    bankAccount: Joi.string().custom(objectId),
    transactionId: Joi.string(),
    description: Joi.string(),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
    })),
    notes: Joi.array().items(Joi.object().keys({
      content: Joi.string().required(),
    })),
    error: Joi.object().keys({
      code: Joi.string(),
      message: Joi.string(),
      details: Joi.any(),
    }),
  }),
};

const deleteTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId),
  }),
};

const getTransactionStats = {
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),
};

const getAgentTransactions = {
  params: Joi.object().keys({
    agentId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    type: Joi.string().valid('commission', 'payout', 'refund', 'adjustment', 'other'),
    status: Joi.string().valid('pending', 'completed', 'failed', 'cancelled'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const addTransactionNote = {
  params: Joi.object().keys({
    transactionId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    content: Joi.string().required(),
  }),
};

export {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
  getAgentTransactions,
  addTransactionNote,
}; 