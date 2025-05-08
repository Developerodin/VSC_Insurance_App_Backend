import httpStatus from 'http-status';
import { Transaction, User, Notification } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import {catchAsync} from '../utils/catchAsync.js';

export const createTransaction = catchAsync(async (req, res) => {
  const transaction = await Transaction.create({
    ...req.body,
    agent: req.user.id,
  });

  // Create notification for the agent
  await Notification.create({
    recipient: req.user.id,
    type: 'transaction_created',
    title: 'Transaction Created',
    message: `A new transaction of ${transaction.amount} has been created`,
    channels: ['in_app', 'email'],
    data: {
      transactionId: transaction._id,
      amount: transaction.amount,
    },
  });

  res.status(httpStatus.CREATED).send(transaction);
});

export const getTransactions = catchAsync(async (req, res) => {
  const filter = {};
  const options = {};

  // Filter by agent if not admin
  if (req.user.role !== 'admin') {
    filter.agent = req.user.id;
  }

  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const transactions = await Transaction.paginate(filter, options);
  res.send(transactions);
});

export const getTransaction = catchAsync(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  if (transaction.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  res.send(transaction);
});

export const updateTransaction = catchAsync(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  if (req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  const oldStatus = transaction.status;
  Object.assign(transaction, req.body);
  await transaction.save();

  // Create notification if status changed
  if (oldStatus !== transaction.status) {
    await Notification.create({
      recipient: transaction.agent,
      type: 'transaction_status_change',
      title: 'Transaction Status Updated',
      message: `Your transaction status has been updated to: ${transaction.status}`,
      channels: ['in_app', 'email'],
      data: {
        transactionId: transaction._id,
        oldStatus,
        newStatus: transaction.status,
      },
    });
  }

  res.send(transaction);
});

export const deleteTransaction = catchAsync(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  if (req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  await transaction.remove();
  res.status(httpStatus.NO_CONTENT).send();
});

export const getTransactionStats = catchAsync(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') {
    filter.agent = req.user.id;
  }

  const stats = await Transaction.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        pendingAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0],
          },
        },
        completedAmount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0],
          },
        },
      },
    },
  ]);

  res.send(stats);
});

export const getAgentTransactions = catchAsync(async (req, res) => {
  const agentId = req.params.agentId;
  const agent = await User.findById(agentId);
  if (!agent) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Agent not found');
  }

  const filter = { agent: agentId };
  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const transactions = await Transaction.paginate(filter);
  res.send(transactions);
});

export const addTransactionNote = catchAsync(async (req, res) => {
  const transaction = await Transaction.findById(req.params.transactionId);
  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }
  if (transaction.agent.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }

  transaction.notes.push({
    content: req.body.content,
    createdBy: req.user.id,
  });
  await transaction.save();
  res.send(transaction);
}); 