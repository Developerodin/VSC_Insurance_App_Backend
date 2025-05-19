import Joi from 'joi';
import { objectId } from './custom.validation.js';
import { roles } from '../config/roles.js';

export const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    name: Joi.string().required(),
    role: Joi.string().required().valid(...roles),
    mobileNumber: Joi.string().required(),
    status: Joi.string().valid('pending', 'active', 'inactive', 'suspended'),
    onboardingStatus: Joi.string().valid('pending', 'in_progress', 'completed', 'rejected'),
    kycDetails: Joi.object().keys({
      aadhaarNumber: Joi.string().pattern(/^[0-9]{12}$/),
      panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
    }),
  }),
};

export const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string().valid(...roles),
    status: Joi.string().valid('pending', 'active', 'inactive', 'suspended'),
    onboardingStatus: Joi.string().valid('pending', 'in_progress', 'completed', 'rejected'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().min(8),
      name: Joi.string().trim(),
      mobileNumber: Joi.string().pattern(/^[0-9]{10}$/),
      role: Joi.string().valid(...roles),
      status: Joi.string().valid('pending', 'active', 'inactive', 'suspended'),
      kycStatus: Joi.string().valid('pending', 'verified', 'rejected'),
      aadhaarNumber: Joi.string().pattern(/^[0-9]{12}$/),
      panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
      totalCommission: Joi.number().min(0),
      totalLeads: Joi.number().min(0),
      totalSales: Joi.number().min(0),
      lastLogin: Joi.date(),
      isEmailVerified: Joi.boolean(),
      isMobileVerified: Joi.boolean(),
      profilePicture: Joi.string().uri(),
      address: Joi.object().keys({
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        pincode: Joi.string(),
        country: Joi.string().default('India'),
      }),
      documents: Joi.array().items(
        Joi.object().keys({
          type: Joi.string().valid('aadhaar', 'pan', 'addressProof', 'other'),
          url: Joi.string().uri(),
          verified: Joi.boolean(),
          uploadedAt: Joi.date(),
        })
      ),
      onboardingStatus: Joi.string().valid('pending', 'in_progress', 'completed', 'rejected'),
      kycDetails: Joi.object().keys({
        aadhaarNumber: Joi.string().pattern(/^[0-9]{12}$/),
        aadhaarVerified: Joi.boolean(),
        aadhaarVerificationDate: Joi.date(),
        panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
        panVerified: Joi.boolean(),
        panVerificationDate: Joi.date(),
        documents: Joi.array().items(
          Joi.object().keys({
            type: Joi.string().valid('aadhaar', 'pan', 'addressProof', 'photo', 'other'),
            url: Joi.string().uri(),
            verified: Joi.boolean(),
            verifiedBy: Joi.string().custom(objectId),
            verifiedAt: Joi.date(),
            rejectionReason: Joi.string(),
            uploadedAt: Joi.date(),
          })
        ),
      }),
      otp: Joi.object().keys({
        code: Joi.string(),
        expiresAt: Joi.date(),
        attempts: Joi.number().min(0),
      }),
      emailVerification: Joi.object().keys({
        token: Joi.string(),
        expiresAt: Joi.date(),
        verified: Joi.boolean(),
      }),
      mobileVerification: Joi.object().keys({
        token: Joi.string(),
        expiresAt: Joi.date(),
        verified: Joi.boolean(),
      }),
    })
    .min(1),
};

export const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

export const uploadKycDocument = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    type: Joi.string().required().valid('aadhaar', 'pan', 'address_proof', 'income_proof', 'other'),
    url: Joi.string().required().uri(),
  }),
};

export const updateKycDetails = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    aadhaarNumber: Joi.string().pattern(/^[0-9]{12}$/),
    panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
  }).min(1),
};

export const verifyMobile = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    otp: Joi.string().required().length(6),
  }),
};

export const verifyEmail = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

export const resendVerification = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    type: Joi.string().required().valid('email', 'mobile'),
  }),
};

export const getOnboardingStatus = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

