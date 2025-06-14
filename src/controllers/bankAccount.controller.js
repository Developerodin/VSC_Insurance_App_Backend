import httpStatus from 'http-status';
import { BankAccount, User, Notification } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';
import { verifyBankAccount as verifyBankAccountService } from '../services/truthscreen.service.js';

export const createBankAccount = catchAsync(async (req, res) => {
  const bankAccount = await BankAccount.create({
    ...req.body,
    agent: req.user.id,
  });

  // Add bank account reference to user
  const user = await User.findById(req.user.id);
  if (user) {
    user.bankAccounts.push(bankAccount._id);
    await user.save();
  }

  res.status(httpStatus.CREATED).send(bankAccount);
});

export const getBankAccounts = catchAsync(async (req, res) => {
  const filter = {};
  const options = {};

  // Filter by agent if not admin
  if (req.user.role !== 'admin') {
    filter.agent = req.user.id;
  }

  if (req.query.status) filter.status = req.query.status;

  const bankAccounts = await BankAccount.paginate(filter, options);
  res.send(bankAccounts);
});

export const getBankAccount = catchAsync(async (req, res) => {
  const bankAccount = await BankAccount.findById(req.params.bankAccountId);
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found');
  }
  if (bankAccount.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  res.send(bankAccount);
});

export const updateBankAccount = catchAsync(async (req, res) => {
  const bankAccount = await BankAccount.findById(req.params.bankAccountId);
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found');
  }
  if (bankAccount.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  Object.assign(bankAccount, req.body);
  await bankAccount.save();
  res.send(bankAccount);
});

export const deleteBankAccount = catchAsync(async (req, res) => {
  const bankAccount = await BankAccount.findById(req.params.bankAccountId);
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found');
  }
  if (bankAccount.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  // Remove bank account reference from user
  const user = await User.findById(bankAccount.agent);
  if (user) {
    user.bankAccounts.pull(req.params.bankAccountId);
    await user.save();
  }

  await bankAccount.remove();
  res.status(httpStatus.NO_CONTENT).send();
});

export const verifyBankAccount = catchAsync(async (req, res) => {
  const bankAccount = await BankAccount.findById(req.params.bankAccountId);
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found');
  }
  if (req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  bankAccount.status = 'verified';
  bankAccount.verificationDetails = {
    verifiedBy: req.user.id,
    verifiedAt: new Date(),
    notes: req.body.notes,
  };
  await bankAccount.save();

  // Create notification for the agent
  await Notification.create({
    recipient: bankAccount.agent,
    type: 'bank_account_verified',
    title: 'Bank Account Verified',
    message: 'Your bank account has been verified successfully',
    channels: ['in_app', 'email'],
    data: {
      bankAccountId: bankAccount._id,
    },
  });

  res.send(bankAccount);
});

export const setDefaultBankAccount = catchAsync(async (req, res) => {
  const bankAccount = await BankAccount.findById(req.params.bankAccountId);
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found');
  }
  if (bankAccount.agent.toString() !== req.user.id) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  // Set all other bank accounts to non-default
  await BankAccount.updateMany(
    { agent: req.user.id },
    { isDefault: false }
  );

  // Set this bank account as default
  bankAccount.isDefault = true;
  await bankAccount.save();

  res.send(bankAccount);
});

export const uploadBankAccountDocument = catchAsync(async (req, res) => {
  const bankAccount = await BankAccount.findById(req.params.bankAccountId);
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found');
  }
  if (bankAccount.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  bankAccount.documents.push({
    name: req.body.name,
    url: req.body.url,
    type: req.body.type,
  });
  await bankAccount.save();

  // Create notification for admin
  if (req.user.role !== 'admin') {
    await Notification.create({
      recipient: req.user.id,
      type: 'document_uploaded',
      title: 'Bank Account Document Uploaded',
      message: 'A new document has been uploaded for bank account verification',
      channels: ['in_app', 'email'],
      data: {
        bankAccountId: bankAccount._id,
        documentType: req.body.type,
      },
    });
  }

  res.send(bankAccount);
});

// Verify Bank Account using Truthscreen Service
export const verifyBankAccountTruthscreen = catchAsync(async (req, res) => {
  const bankAccount = await BankAccount.findById(req.params.bankAccountId);
  if (!bankAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Bank account not found');
  }
  
  // Allow the account owner or admin to verify
  if (bankAccount.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'You can only verify your own bank accounts');
  }

  // Verify the bank account using truthscreen service
  const result = await verifyBankAccountService(bankAccount.accountNumber, bankAccount.ifscCode);
  console.log("Bank account verification result ==>", result);
  
  // Update bank account with verification details
  bankAccount.status = result.valid ? 'verified' : 'rejected';
  
  // Update bank name and account holder name if verified successfully
  if (result.valid && result.accountHolderName) {
    bankAccount.accountHolderName = result.accountHolderName;
  }
  if (result.valid && result.bankName) {
    bankAccount.bankName = result.bankName;
  }
  
  // Update verification details
  bankAccount.verificationDetails = {
    ...bankAccount.verificationDetails,
    verifiedBy: req.user.id,
    verifiedAt: new Date(),
    notes: result.description || 'Verified via Truthscreen service',
    tsTransactionId: result.tsTransactionId,
    verificationStatus: result.verificationStatus,
    accountHolderNameVerified: result.accountHolderName,
    bankNameVerified: result.bankName,
    verificationDescription: result.description,
    truthscreenData: result,
    verificationMethod: 'truthscreen'
  };
  
  await bankAccount.save();
  
  // Update user's KYC details as well
  const user = await User.findById(bankAccount.agent);
  if (user) {
    if (!user.kycDetails.bankVerifications) {
      user.kycDetails.bankVerifications = [];
    }
    
    user.kycDetails.bankVerifications.push({
      accountNumber: bankAccount.accountNumber,
      ifscCode: bankAccount.ifscCode,
      bankAccountId: bankAccount._id,
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
  }
  
  // Create notification for the user about bank account verification
  await Notification.create({
    recipient: bankAccount.agent,
    type: result.valid ? 'bank_account_verified' : 'bank_account_rejected',
    title: result.valid ? 'Bank Account Verified' : 'Bank Account Verification Failed',
    message: result.valid 
      ? 'Your bank account has been verified successfully via Truthscreen service'
      : `Bank account verification failed: ${result.message}`,
    channels: ['in_app', 'email'],
    data: {
      bankAccountId: bankAccount._id,
      accountNumber: bankAccount.accountNumber,
      ifscCode: bankAccount.ifscCode,
      verificationResult: result.valid,
      tsTransactionId: result.tsTransactionId
    },
  });
  
  res.send({ 
    message: result.message, 
    kyc: result,
    bankAccount: bankAccount
  });
});

export const bankAccountController = {
  createBankAccount,
  getBankAccounts,
  getBankAccount,
  updateBankAccount,
  deleteBankAccount,
  verifyBankAccount,
  verifyBankAccountTruthscreen,
  setDefaultBankAccount,
  uploadBankAccountDocument,
}; 