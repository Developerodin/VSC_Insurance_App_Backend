import httpStatus from 'http-status';
import { Commission, User, Notification, Transaction } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';

export const createCommission = catchAsync(async (req, res) => {
  console.log('Request body:', req.body);
  // Create commission with agent ID from authenticated user
  const commission = await Commission.create({
    ...req.body,
    agent: req.user.id, // Set agent ID from authenticated user
  });

  // Create notification for the agent
  await Notification.create({
    recipient: req.user.id,
    type: 'commission_earned',
    title: 'Commission Earned',
    message: `You have earned a commission of ${commission.amount} for the sale`,
    channels: ['in_app', 'email'],
    data: {
      commissionId: commission._id,
      amount: commission.amount,
    },
  });

  res.status(httpStatus.CREATED).send(commission);
});

export const getCommissions = catchAsync(async (req, res) => {
  const filter = {};
  const options = {
    populate: 'product paymentDetails.bankAccount',
    select: 'product.name product.commission paymentDetails.bankAccount.accountHolderName paymentDetails.bankAccount.accountNumber paymentDetails.bankAccount.bankName',
  };

  // Filter by agent if not admin
  if (req.user.role !== 'admin') {
    filter.agent = req.user.id;
  }

  if (req.query.status) filter.status = req.query.status;
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const commissions = await Commission.paginate(filter, options);
  res.send(commissions);
});

export const getCommission = catchAsync(async (req, res) => {
  const commission = await Commission.findById(req.params.commissionId)
    .populate('product', 'name commission')
    .populate('paymentDetails.bankAccount', 'accountHolderName accountNumber bankName');
    
  if (!commission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission not found');
  }
  if (commission.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  res.send(commission);
});

export const updateCommission = catchAsync(async (req, res) => {
  const commission = await Commission.findById(req.params.commissionId);
  if (!commission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission not found');
  }
  if (req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  const oldStatus = commission.status;
  Object.assign(commission, req.body);
  await commission.save();

  // Create notification if status changed
  if (oldStatus !== commission.status) {
    await Notification.create({
      recipient: commission.agent,
      type: 'commission_status_change',
      title: 'Commission Status Updated',
      message: `Your commission status has been updated to: ${commission.status}`,
      channels: ['in_app', 'email'],
      data: {
        commissionId: commission._id,
        oldStatus,
        newStatus: commission.status,
      },
    });
  }

  res.send(commission);
});

export const processPayout = catchAsync(async (req, res) => {
  const commission = await Commission.findById(req.params.commissionId);
  if (!commission) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Commission not found');
  }
  if (req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  if (commission.status !== 'approved') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Commission must be approved before payout');
  }

  // Create transaction record
  const transaction = await Transaction.create({
    agent: commission.agent,
    type: 'payout',
    amount: commission.amount,
    status: 'pending',
    reference: commission._id,
    referenceModel: 'Commission',
    paymentMethod: req.body.paymentMethod,
    bankAccount: req.body.bankAccount,
  });

  // Update commission status
  commission.status = 'paid';
  commission.payout = transaction._id;
  commission.paymentDetails = {
    bankAccount: req.body.bankAccount,
    transactionId: transaction._id,
    paymentDate: new Date(),
    paymentMethod: req.body.paymentMethod,
  };
  await commission.save();

  // Create notification for the agent
  await Notification.create({
    recipient: commission.agent,
    type: 'payout_processed',
    title: 'Payout Processed',
    message: `Your commission payout of ${commission.amount} has been processed`,
    channels: ['in_app', 'email'],
    data: {
      commissionId: commission._id,
      transactionId: transaction._id,
      amount: commission.amount,
    },
  });

  res.send({ commission, transaction });
});

export const getCommissionStats = catchAsync(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') {
    filter.agent = req.user.id;
  }

  const stats = await Commission.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  res.send(stats);
});

export const getAgentCommissions = catchAsync(async (req, res) => {
  const { agentId } = req.params;
  const agent = await User.findById(agentId);
  if (!agent) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Agent not found');
  }

  const filter = { agent: agentId };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const options = {
    sortBy: req.query.sortBy || 'createdAt:desc',
    limit: parseInt(req.query.limit, 10) || 10,
    page: parseInt(req.query.page, 10) || 1,
    populate: 'product paymentDetails.bankAccount',
    select: 'product.name product.commission paymentDetails.bankAccount.accountHolderName paymentDetails.bankAccount.accountNumber paymentDetails.bankAccount.bankName',
  };

  const commissions = await Commission.paginate(filter, options);
  res.send(commissions);
});

export default {
  createCommission,
  getCommissions,
  getCommission,
  updateCommission,
  processPayout,
  getCommissionStats,
  getAgentCommissions,
}; 