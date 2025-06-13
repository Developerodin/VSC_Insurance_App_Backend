import httpStatus from 'http-status';
import { WithdrawalRequest, Commission } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createWithdrawalRequestNotification } from '../services/notification.service.js';
import walletService from '../services/wallet.service.js';

// Create a new withdrawal request
const createWithdrawalRequest = catchAsync(async (req, res) => {
  const { amount, bankAccount } = req.body;
  const agent = req.user.id;

  // Get pending commissions
  const pendingCommissions = await Commission.find({
    agent: agent,
    status: 'pending',
  });

  // Create withdrawal request
  const withdrawalRequest = await WithdrawalRequest.create({
    agent,
    amount,
    bankAccount,
    status: 'pending',
    commissions: pendingCommissions.map(commission => commission._id),
  });

  // Update commission statuses
  await Commission.updateMany(
    { _id: { $in: pendingCommissions.map(c => c._id) } },
    { status: 'withdrawal_requested' }
  );

  // Update wallet
  const wallet = await walletService.updateWalletOnWithdrawalRequest(
    agent,
    amount,
    withdrawalRequest._id
  );

  // Create notification
  await createWithdrawalRequestNotification(agent, withdrawalRequest);

  res.status(httpStatus.CREATED).send({
    status: 'success',
    data: {
      withdrawalRequest,
    },
  });
});

// Get all withdrawal requests (admin only)
const getWithdrawalRequests = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    sortBy: req.query.sortBy,
    limit: parseInt(req.query.limit, 10),
    page: parseInt(req.query.page, 10),
  };

  const withdrawalRequests = await WithdrawalRequest.paginate(filter, options);
  res.send(withdrawalRequests);
});

// Get user's withdrawal requests
const getUserWithdrawalRequests = catchAsync(async (req, res) => {
  const filter = { agent: req.user.id };
  const options = {
    sortBy: req.query.sortBy,
    limit: parseInt(req.query.limit, 10),
    page: parseInt(req.query.page, 10),
  };

  const withdrawalRequests = await WithdrawalRequest.paginate(filter, options);
  res.send(withdrawalRequests);
});

// Get withdrawal request details
const getWithdrawalRequest = catchAsync(async (req, res) => {
  const withdrawalRequest = await WithdrawalRequest.findById(req.params.withdrawalRequestId)
    .populate('agent', 'name email')
    .populate('commissions');

  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  res.send(withdrawalRequest);
});

// Approve withdrawal request (admin only)
const approveWithdrawalRequest = catchAsync(async (req, res) => {
  const { withdrawalRequestId } = req.params;
  const { rejectionReason } = req.body;

  const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId);
  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  if (withdrawalRequest.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Withdrawal request is not pending');
  }

  withdrawalRequest.status = 'approved';
  await withdrawalRequest.save();

  // Create notification
  await createWithdrawalRequestNotification(withdrawalRequest.agent, withdrawalRequest);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      withdrawalRequest,
    },
  });
});

// Reject withdrawal request (admin only)
const rejectWithdrawalRequest = catchAsync(async (req, res) => {
  const { withdrawalRequestId } = req.params;
  const { rejectionReason } = req.body;

  const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId);
  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  if (withdrawalRequest.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Withdrawal request is not pending');
  }

  withdrawalRequest.status = 'rejected';
  withdrawalRequest.rejectionReason = rejectionReason;
  await withdrawalRequest.save();

  // Create notification
  await createWithdrawalRequestNotification(withdrawalRequest.agent, withdrawalRequest);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      withdrawalRequest,
    },
  });
});

// Mark withdrawal request as paid (admin only)
const markWithdrawalRequestAsPaid = catchAsync(async (req, res) => {
  const { withdrawalRequestId } = req.params;

  const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId);
  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  if (withdrawalRequest.status !== 'approved') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Withdrawal request is not approved');
  }

  // Update wallet balance
  await walletService.updateWalletBalance(withdrawalRequest.agent, withdrawalRequest.amount, 'withdrawal');

  withdrawalRequest.status = 'paid';
  withdrawalRequest.paidAt = new Date();
  await withdrawalRequest.save();

  // Create notification
  await createWithdrawalRequestNotification(withdrawalRequest.agent, withdrawalRequest);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      withdrawalRequest,
    },
  });
});

export {
  createWithdrawalRequest,
  getWithdrawalRequests,
  getUserWithdrawalRequests,
  getWithdrawalRequest,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  markWithdrawalRequestAsPaid,
}; 