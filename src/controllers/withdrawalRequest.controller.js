import httpStatus from 'http-status';
import { WithdrawalRequest, Commission } from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendNotification } from '../services/notification.service.js';
import walletService from '../services/wallet.service.js';

// Create a new withdrawal request
const createWithdrawalRequest = catchAsync(async (req, res) => {
  const { amount, bankAccount } = req.body;
  const userId = req.user.id;

  // Get pending commissions
  const pendingCommissions = await Commission.find({
    agent: userId,
    status: 'pending',
  });

  // Create withdrawal request
  const withdrawalRequest = await WithdrawalRequest.create({
    agent: userId,
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
    userId,
    amount,
    withdrawalRequest._id
  );

  // Send notification
  await sendNotification({
    user: userId,
    title: 'Withdrawal Request Created',
    message: `Your withdrawal request for $${amount} has been created and is pending approval.`,
    type: 'withdrawal_request',
    data: { withdrawalRequestId: withdrawalRequest._id },
  });

  res.status(httpStatus.CREATED).send(withdrawalRequest);
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
  const { adminNote } = req.body;

  const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId);
  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  if (withdrawalRequest.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Withdrawal request is not pending');
  }

  withdrawalRequest.status = 'approved';
  withdrawalRequest.adminNote = adminNote;
  withdrawalRequest.approvedBy = req.user.id;
  withdrawalRequest.approvedAt = new Date();
  await withdrawalRequest.save();

  // Update commission statuses
  await Commission.updateMany(
    { _id: { $in: withdrawalRequest.commissions } },
    { status: 'withdrawal_approved' }
  );

  // Send notification
  await sendNotification({
    user: withdrawalRequest.agent,
    title: 'Withdrawal Request Approved',
    message: `Your withdrawal request for $${withdrawalRequest.amount} has been approved.`,
    type: 'withdrawal_request',
    data: { withdrawalRequestId: withdrawalRequest._id },
  });

  res.send(withdrawalRequest);
});

// Reject withdrawal request (admin only)
const rejectWithdrawalRequest = catchAsync(async (req, res) => {
  const { withdrawalRequestId } = req.params;
  const { reason } = req.body;

  const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId);
  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  if (withdrawalRequest.status !== 'pending') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Withdrawal request is not pending');
  }

  withdrawalRequest.status = 'rejected';
  withdrawalRequest.rejectionReason = reason;
  withdrawalRequest.rejectedBy = req.user.id;
  withdrawalRequest.rejectedAt = new Date();
  await withdrawalRequest.save();

  // Update commission statuses
  await Commission.updateMany(
    { _id: { $in: withdrawalRequest.commissions } },
    { status: 'pending' }
  );

  // Update wallet
  await walletService.updateWalletOnWithdrawalRejection(
    withdrawalRequest.agent,
    withdrawalRequest.amount,
    withdrawalRequest._id
  );

  // Send notification
  await sendNotification({
    user: withdrawalRequest.agent,
    title: 'Withdrawal Request Rejected',
    message: `Your withdrawal request for $${withdrawalRequest.amount} has been rejected. Reason: ${reason}`,
    type: 'withdrawal_request',
    data: { withdrawalRequestId: withdrawalRequest._id },
  });

  res.send(withdrawalRequest);
});

// Mark withdrawal request as paid (admin only)
const markWithdrawalRequestAsPaid = catchAsync(async (req, res) => {
  const { withdrawalRequestId } = req.params;
  const { paymentDetails } = req.body;

  const withdrawalRequest = await WithdrawalRequest.findById(withdrawalRequestId);
  if (!withdrawalRequest) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Withdrawal request not found');
  }

  if (withdrawalRequest.status !== 'approved') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Withdrawal request is not approved');
  }

  withdrawalRequest.status = 'paid';
  withdrawalRequest.paymentDetails = paymentDetails;
  withdrawalRequest.paidBy = req.user.id;
  withdrawalRequest.paidAt = new Date();
  await withdrawalRequest.save();

  // Update commission statuses
  await Commission.updateMany(
    { _id: { $in: withdrawalRequest.commissions } },
    { status: 'paid' }
  );

  // Send notification
  await sendNotification({
    user: withdrawalRequest.agent,
    title: 'Withdrawal Request Paid',
    message: `Your withdrawal request for $${withdrawalRequest.amount} has been paid.`,
    type: 'withdrawal_request',
    data: { withdrawalRequestId: withdrawalRequest._id },
  });

  res.send(withdrawalRequest);
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