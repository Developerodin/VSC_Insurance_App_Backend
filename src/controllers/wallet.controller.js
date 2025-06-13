import httpStatus from 'http-status';
import { Wallet, WalletTransaction, User, Notification } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { pick } from '../utils/pick.js';
import walletService from '../services/wallet.service.js';

/**
 * Get user's wallet details
 */
const getWallet = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    // Create wallet if it doesn't exist
    const newWallet = await walletService.createWallet(userId);
    return res.status(httpStatus.OK).send({
      status: 'success',
      data: {
        wallet: newWallet,
      },
    });
  }

  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      wallet,
    },
  });
});

/**
 * Get user's wallet transactions
 */
const getWalletTransactions = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  const { type, status, startDate, endDate, sortBy, limit, page } = req.query;
  const filter = { wallet: wallet._id };

  if (type) filter.type = type;
  if (status) filter.status = status;
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const options = {
    sortBy,
    limit: parseInt(limit, 10),
    page: parseInt(page, 10),
  };

  const transactions = await WalletTransaction.paginate(filter, options);
  res.status(httpStatus.OK).send({
    status: 'success',
    data: transactions,
  });
});

/**
 * Get user's wallet statistics
 */
const getWalletStats = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  const stats = await walletService.getWalletStats(userId);
  res.status(httpStatus.OK).send({
    status: 'success',
    data: stats,
  });
});

/**
 * Get user's commission earnings
 */
const getCommissionEarnings = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  const { startDate, endDate } = req.query;
  const filter = {
    wallet: wallet._id,
    type: 'commission',
  };

  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const earnings = await WalletTransaction.find(filter)
    .sort({ createdAt: -1 })
    .populate('reference', 'amount percentage baseAmount bonus');

  const totalEarnings = earnings.reduce((sum, transaction) => sum + transaction.amount, 0);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      totalEarnings,
      transactions: earnings,
    },
  });
});

/**
 * Get user's withdrawal history
 */
const getWithdrawalHistory = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  const { startDate, endDate } = req.query;
  const filter = {
    wallet: wallet._id,
    type: 'withdrawal',
  };

  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const withdrawals = await WalletTransaction.find(filter)
    .sort({ createdAt: -1 })
    .populate('reference', 'status bankAccount paymentDetails');

  const totalWithdrawn = withdrawals.reduce((sum, transaction) => sum + transaction.amount, 0);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      totalWithdrawn,
      transactions: withdrawals,
    },
  });
});

/**
 * Get user's pending withdrawals
 */
const getPendingWithdrawals = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  const filter = {
    wallet: wallet._id,
    type: 'withdrawal',
    status: 'pending',
  };

  const pendingWithdrawals = await WalletTransaction.find(filter)
    .sort({ createdAt: -1 })
    .populate('reference', 'bankAccount');

  const totalPending = pendingWithdrawals.reduce((sum, transaction) => sum + transaction.amount, 0);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      totalPending,
      transactions: pendingWithdrawals,
    },
  });
});

/**
 * Get user's recent transactions
 */
const getRecentTransactions = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  const { limit = 5 } = req.query;
  const transactions = await WalletTransaction.find({ wallet: wallet._id })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit, 10))
    .populate('reference');

  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      transactions,
    },
  });
});

/**
 * Get user's transaction details
 */
const getTransactionDetails = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const wallet = await Wallet.findOne({ user: userId });
  
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  const transaction = await WalletTransaction.findById(req.params.transactionId)
    .populate('reference');

  if (!transaction) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Transaction not found');
  }

  if (transaction.wallet.toString() !== wallet._id.toString()) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Access denied');
  }

  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      transaction,
    },
  });
});

/**
 * Create wallet (called when user is created)
 */
const createWallet = catchAsync(async (userId) => {
  const existingWallet = await Wallet.findOne({ user: userId });
  if (existingWallet) {
    return existingWallet;
  }

  const wallet = await Wallet.create({
    user: userId,
  });

  // Create initial transaction
  await WalletTransaction.create({
    wallet: wallet._id,
    type: 'adjustment',
    amount: 0,
    balance: 0,
    status: 'completed',
    description: 'Wallet initialized',
  });

  return wallet;
});

/**
 * Update wallet balance (internal function)
 */
const updateWalletBalance = catchAsync(async (walletId, amount, type, reference, referenceModel, description) => {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  // Calculate new balance
  let newBalance = wallet.balance;
  if (type === 'commission') {
    newBalance += amount;
    wallet.totalEarnings += amount;
  } else if (type === 'withdrawal') {
    if (wallet.balance < amount) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient balance');
    }
    newBalance -= amount;
    wallet.totalWithdrawn += amount;
  }

  // Update wallet
  wallet.balance = newBalance;
  wallet.lastTransactionDate = new Date();
  await wallet.save();

  // Create transaction record
  const transaction = await WalletTransaction.create({
    wallet: wallet._id,
    type,
    amount,
    balance: newBalance,
    status: 'completed',
    reference,
    referenceModel,
    description,
  });

  return { wallet, transaction };
});

/**
 * Update wallet status (admin only)
 */
const updateWalletStatus = catchAsync(async (req, res) => {
  const { walletId } = req.params;
  const { status, reason } = req.body;

  const wallet = await Wallet.findById(walletId);
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  wallet.status = status;
  await wallet.save();

  // Create notification
  await createWalletStatusNotification(wallet.user, status, reason);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      wallet,
    },
  });
});

export {
  getWallet,
  getWalletTransactions,
  getWalletStats,
  getCommissionEarnings,
  getWithdrawalHistory,
  getPendingWithdrawals,
  getRecentTransactions,
  getTransactionDetails,
  createWallet,
  updateWalletBalance,
  updateWalletStatus,
}; 