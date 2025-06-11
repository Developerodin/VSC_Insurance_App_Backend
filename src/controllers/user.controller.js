import httpStatus from 'http-status';
import { pick } from '../utils/pick.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';
import * as userService from '../services/user.service.js';
import { User, Notification, BankAccount } from '../models/index.js';
import * as kycService from '../services/kyc.service.js';
import { verifyPan, verifyBankAccount } from '../services/truthscreen.service.js';

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
  let updated = false;

  if (aadhaarNumber) {
    user.kycDetails.aadhaarNumber = aadhaarNumber;
    user.kycDetails.aadhaarVerified = false;
    updated = true;
  }
  if (panNumber) {
    user.kycDetails.panNumber = panNumber;
    user.kycDetails.panVerified = false;
    updated = true;
  }

  if (!updated) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No KYC field provided to update');
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

// Bank Account Management Functions for User Routes
export const createUserBankAccount = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Check if the requesting user can create bank account for this user
  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only create bank accounts for yourself');
  }

  // Create bank account
  const bankAccount = await BankAccount.create({
    ...req.body,
    agent: userId,
  });

  // Add bank account reference to user
  user.bankAccounts.push(bankAccount._id);
  await user.save();

  res.status(httpStatus.CREATED).send(bankAccount);
});

export const getUserBankAccounts = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Check if the requesting user can view bank accounts for this user
  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only view your own bank accounts');
  }

  const filter = { agent: userId };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  if (req.query.status) filter.status = req.query.status;

  const bankAccounts = await BankAccount.paginate(filter, options);
  res.send(bankAccounts);
});

export const getUserBankAccount = catchAsync(async (req, res) => {
  const { userId, bankAccountId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Check if the requesting user can view this bank account
  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only view your own bank accounts');
  }

  const bankAccount = await BankAccount.findOne({ _id: bankAccountId, agent: userId });
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found for this user');
  }

  res.send(bankAccount);
});

export const updateUserBankAccount = catchAsync(async (req, res) => {
  const { userId, bankAccountId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Check if the requesting user can update this bank account
  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only update your own bank accounts');
  }

  const bankAccount = await BankAccount.findOne({ _id: bankAccountId, agent: userId });
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found for this user');
  }

  Object.assign(bankAccount, req.body);
  await bankAccount.save();
  res.send(bankAccount);
});

export const deleteUserBankAccount = catchAsync(async (req, res) => {
  const { userId, bankAccountId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Check if the requesting user can delete this bank account
  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only delete your own bank accounts');
  }

  const bankAccount = await BankAccount.findOne({ _id: bankAccountId, agent: userId });
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found for this user');
  }

  // Remove bank account reference from user
  user.bankAccounts.pull(bankAccountId);
  await user.save();

  // Delete the bank account
  await bankAccount.remove();
  res.status(httpStatus.NO_CONTENT).send();
});

export const setUserDefaultBankAccount = catchAsync(async (req, res) => {
  const { userId, bankAccountId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Check if the requesting user can set default for this user
  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only set default for your own bank accounts');
  }

  const bankAccount = await BankAccount.findOne({ _id: bankAccountId, agent: userId });
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found for this user');
  }

  // Set all other bank accounts of this user to non-default
  await BankAccount.updateMany(
    { agent: userId },
    { isDefault: false }
  );

  // Set this bank account as default
  bankAccount.isDefault = true;
  await bankAccount.save();

  res.send(bankAccount);
});

export const uploadUserBankAccountDocument = catchAsync(async (req, res) => {
  const { userId, bankAccountId } = req.params;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Check if the requesting user can upload documents for this bank account
  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only upload documents for your own bank accounts');
  }

  const bankAccount = await BankAccount.findOne({ _id: bankAccountId, agent: userId });
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found for this user');
  }

  bankAccount.documents.push({
    name: req.body.name,
    url: req.body.url,
    type: req.body.type,
  });
  await bankAccount.save();

  // Create notification for admin if not uploaded by admin
  if (req.user.role !== 'admin') {
    await Notification.create({
      recipient: req.user.id,
      type: 'document_uploaded',
      title: 'Bank Account Document Uploaded',
      message: 'A new document has been uploaded for bank account verification',
      channels: ['in_app', 'email'],
      data: {
        userId: userId,
        bankAccountId: bankAccount._id,
        documentType: req.body.type,
      },
    });
  }

  res.send(bankAccount);
});

// Change Password Function
export const changePassword = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const { currentPassword, newPassword } = req.body;
  
  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  
  // Check if the requesting user can change password for this user
  if (req.user.id !== userId && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only change your own password');
  }

  // For non-admin users, verify current password
  if (req.user.role !== 'admin') {
    const isCurrentPasswordValid = await user.isPasswordMatch(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Current password is incorrect');
    }
  }

  // Update the password (the pre-save hook will hash it automatically)
  user.password = newPassword;
  await user.save();
  res.send({ 
    message: 'Password changed successfully',
    userId: user._id 
  });
});

// Initiate Aadhaar KYC (send OTP)
export const initiateAadhaarKyc = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const { aadhaarNumber } = req.body;
  if (!aadhaarNumber) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Aadhaar number is required');
  }
  const result = await kycService.initiateAadhaarOtp(aadhaarNumber);
  // Optionally store ref_id in user for later verification
  user.kycDetails.aadhaarNumber = aadhaarNumber;
  user.kycDetails.aadhaarOtpRefId = result.ref_id;
  await user.save();
  res.send({ message: result.message, ref_id: result.ref_id });
});

// Verify Aadhaar KYC (submit OTP, get KYC, store details)
export const verifyAadhaarKyc = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const { ref_id, otp } = req.body;
  if (!ref_id || !otp) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'ref_id and otp are required');
  }
  const result = await kycService.verifyAadhaarOtp(ref_id, otp);
  // Store all KYC details from response
  user.kycDetails.aadhaarVerified = result.status === 'VALID';
  user.kycDetails.aadhaarVerificationDate = new Date();
  user.kycDetails.aadhaarKycData = result; // Store full response for audit
  await user.save();
  res.send({ message: result.message, kyc: result });
});

// Verify PAN KYC (verify PAN, store details)
export const verifyPanKyc = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const { pan } = req.body;
  if (!pan) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'PAN and name are required');
  }
  const result = await verifyPan(pan);
  console.log("result in contoller users ==>", result);
  user.kycDetails.panNumber = pan;
  user.kycDetails.panVerified = result.valid === true;
  user.kycDetails.panVerificationDate = new Date();
  user.kycDetails.panKycData = result; // Store full response for audit
  await user.save();
  res.send({ message: result.message, kyc: result });
});

// Verify Bank Account KYC (verify bank account and IFSC, store details)
export const verifyBankKyc = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const { accountNumber, ifscCode } = req.body;
  if (!accountNumber || !ifscCode) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Account number and IFSC code are required');
  }
  const result = await verifyBankAccount(accountNumber, ifscCode);
  console.log("result in controller bank verification ==>", result);
  
  // Store bank verification details in user's KYC
  if (!user.kycDetails.bankVerifications) {
    user.kycDetails.bankVerifications = [];
  }
  
  user.kycDetails.bankVerifications.push({
    accountNumber: accountNumber,
    ifscCode: ifscCode,
    verified: result.valid === true,
    verificationDate: new Date(),
    bankKycData: result, // Store full response for audit
    accountHolderName: result.accountHolderName,
    bankName: result.bankName,
    verificationStatus: result.verificationStatus,
    description: result.description,
    tsTransactionId: result.tsTransactionId
  });
  
  await user.save();
  res.send({ message: result.message, kyc: result });
});

