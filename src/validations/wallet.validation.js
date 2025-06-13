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

const updateWalletStatus = {
  params: Joi.object().keys({
    walletId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('active', 'suspended', 'frozen').required(),
    reason: Joi.string().when('status', {
      is: Joi.string().valid('suspended', 'frozen'),
      then: Joi.string().required(),
      otherwise: Joi.string().optional(),
    }),
  }),
};

export default {
  getWalletTransactions,
  updateWalletStatus,
}; 