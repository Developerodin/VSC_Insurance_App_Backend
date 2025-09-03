import Joi from 'joi';
import { objectId, password } from './custom.validation.js';
import { roles } from '../config/roles.js';

export const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().trim().default('Test User'),
    role: Joi.string().valid(...roles).default('user'),
    mobileNumber: Joi.string().pattern(/^[0-9]{10}$/),
    status: Joi.string().valid('pending', 'active', 'inactive', 'suspended').default('pending'),
    kycStatus: Joi.string().valid('pending', 'verified', 'rejected').default('pending'),
    bankAccounts: Joi.array().items(Joi.string().custom(objectId)),
    totalCommission: Joi.number().default(0),
    totalLeads: Joi.number().default(0),
    totalSales: Joi.number().default(0),
    lastLogin: Joi.date(),
    isEmailVerified: Joi.boolean().default(false),
    isMobileVerified: Joi.boolean().default(false),
    profilePicture: Joi.string(),
    profilePictureKey: Joi.string(),
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
        url: Joi.string(),
        verified: Joi.boolean().default(false),
        uploadedAt: Joi.date().default(() => new Date()),
      })
    ),
    onboardingStatus: Joi.string().valid('pending', 'in_progress', 'completed', 'rejected').default('pending'),
    kycDetails: Joi.object().keys({
      aadhaarNumber: Joi.string().pattern(/^[0-9]{12}$/),
      aadhaarVerified: Joi.boolean().default(false),
      aadhaarVerificationDate: Joi.date(),
      panNumber: Joi.string().pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/),
      panVerified: Joi.boolean().default(false),
      panVerificationDate: Joi.date(),
      documents: Joi.array().items(
        Joi.object().keys({
          type: Joi.string().valid('aadhaar', 'pan', 'addressProof', 'photo', 'other').required(),
          url: Joi.string(),
          key: Joi.string(),
          verified: Joi.boolean().default(false),
          verifiedBy: Joi.string().custom(objectId),
          verifiedAt: Joi.date(),
          rejectionReason: Joi.string(),
          uploadedAt: Joi.date().default(() => new Date()),
        })
      ),
      aadhaarOtpRefId: Joi.string(),
      aadhaarKycData: Joi.object(),
      panKycData: Joi.object(),
    }),
    otp: Joi.object().keys({
      code: Joi.string(),
      expiresAt: Joi.date(),
      attempts: Joi.number().default(0),
    }),
    emailVerification: Joi.object().keys({
      token: Joi.string(),
      expiresAt: Joi.date(),
      verified: Joi.boolean().default(false),
    }),
    mobileVerification: Joi.object().keys({
      token: Joi.string(),
      expiresAt: Joi.date(),
      verified: Joi.boolean().default(false),
    }),
  }),
};

export const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string().valid(...roles),
    status: Joi.string().valid('pending', 'active', 'inactive', 'suspended'),
    onboardingStatus: Joi.string().valid('pending', 'in_progress', 'completed', 'rejected'),
    search: Joi.string().trim(),
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
      bankAccounts: Joi.array().items(Joi.string().custom(objectId)),
      totalCommission: Joi.number().min(0),
      totalLeads: Joi.number().min(0),
      totalSales: Joi.number().min(0),
      lastLogin: Joi.date(),
      isEmailVerified: Joi.boolean(),
      isMobileVerified: Joi.boolean(),
      profilePicture: Joi.string(),
      profilePictureKey: Joi.string(),
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
          url: Joi.string(),
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
            type: Joi.string().valid('aadhaar', 'pan', 'addressProof', 'photo', 'other').required(),
            url: Joi.string(),
            key: Joi.string(),
            verified: Joi.boolean(),
            verifiedBy: Joi.string().custom(objectId),
            verifiedAt: Joi.date(),
            rejectionReason: Joi.string(),
            uploadedAt: Joi.date(),
          })
        ),
        aadhaarOtpRefId: Joi.string(),
        aadhaarKycData: Joi.object(),
        panKycData: Joi.object(),
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

// Bank Account Validations for User Routes
export const createUserBankAccount = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    accountHolderName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    bankName: Joi.string().required(),
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),
    branchName: Joi.string().allow(null, ''),
    accountType: Joi.string().valid('savings', 'current', 'salary').allow(null, ''),
    isDefault: Joi.boolean().default(false),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
      verified: Joi.boolean().default(false),
    })).allow(null),
  }),
};

export const getUserBankAccounts = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    status: Joi.string().valid('pending', 'verified', 'rejected'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getUserBankAccount = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    bankAccountId: Joi.string().custom(objectId),
  }),
};

export const updateUserBankAccount = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    bankAccountId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    accountHolderName: Joi.string(),
    accountNumber: Joi.string(),
    bankName: Joi.string(),
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
    branchName: Joi.string().allow(null, ''),
    accountType: Joi.string().valid('savings', 'current', 'salary').allow(null, ''),
    isDefault: Joi.boolean(),
    documents: Joi.array().items(Joi.object().keys({
      name: Joi.string().required(),
      url: Joi.string().required(),
      type: Joi.string().required(),
      verified: Joi.boolean(),
    })).allow(null),
  }),
};

export const deleteUserBankAccount = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    bankAccountId: Joi.string().custom(objectId),
  }),
};

export const setUserDefaultBankAccount = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    bankAccountId: Joi.string().custom(objectId),
  }),
};

export const uploadUserBankAccountDocument = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
    bankAccountId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    name: Joi.string().required(),
    url: Joi.string().required(),
    type: Joi.string().required(),
  }),
};

export const changePassword = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().custom(password),
  }),
};

export const verifyBankKyc = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    accountNumber: Joi.string().required(),
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),
    accountHolderName: Joi.string().optional(),
    bankName: Joi.string().optional(),
    accountType: Joi.string().valid('savings', 'current', 'salary').optional(),
    branchName: Joi.string().optional(),
  }),
};

