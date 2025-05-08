import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createCommission = {
  body: Joi.object().keys({
    product: Joi.string().custom(objectId).required(),
    lead: Joi.string().custom(objectId).required(),
    sale: Joi.string().custom(objectId).required(),
    amount: Joi.number().min(0).required(),
    percentage: Joi.number().min(0).max(100).required(),
    baseAmount: Joi.number().min(0).required(),
    bonus: Joi.number().min(0),
    status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled').default('pending'),
    paymentDetails: Joi.object().keys({
      bankAccount: Joi.string().custom(objectId),
      transactionId: Joi.string(),
      paymentDate: Joi.date(),
      paymentMethod: Joi.string().valid('bank_transfer', 'upi', 'cheque', 'other'),
    }),
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

const getCommissions = {
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getCommission = {
  params: Joi.object().keys({
    commissionId: Joi.string().custom(objectId),
  }),
};

const updateCommission = {
  params: Joi.object().keys({
    commissionId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    amount: Joi.number().min(0),
    percentage: Joi.number().min(0).max(100),
    baseAmount: Joi.number().min(0),
    bonus: Joi.number().min(0),
    status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled'),
    paymentDetails: Joi.object().keys({
      bankAccount: Joi.string().custom(objectId),
      transactionId: Joi.string(),
      paymentDate: Joi.date(),
      paymentMethod: Joi.string().valid('bank_transfer', 'upi', 'cheque', 'other'),
    }),
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

const processPayout = {
  params: Joi.object().keys({
    commissionId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    paymentMethod: Joi.string().valid('bank_transfer', 'upi', 'cheque', 'other').required(),
    bankAccount: Joi.string().custom(objectId).required(),
  }),
};

const getCommissionStats = {
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),
};

const getAgentCommissions = {
  params: Joi.object().keys({
    agentId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'approved', 'paid', 'cancelled'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export{
  createCommission,
  getCommissions,
  getCommission,
  updateCommission,
  processPayout,
  getCommissionStats,
  getAgentCommissions,
}; 