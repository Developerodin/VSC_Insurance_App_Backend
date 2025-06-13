import httpStatus from 'http-status';
import { Wallet, WalletTransaction, User, Notification } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { pick } from '../utils/pick.js';

// Get wallet details
export const getWallet = catchAsync(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user.id })
    .populate('user', 'name email');

  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  res.send(wallet);
});

// Get wallet transactions
export const getWalletTransactions = catchAsync(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user.id });
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  const filter = { wallet: wallet._id };
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  if (req.query.type) filter.type = req.query.type;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.startDate && req.query.endDate) {
    filter.createdAt = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  const transactions = await WalletTransaction.paginate(filter, {
    ...options,
    populate: 'reference',
  });

  res.send(transactions);
});

// Create wallet (called when user is created)
export const createWallet = catchAsync(async (userId) => {
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

// Update wallet balance (internal function)
export const updateWalletBalance = catchAsync(async (walletId, amount, type, reference, referenceModel, description) => {
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
  wallet.lastTransactionAt = new Date();
  await wallet.save();

  // Create transaction record
  const transaction = await WalletTransaction.create({
    wallet: walletId,
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

// Get wallet statistics
export const getWalletStats = catchAsync(async (req, res) => {
  const wallet = await Wallet.findOne({ user: req.user.id });
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  const stats = await WalletTransaction.aggregate([
    { $match: { wallet: wallet._id } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);

  res.send({
    wallet,
    stats,
  });
});

// Update wallet status (admin only)
export const updateWalletStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const wallet = await Wallet.findById(req.params.walletId);
  if (!wallet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Wallet not found');
  }

  wallet.status = status;
  await wallet.save();

  // Create notification for user
  await Notification.create({
    recipient: wallet.user,
    type: 'wallet_status_change',
    title: 'Wallet Status Updated',
    message: `Your wallet status has been updated to: ${status}`,
    channels: ['in_app', 'email'],
    data: {
      walletId: wallet._id,
      status,
    },
  });

  res.send(wallet);
});

export default {
  getWallet,
  getWalletTransactions,
  createWallet,
  updateWalletBalance,
  getWalletStats,
  updateWalletStatus,
}; 