import Joi from 'joi';
import { objectId } from './custom.validation.js';

const getUsers = {
  query: Joi.object().keys({
    role: Joi.string().valid('agent', 'admin', 'superAdmin'),
    status: Joi.string().valid('pending', 'active', 'inactive', 'suspended'),
    onboardingStatus: Joi.string().valid('pending', 'in_progress', 'completed', 'rejected'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email(),
    mobileNumber: Joi.string(),
    role: Joi.string().valid('agent', 'admin', 'superAdmin'),
    status: Joi.string().valid('pending', 'active', 'inactive', 'suspended'),
    kycDetails: Joi.object().keys({
      aadhaarNumber: Joi.string(),
      panNumber: Joi.string(),
    }),
  }),
};

const verifyKycDocument = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    documentId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    verified: Joi.boolean().required(),
    rejectionReason: Joi.string().when('verified', {
      is: false,
      then: Joi.required(),
    }),
  }),
};

const verifyAadhaar = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    verified: Joi.boolean().required(),
  }),
};

const verifyPan = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    verified: Joi.boolean().required(),
  }),
};

const updateOnboardingStatus = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'rejected').required(),
    reason: Joi.string().when('status', {
      is: 'rejected',
      then: Joi.required(),
    }),
  }),
};

const getKycStats = {
  query: Joi.object().keys({
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),
};

export {
  getUsers,
  getUser,
  updateUser,
  verifyKycDocument,
  verifyAadhaar,
  verifyPan,
  updateOnboardingStatus,
  getKycStats,
}; 