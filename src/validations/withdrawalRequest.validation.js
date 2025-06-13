import Joi from 'joi';
import { objectId } from './custom.validation.js';

const createWithdrawalRequest = {
  body: Joi.object().keys({
    amount: Joi.number().required().min(0),
    bankAccount: Joi.string().required(),
  }),
};

const getWithdrawalRequests = {
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'approved', 'rejected', 'paid'),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUserWithdrawalRequests = {
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'approved', 'rejected', 'paid'),
    startDate: Joi.date(),
    endDate: Joi.date().min(Joi.ref('startDate')),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getWithdrawalRequest = {
  params: Joi.object().keys({
    withdrawalRequestId: Joi.string().custom(objectId),
  }),
};

const approveWithdrawalRequest = {
  params: Joi.object().keys({
    withdrawalRequestId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    adminNote: Joi.string(),
  }),
};

const rejectWithdrawalRequest = {
  params: Joi.object().keys({
    withdrawalRequestId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    reason: Joi.string().required(),
  }),
};

const markWithdrawalRequestAsPaid = {
  params: Joi.object().keys({
    withdrawalRequestId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    paymentDetails: Joi.object().required(),
  }),
};

export default {
  createWithdrawalRequest,
  getWithdrawalRequests,
  getUserWithdrawalRequests,
  getWithdrawalRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  markWithdrawalRequestAsPaid,
}; 