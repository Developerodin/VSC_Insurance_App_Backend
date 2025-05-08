import httpStatus from 'http-status';
import { User, Notification } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';

export const getUsers = catchAsync(async (req, res) => {
  const filter = {};
  const options = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.onboardingStatus) filter.onboardingStatus = req.query.onboardingStatus;
  
  const users = await User.paginate(filter, options);
  res.send(users);
});

export const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

export const updateUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  Object.assign(user, req.body);
  await user.save();
  res.send(user);
});

export const verifyKycDocument = catchAsync(async (req, res) => {
  const { userId, documentId } = req.params;
  const { verified, rejectionReason } = req.body;
  
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const document = user.kycDetails.documents.id(documentId);
  if (!document) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Document not found');
  }

  document.verified = verified;
  document.verificationDate = new Date();
  if (!verified) {
    document.rejectionReason = rejectionReason;
  }

  await user.save();

  // Create notification for the user
  await Notification.create({
    recipient: userId,
    type: 'kyc_verified',
    title: 'KYC Document Verification',
    message: `Your document has been ${verified ? 'verified' : 'rejected'}`,
    channels: ['in_app', 'email'],
    data: {
      documentId,
      status: verified ? 'verified' : 'rejected',
      rejectionReason,
    },
  });

  res.send(user);
});

export const verifyAadhaar = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { verified } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.kycDetails.aadhaarVerified = verified;
  user.kycDetails.aadhaarVerificationDate = new Date();
  await user.save();

  // Create notification for the user
  await Notification.create({
    recipient: userId,
    type: 'kyc_verified',
    title: 'Aadhaar Verification',
    message: `Your Aadhaar has been ${verified ? 'verified' : 'rejected'}`,
    channels: ['in_app', 'email'],
    data: {
      documentType: 'aadhaar',
      status: verified ? 'verified' : 'rejected',
    },
  });

  res.send(user);
});

export const verifyPan = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { verified } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.kycDetails.panVerified = verified;
  user.kycDetails.panVerificationDate = new Date();
  await user.save();

  // Create notification for the user
  await Notification.create({
    recipient: userId,
    type: 'kyc_verified',
    title: 'PAN Verification',
    message: `Your PAN has been ${verified ? 'verified' : 'rejected'}`,
    channels: ['in_app', 'email'],
    data: {
      documentType: 'pan',
      status: verified ? 'verified' : 'rejected',
    },
  });

  res.send(user);
});

export const updateOnboardingStatus = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const { status, reason } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  user.onboardingStatus = status;
  await user.save();

  // Create notification for the user
  await Notification.create({
    recipient: userId,
    type: 'onboarding_status_change',
    title: 'Onboarding Status Updated',
    message: `Your onboarding status has been updated to: ${status}`,
    channels: ['in_app', 'email'],
    data: {
      status,
      reason,
    },
  });

  res.send(user);
});

export const getKycStats = catchAsync(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: '$onboardingStatus',
        count: { $sum: 1 },
        verifiedAadhaar: {
          $sum: { $cond: ['$kycDetails.aadhaarVerified', 1, 0] },
        },
        verifiedPan: {
          $sum: { $cond: ['$kycDetails.panVerified', 1, 0] },
        },
      },
    },
  ]);
  res.send(stats);
}); 