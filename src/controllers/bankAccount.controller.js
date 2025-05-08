import httpStatus from 'http-status';
import { BankAccount, User, Notification } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';

export const createBankAccount = catchAsync(async (req, res) => {
  const bankAccount = await BankAccount.create({
    ...req.body,
    agent: req.user.id,
  });

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

export const bankAccountController = {
  createBankAccount,
  getBankAccounts,
  getBankAccount,
  updateBankAccount,
  deleteBankAccount,
  verifyBankAccount,
  setDefaultBankAccount,
  uploadBankAccountDocument,
}; 