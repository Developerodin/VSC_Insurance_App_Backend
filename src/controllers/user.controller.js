import httpStatus from 'http-status';
import { pick } from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';
import * as userService from '../services/user.service.js';
import { User, Notification } from '../models/index.js';

export const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

export const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'status', 'onboardingStatus']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

export const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

export const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

export const uploadKycDocument = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const { type, url } = req.body;
  user.kycDetails.documents.push({
    type,
    url,
    uploadedAt: new Date(),
  });

  await user.save();

  // Create notification for admin
  await Notification.create({
    recipient: req.user.id,
    type: 'document_uploaded',
    title: 'KYC Document Uploaded',
    message: `A new ${type} document has been uploaded for verification`,
    channels: ['in_app', 'email'],
    data: {
      userId: user._id,
      documentType: type,
    },
  });

  res.send(user);
});

export const updateKycDetails = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const { aadhaarNumber, panNumber } = req.body;
  if (aadhaarNumber) {
    user.kycDetails.aadhaarNumber = aadhaarNumber;
    user.kycDetails.aadhaarVerified = false;
  }
  if (panNumber) {
    user.kycDetails.panNumber = panNumber;
    user.kycDetails.panVerified = false;
  }

  await user.save();
  res.send(user);
});

export const verifyMobile = catchAsync(async (req, res) => {
  const { otp } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired OTP');
  }

  user.isMobileVerified = true;
  user.mobileVerification.verified = true;
  user.otp = undefined;
  await user.save();

  res.send(user);
});

export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.emailVerification || user.emailVerification.token !== token || user.emailVerification.expiresAt < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired verification token');
  }

  user.isEmailVerified = true;
  user.emailVerification.verified = true;
  await user.save();

  res.send(user);
});

export const resendVerification = catchAsync(async (req, res) => {
  const { type } = req.body; // 'email' or 'mobile'
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (type === 'email') {
    // Generate new email verification token
    const token = await userService.generateEmailVerificationToken();
    user.emailVerification = {
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      verified: false,
    };
  } else if (type === 'mobile') {
    // Generate new OTP
    const otp = await userService.generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      attempts: 0,
    };
  }

  await user.save();
  res.send({ message: `Verification ${type === 'email' ? 'email' : 'OTP'} sent successfully` });
});

export const getOnboardingStatus = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const status = {
    onboardingStatus: user.onboardingStatus,
    kycStatus: {
      aadhaarVerified: user.kycDetails.aadhaarVerified,
      panVerified: user.kycDetails.panVerified,
      documentsVerified: user.kycDetails.documents.every(doc => doc.verified),
    },
    verificationStatus: {
      emailVerified: user.isEmailVerified,
      mobileVerified: user.isMobileVerified,
    },
  };

  res.send(status);
});

